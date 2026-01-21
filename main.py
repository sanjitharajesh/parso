import os
import sys
import json
import glob
from receipt_ocr import extract_receipt_text
from receipt_parser import parse_receipt

def process_multiple_receipts(image_paths):
    """Process multiple images of the same receipt"""
    
    #print(f"Processing {len(image_paths)} images...\n")
    
    all_text = []
    
    for i, image_path in enumerate(image_paths, 1):
        print(f"[{i}/{len(image_paths)}] {image_path}")
        raw_text = extract_receipt_text(image_path)
        
        if raw_text:
            all_text.append(raw_text)
    
    if not all_text:
        print("No text extracted")
        return None
    
    combined_text = "\n\n--- NEXT IMAGE ---\n\n".join(all_text)
    
    #print("\nParsing receipt data...")
    parsed_json = parse_receipt(combined_text)
    
    try:
        if parsed_json.startswith('```'):
            parsed_json = parsed_json.split('```')[1]
            if parsed_json.startswith('json'):
                parsed_json = parsed_json[4:]
        
        data = json.loads(parsed_json.strip())
        print("Receipt parsed\n")
        return data
        
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON: {e}")
        return None

def display_receipt(data):
    """Pretty print receipt data"""
    
    print("RECEIPT SUMMARY")
    
    if data.get('store_name'):
        print(f"Store: {data['store_name']}")
    if data.get('date'):
        print(f"Date: {data['date']}")
    
    print("\nItems:")
    for item in data.get('items', []):
        price = item.get('price') or 0
        print(f"  • {item['name']}: ${price:.2f}")
    
    subtotal = data.get('subtotal') or 0
    tax = data.get('tax') or 0
    total = data.get('total') or 0
    
    print(f"\nSubtotal: ${subtotal:.2f}")
    if tax:
        print(f"Tax: ${tax:.2f}")
    print(f"Total: ${total:.2f}")
    
if __name__ == "__main__":
    
    if len(sys.argv) > 1:
        image_paths = sys.argv[1:]
        
        missing = [p for p in image_paths if not os.path.exists(p)]
        if missing:
            print(f"Files not found: {', '.join(missing)}")
            exit()
    else:
        patterns = ['receipts/*.[jJ][pP][gG]', 'receipts/*.[jJ][pP][eE][gG]', 
                   'receipts/*.[pP][nN][gG]', 'receipts/*.[hH][eE][iI][cC]']
        image_paths = []
        for pattern in patterns:
            image_paths.extend(glob.glob(pattern))
        
        if not image_paths:
            print("No receipts found")
            exit()
        
        image_paths.sort()
    
    data = process_multiple_receipts(image_paths)
    
    if data:
        display_receipt(data)
        
        output_file = "parsed_receipt.json"
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"\nSaved to {output_file}")