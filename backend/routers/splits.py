from fastapi import APIRouter, HTTPException
from models.schemas import SplitRequest, SplitResponse
from services.split_service import calculate_split

router = APIRouter()

@router.post("/calculate", response_model=SplitResponse)
async def calculate_split_endpoint(request: SplitRequest):
    """Calculate split based on shared items and individual assignments"""
    try:
        items = request.receipt_data.items
        
        # Get shared items
        shared_items = [items[i] for i in request.shared_item_indices if i < len(items)]
        
        # Get individual assignments
        individual_assignments = {}
        for person, item_indices in request.individual_assignments.items():
            individual_assignments[person] = [items[i].dict() for i in item_indices if i < len(items)]
        
        totals, final_assignments = calculate_split(
            [item.dict() for item in shared_items],
            individual_assignments,
            request.participants
        )
        
        return {
            "participants": request.participants,
            "assignments": final_assignments,
            "totals": totals
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))