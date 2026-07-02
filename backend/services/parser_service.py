import os
import json
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

# Items are allowed to deviate from subtotal by this fraction before flagging
_TOLERANCE = 0.05


def _get_client() -> AzureOpenAI:
    return AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_KEY"),
        api_version="2024-02-15-preview",
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    )


def _call_gpt(client: AzureOpenAI, prompt: str) -> str:
    response = client.chat.completions.create(
        model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0,
        max_tokens=2000,
    )
    return response.choices[0].message.content


def _build_prompt(raw_text: str) -> str:
    return f"""Parse this receipt into JSON format. This may be from multiple photos of the same receipt.

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


def _build_retry_prompt(raw_text: str, failure_reason: str) -> str:
    return f"""Your previous extraction had a problem: {failure_reason}.

Re-extract this receipt carefully, fixing the issue above.

Requirements:
- items must be a non-empty array — extract every line item you can see
- Every item must have a non-zero price
- total must be present and greater than zero
- The sum of item prices should approximately match subtotal (if shown on the receipt)

Receipt text:
{raw_text}

Return ONLY valid JSON with keys: store_name, date, items (array of {{name, price}}), subtotal, tax, total."""


def _validate(data: dict) -> str | None:
    """Returns a failure reason string, or None if the extraction looks correct."""
    items = data.get("items") or []
    total = data.get("total") or 0
    subtotal = data.get("subtotal") or 0

    if not items:
        return "items array is empty — no line items were extracted"

    if not total:
        return "total is missing or zero"

    items_sum = sum(item.get("price", 0) for item in items)

    if items_sum == 0:
        return "all line item prices are zero"

    if subtotal:
        deviation = abs(items_sum - subtotal) / subtotal
        if deviation > _TOLERANCE:
            return (
                f"line items sum to {items_sum:.2f} but subtotal is {subtotal:.2f} "
                f"({deviation*100:.0f}% deviation)"
            )
    elif items_sum > total * 1.1:
        # Without a subtotal, items shouldn't exceed the total
        return f"line items sum to {items_sum:.2f} which exceeds total {total:.2f}"

    return None


def parse_receipt(raw_text: str) -> dict:
    """Extract structured receipt data from OCR text.

    Tries once, validates the result, and retries with a targeted prompt if
    validation fails. Raises ValueError if both attempts produce bad output.
    """
    client = _get_client()

    # --- First attempt ---
    raw = _call_gpt(client, _build_prompt(raw_text))
    try:
        data = json.loads(raw)
        failure_reason = _validate(data)
    except (json.JSONDecodeError, TypeError):
        failure_reason = "the response was not valid JSON"
        data = None

    if failure_reason is None:
        return data

    # --- Single retry with the specific failure reason ---
    raw = _call_gpt(client, _build_retry_prompt(raw_text, failure_reason))
    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        raise ValueError("Failed to parse receipt data, please try again")

    failure_reason = _validate(data)
    if failure_reason:
        raise ValueError("Failed to parse receipt data, please try again")

    return data
