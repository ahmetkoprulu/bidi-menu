import easyocr
import logging
from typing import List, Dict
import re

class OCRService:
    def __init__(self):
        try:
            # Initialize EasyOCR with English language
            self.reader = easyocr.Reader(['en'])
            logging.info("OCR Service initialized successfully")
        except Exception as e:
            logging.error(f"Failed to initialize OCR Service: {str(e)}")
            raise

    def process_image(self, image_path: str) -> List[Dict]:
        """Process an image and extract menu items."""
        try:
            logging.info(f"Processing image: {image_path}")
            
            # Read text from image
            results = self.reader.readtext(image_path)
            logging.info(f"Found {len(results)} text regions")
            
            # Process results into menu items
            menu_items = self._parse_menu_items(results)
            logging.info(f"Extracted {len(menu_items)} menu items")
            
            return menu_items
            
        except Exception as e:
            logging.error(f"Error processing image: {str(e)}")
            raise Exception(f"Failed to process menu image: {str(e)}")

    def _parse_menu_items(self, results: List) -> List[Dict]:
        """Parse OCR results into menu items."""
        menu_items = []
        current_item = None
        
        for _, text, _ in results:
            text = text.strip()
            if not text:
                continue
                
            # Try to extract price
            price_match = re.search(r'\$?\s*(\d+\.?\d*)', text)
            
            if price_match:
                # If we find a price and have a current item, save it
                if current_item:
                    try:
                        price = float(price_match.group(1))
                        current_item["price"] = price
                        menu_items.append(current_item)
                        current_item = None
                    except ValueError:
                        pass
            else:
                # If no price found, this might be an item name
                # Skip common headers and short texts
                if len(text) > 3 and not any(header in text.lower() for header in ["menu", "breakfast", "lunch", "dinner", "appetizer", "dessert"]):
                    current_item = {
                        "name": text,
                        "price": 0.0,
                        "description": ""
                    }
        
        # Add the last item if it exists
        if current_item and current_item["price"] > 0:
            menu_items.append(current_item)
        
        return menu_items

    def validate_extraction(self, menu_items):
        """Validate the extracted menu items."""
        return len(menu_items) > 0 