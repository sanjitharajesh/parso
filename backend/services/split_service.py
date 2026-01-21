from typing import List, Dict

def calculate_split(shared_items: List[dict], individual_assignments: Dict[str, List[dict]], participants: List[str]):
    """Calculate final split totals"""
    
    totals = {person: 0 for person in participants}
    final_assignments = {person: [] for person in participants}
    
    # Add shared items (split equally)
    shared_total = sum(item.get('price', 0) for item in shared_items)
    shared_per_person = shared_total / len(participants) if participants else 0
    
    for person in participants:
        totals[person] += shared_per_person
        if shared_items:
            final_assignments[person].append({
                'name': f'Shared items ({len(shared_items)} items)',
                'price': shared_per_person,
                'split': True
            })
    
    # Add individual items
    for person, items in individual_assignments.items():
        for item in items:
            totals[person] += item['price']
            final_assignments[person].append({
                'name': item['name'],
                'price': item['price'],
                'split': item.get('split_with') is not None,
                'split_with': item.get('split_with')
            })
    
    return totals, final_assignments