import os
import requests
from dotenv import load_dotenv

load_dotenv()

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

def get_group_members(group_id):
    """Get members of a specific group"""
    api_key = os.getenv("SPLITWISE_API_KEY")
    
    response = requests.get(
        f"https://secure.splitwise.com/api/v3.0/get_group/{group_id}",
        headers={"Authorization": f"Bearer {api_key}"}
    )
    
    if response.status_code == 200:
        return response.json()['group']['members']
    return []

def create_expense(group_id, description, total, user_splits):
    """
    Create expense in Splitwise
    
    Args:
        group_id: Splitwise group ID
        description: Expense description
        total: Total amount
        user_splits: Dict of {user_id: amount_owed}
    
    Returns:
        Expense object if successful, None otherwise
    """
    api_key = os.getenv("SPLITWISE_API_KEY")
    
    expense_data = {
        "cost": total,
        "description": description,
        "group_id": group_id,
        "split_equally": False,
        "users": []
    }
    
    for user_id, amount in user_splits.items():
        expense_data["users"].append({
            "user_id": user_id,
            "owed_share": amount
        })
    
    response = requests.post(
        "https://secure.splitwise.com/api/v3.0/create_expense",
        headers={"Authorization": f"Bearer {api_key}"},
        json=expense_data
    )
    
    if response.status_code == 200:
        return response.json()['expenses'][0]
    return None