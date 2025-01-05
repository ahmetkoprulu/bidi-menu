from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
import logging
from pathlib import Path
from services.file_service import save_upload_file
from models.models import Model as DBModel
from database import get_db
from schemas import Model, ModelCreate

router = APIRouter(prefix="/api/models", tags=["models"])

@router.post("/upload/{menu_item_id}", response_model=Model)
async def upload_model(
    menu_item_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> Model:
    try:
        # Save the uploaded file
        file_path = await save_upload_file(file, "models")
        
        # Create model record
        model = DBModel(
            menu_item_id=menu_item_id,
            file_path=file_path,
            file_size=file.size,
            format=Path(file.filename).suffix.lstrip('.'),
            model_metadata="{}"  # Default empty JSON
        )
        
        db.add(model)
        db.commit()
        db.refresh(model)
        
        return model
    except Exception as e:
        db.rollback()
        logging.error(f"Error uploading model: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{menu_item_id}", response_model=Model)
async def get_model(
    menu_item_id: str,
    db: Session = Depends(get_db)
) -> Model:
    try:
        model = db.query(DBModel).filter(DBModel.menu_item_id == menu_item_id).first()
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
        return model
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting model: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{menu_item_id}")
async def delete_model(
    menu_item_id: str,
    db: Session = Depends(get_db)
):
    try:
        model = db.query(DBModel).filter(DBModel.menu_item_id == menu_item_id).first()
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
        
        # Delete the file
        try:
            Path(model.file_path).unlink(missing_ok=True)
        except Exception as e:
            logging.error(f"Error deleting model file: {str(e)}")
        
        # Delete from database
        db.delete(model)
        db.commit()
        
        return {"message": "Model deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error deleting model: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{menu_item_id}/download")
async def download_model(menu_item_id: int):
    """Download a model file."""
    try:
        model_info = model_service.get_model_info(menu_item_id)
        if not model_info:
            raise HTTPException(status_code=404, detail="Model not found")
        
        file_path = Path("storage/models") / model_info["file_path"]
        return FileResponse(
            path=file_path,
            filename=f"model.{model_info['format']}",
            media_type="application/octet-stream"
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error downloading model: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 