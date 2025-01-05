import os
from pathlib import Path
from fastapi import UploadFile, HTTPException
from typing import Optional

ALLOWED_IMAGE_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'application/pdf': '.pdf'
}

ALLOWED_MODEL_TYPES = {
    'model/gltf-binary': '.glb',
    'model/gltf+json': '.gltf',
    'application/octet-stream': '.glb'  # Some browsers send GLB files with this type
}

async def save_upload_file(file: UploadFile, folder: str) -> str:
    """Save an uploaded file and return its path."""
    try:
        # Create storage directory if it doesn't exist
        storage_path = Path("storage") / folder
        storage_path.mkdir(parents=True, exist_ok=True)

        # Validate file type based on folder
        if folder == "uploads":
            if file.content_type not in ALLOWED_IMAGE_TYPES:
                raise HTTPException(status_code=400, detail="Invalid file type")
            extension = ALLOWED_IMAGE_TYPES[file.content_type]
        elif folder == "models":
            # For models, also check file extension as fallback
            file_ext = Path(file.filename).suffix.lower()
            if file.content_type not in ALLOWED_MODEL_TYPES and file_ext not in ['.glb', '.gltf']:
                raise HTTPException(status_code=400, detail="Invalid file type")
            extension = file_ext
        else:
            raise HTTPException(status_code=400, detail="Invalid folder")

        # Generate unique filename
        filename = f"{Path(file.filename).stem}_{os.urandom(8).hex()}{extension}"
        file_path = storage_path / filename

        # Save file
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        return str(file_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

def validate_image(file_path: str) -> bool:
    """Validate if a file is a valid image that can be processed."""
    try:
        extension = Path(file_path).suffix.lower()
        return extension in ['.jpg', '.jpeg', '.png', '.pdf']
    except Exception:
        return False 