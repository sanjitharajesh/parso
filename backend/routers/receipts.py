from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os
import shutil
from services.ocr_service import extract_receipt_text
from services.parser_service import parse_receipt
from models.schemas import ParsedReceipt
import json

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=ParsedReceipt)
async def upload_receipts(files: List[UploadFile] = File(...)):
    """Upload one or more receipt images and return parsed data"""
    try:
        saved_paths = []
        
        for file in files:
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_paths.append(file_path)
        
        all_text = []
        for path in saved_paths:
            text = extract_receipt_text(path)
            if text:
                all_text.append(text)
        
        if not all_text:
            raise HTTPException(status_code=400, detail="Failed to extract text from images")
        
        combined_text = "\n\n--- NEXT IMAGE ---\n\n".join(all_text)
        
        parsed_json = parse_receipt(combined_text)
        
        if parsed_json.startswith('```'):
            parsed_json = parsed_json.split('```')[1]
            if parsed_json.startswith('json'):
                parsed_json = parsed_json[4:]
        
        data = json.loads(parsed_json.strip())
        
        for path in saved_paths:
            if os.path.exists(path):
                os.remove(path)
        
        return data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))