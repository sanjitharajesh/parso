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

def create_expense(group_id: int, description: str, total: float, user_splits: dict):
    """Create expense in Splitwise"""
    api_key = os.getenv("SPLITWISE_API_KEY")
    
    users = []
    for user_id, amount in user_splits.items():
        users.append({
            "user_id": int(user_id),
            "owed_share": str(amount)
        })
    
    expense_data = {
        "cost": str(total),
        "description": description,
        "group_id": group_id,
        "split_equally": False,
        "users": users
    }
    
    print("DEBUG: Sending to Splitwise:", expense_data)  # Debug
    
    response = requests.post(
        "https://secure.splitwise.com/api/v3.0/create_expense",
        headers={"Authorization": f"Bearer {api_key}"},
        json=expense_data
    )
    
    print("DEBUG: Splitwise status code:", response.status_code)  # Debug
    print("DEBUG: Splitwise response:", response.json())  # Debug
    
    if response.status_code == 200:
        return response.json()['expenses'][0]
    return None