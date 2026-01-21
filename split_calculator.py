import json

def get_participants():
    """Get list of people splitting the bill"""
    print("WHO IS SPLITTING THIS BILL?")
    
    participants_input = input("Enter names separated by commas: ")
    participants = [name.strip() for name in participants_input.split(',')]
    
    print(f"\nGot {len(participants)} people: {', '.join(participants)}\n")
    return participants

def select_shared_items(items):
    """Select items to split equally among everyone"""
    
    print("SELECT SHARED ITEMS (split equally)")
    print("Enter item numbers separated by commas, or 'none'\n")
    
    # Display all items
    for i, item in enumerate(items, 1):
        name = item['name']
        price = item.get('price') or 0
        print(f"[{i}] {name} - ${price:.2f}")
    
    while True:
        choice = input("\nShared items: ").strip().lower()
        
        if choice == 'none':
            return []
        
        try:
            indices = [int(x.strip()) for x in choice.split(',')]
            shared = []
            for idx in indices:
                if 1 <= idx <= len(items):
                    shared.append(items[idx - 1])
                else:
                    print(f"Invalid number: {idx}")
                    raise ValueError
            
            print(f"\nSelected {len(shared)} shared items")
            return shared
            
        except ValueError:
            print("Invalid input. Enter numbers like: 1,2,5 or 'none'")

def assign_remaining_items(remaining_items, participants):
    """Assign remaining items to individuals or split between specific people"""
    
    if not remaining_items:
        print("\nNo remaining items to assign!")
        return {person: [] for person in participants}
    
    assignments = {person: [] for person in participants}
    
    print("ASSIGN REMAINING ITEMS")
    print(f"Options: Enter name(s) separated by commas, or 'skip'\n")
    
    for i, item in enumerate(remaining_items, 1):
        name = item['name']
        price = item.get('price') or 0
        
        print(f"\n[{i}/{len(remaining_items)}] {name} - ${price:.2f}")
        
        while True:
            choice = input("  → ").strip()
            
            if choice.lower() == 'skip':
                break
            
            # Parse input as comma-separated names
            input_names = [n.strip() for n in choice.split(',')]
            
            # Validate all names
            valid_people = []
            for name_input in input_names:
                matched = [p for p in participants if p.lower() == name_input.lower()]
                if matched:
                    valid_people.append(matched[0])
            
            if valid_people:
                if len(valid_people) == 1:
                    # Single person
                    person = valid_people[0]
                    assignments[person].append({
                        'name': name,
                        'price': price
                    })
                    print(f"  Assigned to {person}")
                else:
                    # Split between multiple people
                    split_price = price / len(valid_people)
                    for person in valid_people:
                        assignments[person].append({
                            'name': name,
                            'price': split_price,
                            'split_with': valid_people
                        })
                    print(f"  Split ${split_price:.2f} each among {', '.join(valid_people)}")
                break
            else:
                print(f"  Invalid names. Options: {', '.join(participants)}, skip")
    
    return assignments

def calculate_split(shared_items, individual_assignments, participants):
    """Calculate final totals"""
    
    totals = {person: 0 for person in participants}
    final_assignments = {person: [] for person in participants}
    
    # Add shared items (split equally)
    shared_total = sum(item.get('price', 0) for item in shared_items)
    shared_per_person = shared_total / len(participants)
    
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

def display_split(participants, assignments, totals):
    """Show final breakdown"""
    
    print("FINAL SPLIT")
    
    for person in participants:
        print(f"\n{person}: ${totals[person]:.2f}")
        for item in assignments[person]:
            if item.get('split') and not item.get('split_with'):
                marker = " (split equally)"
            elif item.get('split_with'):
                others = [p for p in item['split_with'] if p != person]
                marker = f" (split with {', '.join(others)})" if others else " (split)"
            else:
                marker = ""
            print(f"  • {item['name']}: ${item['price']:.2f}{marker}")
    
    print(f"Grand Total: ${sum(totals.values()):.2f}")
    
def split_receipt(receipt_data):
    """Main split flow"""
    
    participants = get_participants()
    items = receipt_data.get('items', [])
    
    # Step 1: Select shared items
    shared_items = select_shared_items(items)
    
    # Step 2: Assign remaining items
    remaining = [item for item in items if item not in shared_items]
    individual_assignments = assign_remaining_items(remaining, participants)
    
    # Step 3: Calculate totals
    totals, final_assignments = calculate_split(shared_items, individual_assignments, participants)
    
    # Step 4: Display
    display_split(participants, final_assignments, totals)
    
    return {
        'participants': participants,
        'assignments': final_assignments,
        'totals': totals
    }

if __name__ == "__main__":
    # Load parsed receipt
    with open('parsed_receipt.json', 'r') as f:
        receipt = json.load(f)
    
    split_data = split_receipt(receipt)
    
    # Save split data
    with open('split_data.json', 'w') as f:
        json.dump(split_data, f, indent=2)
    
    print("\nSaved to split_data.json")