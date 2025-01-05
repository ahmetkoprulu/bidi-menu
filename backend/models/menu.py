from pydantic import BaseModel
from typing import Optional

class MenuItem(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    category: Optional[str] = None 