from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List
import logging
from pathlib import Path
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from services.ocr_service import OCRService
from services.file_service import save_upload_file
from services.qr_service import QRService
from models.models import MenuItem as DBMenuItem, QRCode as DBQRCode, Model as DBModel
from database import get_db
from schemas import MenuItem, MenuResponse

router = APIRouter(prefix="/api/menu", tags=["menu"])
ocr_service = OCRService()
qr_service = QRService()

@router.post("/upload")
async def upload_menu(file: UploadFile = File(...), db: Session = Depends(get_db)) -> List[dict]:
    try:
        logging.info(f"Processing menu upload: {file.filename}")
        
        # Save the uploaded file
        file_path = await save_upload_file(file, "uploads")
        logging.info(f"File saved to: {file_path}")
        
        # Process the menu image
        menu_items = ocr_service.process_image(file_path)
        logging.info(f"Extracted menu items: {menu_items}")
        
        if not menu_items:
            logging.warning("No menu items could be extracted from the image")
            raise HTTPException(status_code=400, detail="No menu items could be extracted from the image")
        
        # Create menu items in database
        processed_items = []
        for item in menu_items:
            # Generate a unique ID for each menu item
            item_id = str(uuid.uuid4())
            logging.info(f"Creating menu item: {item_id} - {item['name']}")
            
            menu_item = DBMenuItem(
                id=item_id,
                name=item["name"],
                description=item.get("description", ""),
                price=item["price"],
                has_model=False
            )
            db.add(menu_item)
            
            # Add ID to the item for frontend reference
            item["id"] = item_id
            processed_items.append(item)
        
        try:
            db.commit()
            logging.info("Successfully saved menu items to database")
        except Exception as e:
            db.rollback()
            logging.error(f"Error saving menu items: {str(e)}")
            raise HTTPException(status_code=500, detail="Error saving menu items")
        
        return processed_items
    except Exception as e:
        logging.error(f"Error processing menu upload: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/items", response_model=List[MenuItem])
async def get_menu_items(
    skip: int = 0,
    limit: int = 100,
    menu_id: str = None,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(DBMenuItem).join(
            DBModel,
            DBMenuItem.id == DBModel.menu_item_id,
            isouter=True
        ).add_columns(
            DBMenuItem.id,
            DBMenuItem.name,
            DBMenuItem.description,
            DBMenuItem.price,
            DBMenuItem.has_model,
            DBModel.file_path.label('model_url')
        )

        if menu_id:
            query = query.filter(DBMenuItem.menu_id == menu_id)

        items = query.offset(skip).limit(limit).all()
        
        # Convert SQLAlchemy objects to dictionaries
        result = []
        for item in items:
            # Remove storage/ prefix and keep only models/filename.glb
            model_path = item.model_url.replace('storage/', '', 1) if item.model_url else None
            item_dict = {
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'price': item.price,
                'has_model': item.has_model,
                'model_url': f"/{model_path}" if model_path else None
            }
            result.append(item_dict)
        
        return result
    except Exception as e:
        logging.error(f"Error fetching menu items: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-qr", response_model=MenuResponse)
async def generate_qr(
    menu_data: dict,
    db: Session = Depends(get_db)
) -> MenuResponse:
    try:
        # Generate a unique ID for this menu
        menu_id = str(uuid.uuid4())
        menu_items_map = {}  # To store original ID to new ID mapping
        
        # Update existing menu items with menu_id
        for item_data in menu_data["menuItems"]:
            item_id = item_data["id"]
            menu_item = db.query(DBMenuItem).filter(DBMenuItem.id == item_id).first()
            if menu_item:
                menu_item.menu_id = menu_id
                menu_items_map[item_id] = item_id
        
        # Generate QR code
        qr_result = await qr_service.generate_menu_qr(menu_id)
        
        # Save QR code info to database
        qr_code = DBQRCode(
            menu_id=menu_id,
            url_path=qr_result["menu_url"],
            file_path=qr_result["qr_code_url"],
            created_at=datetime.now()
        )
        db.add(qr_code)
        db.commit()
        
        return MenuResponse(
            menu_id=menu_id,
            qr_code_url=qr_result["qr_code_url"],
            menu_url=qr_result["menu_url"],
            menu_items=menu_items_map
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e)) 