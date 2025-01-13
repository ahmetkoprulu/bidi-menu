from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.menu import router as menu_router
from api.model import router as model_router
from database import init_db
import mimetypes

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3000", "http://localhost:3001", "http://192.168.1.37:3000", "http://192.168.1.37:3001", "https://localhost:3000", "https://localhost:3001", "https://192.168.1.37:3000", "https://192.168.1.37:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create storage directories
import os
os.makedirs("storage/qrcodes", exist_ok=True)
os.makedirs("storage/models", exist_ok=True)

# Add MIME types
mimetypes.add_type('model/vnd.usdz+zip', '.usdz')
mimetypes.add_type('model/gltf-binary', '.glb')

# Mount static files
app.mount("/qrcodes", StaticFiles(directory="storage/qrcodes"), name="qrcodes")
app.mount("/models", StaticFiles(directory="storage/models"), name="models")

# Include routers
app.include_router(menu_router)
app.include_router(model_router)

@app.on_event("startup")
async def startup_event():
    init_db()  # Initialize database tables

@app.get("/")
async def root():
    return {"message": "Welcome to BiDi Menu API"} 