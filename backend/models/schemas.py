from pydantic import BaseModel
from typing import List, Optional, Dict

class ReceiptItem(BaseModel):
    name: str
    price: float

class ParsedReceipt(BaseModel):
    store_name: Optional[str] = None
    date: Optional[str] = None
    items: List[ReceiptItem]
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    total: Optional[float] = None

class ItemAssignment(BaseModel):
    name: str
    price: float
    split: Optional[bool] = False
    split_with: Optional[List[str]] = None

class SplitRequest(BaseModel):
    receipt_data: ParsedReceipt
    participants: List[str]
    shared_item_indices: List[int]
    individual_assignments: Dict[str, List[int]]

class SplitResponse(BaseModel):
    participants: List[str]
    assignments: Dict[str, List[ItemAssignment]]
    totals: Dict[str, float]

class SplitwiseGroup(BaseModel):
    id: int
    name: str

class SplitwiseMember(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None

class CreateExpenseRequest(BaseModel):
    group_id: int
    description: str
    total: float
    user_splits: Dict[int, float]