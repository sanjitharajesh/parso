import os
import requests
from dotenv import load_dotenv
from PIL import Image
from pillow_heif import register_heif_opener
import glob
import shutil

load_dotenv()

# Register HEIC support
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
        
        # Create converted folder if it doesn't exist
        converted_dir = "receipts/converted"
        os.makedirs(converted_dir, exist_ok=True)
        
        # Save converted file
        filename = os.path.basename(image_path).rsplit('.', 1)[0] + '.jpg'
        converted_path = os.path.join(converted_dir, filename)
        img.convert('RGB').save(converted_path, 'JPEG')
        
        image_path = converted_path
    
    # Read and send image
    with open(image_path, 'rb') as img:
        response = requests.post(url, headers=headers, data=img)
    
    if response.status_code != 200:
        print(f"Error: {response.status_code}")
        print(response.json())
        return None
    
    result = response.json()
    
    # Extract all text lines
    lines = []
    for region in result.get('regions', []):
        for line in region.get('lines', []):
            text = ' '.join([word['text'] for word in line['words']])
            lines.append(text)
    
    return '\n'.join(lines)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        receipt_path = sys.argv[1]
    else:
        patterns = ['receipts/*.[jJ][pP][gG]', 'receipts/*.[jJ][pP][eE][gG]', 
                   'receipts/*.[pP][nN][gG]', 'receipts/*.[hH][eE][iI][cC]']
        found = []
        for pattern in patterns:
            found.extend(glob.glob(pattern))
        
        if found:
            receipt_path = found[0]
            print(f"Auto-detected: {receipt_path}")
        else:
            print("No receipts found in receipts/ folder")
            exit()
    
    if not os.path.exists(receipt_path):
        print(f"File not found: {receipt_path}")
    else:
        print(f"Extracting text from: {receipt_path}")
        text = extract_receipt_text(receipt_path)
        
        if text:
            print("\n EXTRACTED TEXT:")
            print(text)
        else:
            print("Failed to extract text")