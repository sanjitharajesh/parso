import os
import json
import requests
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

SPLITWISE_BASE_URL = "https://secure.splitwise.com/api/v3.0"

def get_current_user():
    """Get current Splitwise user info"""
    api_key = os.getenv("SPLITWISE_API_KEY")
    
    response = requests.get(
        "https://secure.splitwise.com/api/v3.0/get_current_user",
        headers={"Authorization": f"Bearer {api_key}"}
    )
    
    if response.status_code == 200:
        return response.json()['user']
    return None

def get_groups():
    """Fetch user's Splitwise groups"""
    api_key = os.getenv("SPLITWISE_API_KEY")
    
    response = requests.get(
        "https://secure.splitwise.com/api/v3.0/get_groups",
        headers={"Authorization": f"Bearer {api_key}"}
    )
    
    if response.status_code == 200:
        return response.json()['groups']
    return []

def get_group_members(group_id: int):
    """Get members of a specific group"""
    api_key = os.getenv("SPLITWISE_API_KEY")
    
    response = requests.get(
        f"https://secure.splitwise.com/api/v3.0/get_group/{group_id}",
        headers={"Authorization": f"Bearer {api_key}"}
    )
    
    if response.status_code == 200:
        return response.json()['group']['members']
    return []

def create_expense(group_id: int, description: str, total: float,
                  user_splits: dict, paid_by_user_id: int):
    """Create expense in Splitwise using form-encoded data"""

    # Splitwise expects form data, not JSON for users array
    data = {
        "cost": str(total),
        "description": description,
        "group_id": str(group_id),
        "split_equally": "false"
    }

    # Add users in the format Splitwise expects
    user_index = 0
    for user_id_str, amount in user_splits.items():
        user_id = int(user_id_str)

        data[f"users__{user_index}__user_id"] = str(user_id)
        data[f"users__{user_index}__owed_share"] = str(amount)
        data[f"users__{user_index}__paid_share"] = str(total) if user_id == paid_by_user_id else "0.0"

        user_index += 1

    print("=" * 60)
    print("EXPENSE DATA BEING SENT:")
    for key, value in data.items():
        print(f"  {key}: {value}")
    print("=" * 60)

    response = requests.post(
        f"{SPLITWISE_BASE_URL}/create_expense",
        headers={
            "Authorization": f"Bearer {os.getenv('SPLITWISE_API_KEY')}",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data=data
    )

    print(f"Response Status: {response.status_code}")
    print(f"Response Body: {response.text}")
    print("=" * 60)

    if response.status_code not in [200, 201]:
        result = response.json()
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Splitwise API rejected the request",
                "status_code": response.status_code,
                "errors": result.get("errors", result)
            }
        )

    result = response.json()

    if "expenses" in result and len(result["expenses"]) > 0:
        expense = result["expenses"][0]
    elif "expense" in result:
        expense = result["expense"]
    else:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected response format: {result}"
        )

    return {
        "expense_id": expense.get("id"),
        "expense_url": f"https://www.splitwise.com/expenses/{expense.get('id')}",
        "message": "Expense created successfully"
    }