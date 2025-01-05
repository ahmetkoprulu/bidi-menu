from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, List

class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    has_model: Optional[bool] = False

class MenuItemCreate(MenuItemBase):
    pass

class MenuItem(MenuItemBase):
    id: str
    name: str
    description: str = ""
    price: float
    has_model: bool = False
    model_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ModelBase(BaseModel):
    file_path: str
    file_size: Optional[int] = None
    format: Optional[str] = None
    model_metadata: Optional[str] = None

class ModelCreate(ModelBase):
    menu_item_id: str

class Model(ModelBase):
    id: int
    menu_item_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class QRCodeBase(BaseModel):
    menu_id: str
    url_path: str
    file_path: str

class QRCode(QRCodeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class MenuResponse(BaseModel):
    menu_id: str
    qr_code_url: str
    menu_url: str
    menu_items: Dict[str, str]  # Mapping of original IDs to new IDs 