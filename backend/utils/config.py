import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
STORAGE_DIR = BASE_DIR / "storage"

# Storage paths
MODEL_STORAGE = STORAGE_DIR / "models"
QRCODE_STORAGE = STORAGE_DIR / "qrcodes"
UPLOAD_STORAGE = STORAGE_DIR / "uploads"

# Ensure storage directories exist
MODEL_STORAGE.mkdir(parents=True, exist_ok=True)
QRCODE_STORAGE.mkdir(parents=True, exist_ok=True)
UPLOAD_STORAGE.mkdir(parents=True, exist_ok=True)

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432"),
    "database": os.getenv("DB_NAME", "ar_menu"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "postgres"),
}

# Security configuration
HTTPS_ENABLED = True
SSL_CERT_FILE = os.getenv("SSL_CERT_FILE", "")
SSL_KEY_FILE = os.getenv("SSL_KEY_FILE", "")

# File upload limits
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_FORMATS = [".png", ".jpg", ".jpeg", ".pdf"]
ALLOWED_MODEL_FORMATS = [".glb", ".gltf"]

# API configuration
API_VERSION = "1.0.0"
API_PREFIX = "/api" 