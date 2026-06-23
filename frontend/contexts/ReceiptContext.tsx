'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ParsedReceipt, ReceiptItem } from '@/lib/types';

interface ReceiptContextType {
  receipt: ParsedReceipt | null;
  setReceipt: (receipt: ParsedReceipt | null) => void;
  updateItems: (items: ReceiptItem[]) => void;
  clearReceipt: () => void;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const [receipt, setReceipt] = useState<ParsedReceipt | null>(null);

  const updateItems = (items: ReceiptItem[]) => {
    if (receipt) {
      const newTotal = items.reduce((sum, item) => sum + item.price, 0);
      setReceipt({ ...receipt, items, total: newTotal });
    }
  };

  const clearReceipt = () => setReceipt(null);

  return (
    <ReceiptContext.Provider value={{ receipt, setReceipt, updateItems, clearReceipt }}>
      {children}
    </ReceiptContext.Provider>
  );
}

export const useReceipt = () => {
  const context = useContext(ReceiptContext);
  if (!context) throw new Error('useReceipt must be used within ReceiptProvider');
  return context;
};
