from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    has_model = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    menu_id = Column(String, ForeignKey('qr_codes.menu_id'))

    # Relationships
    qr_code = relationship("QRCode", back_populates="menu_items")
    model = relationship("Model", back_populates="menu_item", uselist=False)

class Model(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, autoincrement=True)
    menu_item_id = Column(String, ForeignKey('menu_items.id'), unique=True)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)
    format = Column(String)
    model_metadata = Column(String)
    created_at = Column(DateTime, default=datetime.now)

    # Relationships
    menu_item = relationship("MenuItem", back_populates="model")

class QRCode(Base):
    __tablename__ = "qr_codes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    menu_id = Column(String, unique=True, nullable=False)
    url_path = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    # Relationships
    menu_items = relationship("MenuItem", back_populates="qr_code") 