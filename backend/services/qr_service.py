import qrcode
from pathlib import Path
import logging

class QRService:
    def __init__(self):
        self.storage_path = Path("storage/qrcodes")
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self.base_url = "https://192.168.1.37:3000/menu"  # Frontend URL

    async def generate_menu_qr(self, menu_id: str) -> dict:
        """Generate a QR code for a menu and return the URLs."""
        try:
            # Generate menu URL
            menu_url = f"{self.base_url}/{menu_id}"
            
            # Create QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(menu_url)
            qr.make(fit=True)

            # Create QR code image
            qr_image = qr.make_image(fill_color="black", back_color="white")
            
            # Save QR code
            qr_filename = f"menu-{menu_id}.png"
            qr_path = self.storage_path / qr_filename
            qr_image.save(qr_path)
            
            # Return URLs
            return {
                "menu_url": menu_url,
                "qr_code_url": f"/qrcodes/{qr_filename}"  # Relative to static file mount
            }
            
        except Exception as e:
            logging.error(f"Error generating QR code: {str(e)}")
            raise Exception("Failed to generate QR code") 