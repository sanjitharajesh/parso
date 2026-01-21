from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import SplitwiseGroup, SplitwiseMember, CreateExpenseRequest
from services.splitwise_service import get_groups, get_group_members, create_expense

router = APIRouter()

@router.get("/groups", response_model=List[SplitwiseGroup])
async def get_splitwise_groups():
    """Get user's Splitwise groups"""
    try:
        groups = get_groups()
        return [{"id": g['id'], "name": g['name']} for g in groups]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/groups/{group_id}/members", response_model=List[SplitwiseMember])
async def get_members(group_id: int):
    """Get members of a specific group"""
    try:
        members = get_group_members(group_id)
        return [{"id": m['id'], "first_name": m['first_name'], "last_name": m.get('last_name')} for m in members]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/expense")
async def create_splitwise_expense(request: CreateExpenseRequest):
    """Create expense in Splitwise"""
    try:
        print("DEBUG: Request received:", request.dict())  # Debug line
        
        expense = create_expense(
            request.group_id,
            request.description,
            request.total,
            request.user_splits
        )
        
        print("DEBUG: Splitwise API response:", expense)  # Debug line
        
        if expense:
            return {
                "success": True,
                "expense_id": expense['id'],
                "url": f"https://secure.splitwise.com/expenses/{expense['id']}"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create expense")
            
    except Exception as e:
        print("DEBUG: Error occurred:", str(e))  # Debug line
        import traceback
        traceback.print_exc()  # This will print full error
        raise HTTPException(status_code=500, detail=str(e))