import os
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
import json
import aiofiles
from utils.config import MODEL_STORAGE, ALLOWED_MODEL_FORMATS, MAX_UPLOAD_SIZE
import struct

class ModelService:
    @staticmethod
    async def save_model(file_path: Path, menu_item_id: int) -> dict:
        """Save and validate a 3D model file."""
        try:
            # Validate file format
            if file_path.suffix.lower() not in ALLOWED_MODEL_FORMATS:
                raise HTTPException(status_code=400, detail="Invalid model format")

            # Get file size
            file_size = os.path.getsize(file_path)
            if file_size > MAX_UPLOAD_SIZE:
                raise HTTPException(status_code=400, detail="Model file too large")

            # Create models directory if it doesn't exist
            model_dir = MODEL_STORAGE / str(menu_item_id)
            model_dir.mkdir(parents=True, exist_ok=True)

            # Generate model file path
            model_path = model_dir / f"model{file_path.suffix.lower()}"

            # Move the uploaded file to models directory
            os.rename(file_path, model_path)

            # Extract model metadata
            metadata = ModelService._extract_metadata(model_path)

            return {
                "file_path": str(model_path.relative_to(MODEL_STORAGE)),
                "file_size": file_size,
                "format": file_path.suffix.lower().lstrip('.'),
                "metadata": metadata
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing model: {str(e)}")

    @staticmethod
    def _extract_metadata(file_path: Path) -> dict:
        """Extract metadata from a 3D model file."""
        try:
            metadata = {}
            if file_path.suffix.lower() == '.glb':
                with open(file_path, 'rb') as f:
                    # Read GLB header
                    magic = f.read(4)
                    if magic == b'glTF':
                        version = struct.unpack('<I', f.read(4))[0]
                        length = struct.unpack('<I', f.read(4))[0]
                        metadata = {
                            "version": version,
                            "size": length
                        }
            elif file_path.suffix.lower() == '.gltf':
                with open(file_path, 'r') as f:
                    data = json.load(f)
                    metadata = {
                        "version": data.get("asset", {}).get("version"),
                        "generator": data.get("asset", {}).get("generator")
                    }
            return metadata
        except Exception:
            return {}

    @staticmethod
    def delete_model(menu_item_id: int) -> bool:
        """Delete a model and its associated files."""
        try:
            model_dir = MODEL_STORAGE / str(menu_item_id)
            if model_dir.exists():
                for file in model_dir.glob("*"):
                    file.unlink()
                model_dir.rmdir()
                return True
            return False
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deleting model: {str(e)}")

    @staticmethod
    def get_model_info(menu_item_id: int) -> dict:
        """Get information about a model."""
        try:
            model_dir = MODEL_STORAGE / str(menu_item_id)
            if not model_dir.exists():
                return None

            for ext in ALLOWED_MODEL_FORMATS:
                model_path = model_dir / f"model{ext}"
                if model_path.exists():
                    return {
                        "file_path": str(model_path.relative_to(MODEL_STORAGE)),
                        "file_size": os.path.getsize(model_path),
                        "format": ext.lstrip('.'),
                        "metadata": ModelService._extract_metadata(model_path)
                    }
            return None
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error getting model info: {str(e)}") 