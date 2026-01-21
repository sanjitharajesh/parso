import os
import requests
from dotenv import load_dotenv
from PIL import Image
from pillow_heif import register_heif_opener

load_dotenv()
register_heif_opener()

def extract_receipt_text(image_path):
    """Extract text from receipt using Azure Computer Vision OCR"""
    
    endpoint = os.getenv("AZURE_VISION_ENDPOINT")
    key = os.getenv("AZURE_VISION_KEY")
    
    url = f"{endpoint}/vision/v3.2/ocr"
    
    headers = {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/octet-stream'
    }
    
    # Convert HEIC to JPEG if needed
    converted_path = None
    if image_path.lower().endswith('.heic'):
        img = Image.open(image_path)
        converted_dir = "converted"
        os.makedirs(converted_dir, exist_ok=True)
        filename = os.path.basename(image_path).rsplit('.', 1)[0] + '.jpg'
        converted_path = os.path.join(converted_dir, filename)
        img.convert('RGB').save(converted_path, 'JPEG')
        image_path = converted_path
    
    with open(image_path, 'rb') as img:
        response = requests.post(url, headers=headers, data=img)
    
    if response.status_code != 200:
        return None
    
    result = response.json()
    
    lines = []
    for region in result.get('regions', []):
        for line in region.get('lines', []):
            text = ' '.join([word['text'] for word in line['words']])
            lines.append(text)
    
    return '\n'.join(lines)