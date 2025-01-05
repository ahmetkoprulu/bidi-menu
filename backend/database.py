from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# PostgreSQL connection URL
SQLALCHEMY_DATABASE_URL = "postgresql://root:1234@localhost:5432/bidi_menu"

# Create engine without check_same_thread argument (not needed for PostgreSQL)
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    """Initialize database tables without dropping existing ones."""
    # Import models here to avoid circular imports
    from models.models import MenuItem, Model, QRCode
    
    # Create tables only if they don't exist
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 