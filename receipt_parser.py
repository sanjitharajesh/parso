import os
import json
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

def parse_receipt(raw_text):
    """Use GPT to parse raw OCR text into structured receipt data"""
    
    client = AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_KEY"),
        api_version="2024-02-15-preview",
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
    )
    
    prompt = f"""Parse this receipt into JSON format. This may be from multiple photos of the same receipt.

IMPORTANT INSTRUCTIONS:
- Every item MUST have a price - look carefully for prices near each item name
- Prices often appear on the same line or the line immediately after the item
- If you see a price like "$7.99" near an item, that's the item's price
- Do NOT set price to 0 or null unless the item is truly free
- Look for patterns like "ITEM_NAME ... $X.XX" or "ITEM_NAME" followed by "$X.XX" on next line

Extract:
- store_name
- date
- items (array with name and price for EVERY item - NO null or 0 prices unless truly free)
- subtotal
- tax
- total

Receipt text:
{raw_text}

Return ONLY valid JSON, no other text."""

    response = client.chat.completions.create(
        model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=2000  # Increase token limit for longer receipts
    )
    
    return response.choices[0].message.content