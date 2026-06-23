export interface ReceiptItem {
  name: string;
  price: number;
}

export interface ParsedReceipt {
  store_name: string;
  date: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface SplitwiseGroup {
  id: number;
  name: string;
}

export interface SplitwiseMember {
  id: number;
  first_name: string;
  last_name?: string;
}

export interface ExpenseRequest {
  group_id: number;
  description: string;
  total: number;
  user_splits: Record<number, number>;
  paid_by_user_id: number;
}

export interface ExpenseResponse {
  expense_id: number;
  expense_url: string;
  message: string;
}
