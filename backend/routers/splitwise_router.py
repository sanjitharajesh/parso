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
        result = create_expense(
            request.group_id,
            request.description,
            request.total,
            request.user_splits,
            request.paid_by_user_id
        )

        return {
            "success": True,
            "expense_id": result["expense_id"],
            "url": result["expense_url"],
            "message": result["message"]
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Unexpected error creating expense",
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )