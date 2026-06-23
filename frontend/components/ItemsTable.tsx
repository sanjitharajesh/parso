'use client';

import { useState } from 'react';
import { ReceiptItem } from '@/lib/types';

interface ItemsTableProps {
  items: ReceiptItem[];
  onChange: (items: ReceiptItem[]) => void;
}

export default function ItemsTable({ items, onChange }: ItemsTableProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditName(items[index].name);
    setEditPrice(items[index].price.toFixed(2));
    setEditError(null);
  };

  const saveEdit = (index: number) => {
    const price = parseFloat(editPrice);
    if (isNaN(price) || price < 0) {
      setEditError('Price must be a valid non-negative number.');
      return;
    }
    if (!editName.trim()) {
      setEditError('Item name cannot be empty.');
      return;
    }
    onChange(items.map((item, i) => i === index ? { name: editName.trim(), price } : item));
    setEditingIndex(null);
    setEditError(null);
  };

  const deleteItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const addItem = () => {
    const newItems = [...items, { name: 'New Item', price: 0 }];
    onChange(newItems);
    setEditingIndex(newItems.length - 1);
    setEditName('New Item');
    setEditPrice('0.00');
    setEditError(null);
  };

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Items</h3>
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">No items.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item, index) => (
              <div key={index}>
                {editingIndex === index ? (
                  <div className="px-4 py-3 bg-green-50">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(index); if (e.key === 'Escape') setEditingIndex(null); }}
                      />
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={e => setEditPrice(e.target.value)}
                          step="0.01"
                          min="0"
                          className="w-24 pl-5 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(index); if (e.key === 'Escape') setEditingIndex(null); }}
                        />
                      </div>
                    </div>
                    {editError && <p className="text-red-600 text-xs mt-1">{editError}</p>}
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => saveEdit(index)} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Save</button>
                      <button onClick={() => setEditingIndex(null)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                    <span className="text-gray-800 text-sm flex-1 truncate">{item.name}</span>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-gray-900 font-medium text-sm w-16 text-right">${item.price.toFixed(2)}</span>
                      <button onClick={() => startEdit(index)} className="text-gray-400 hover:text-green-600 transition-colors">✏️</button>
                      <button onClick={() => deleteItem(index)} className="text-gray-400 hover:text-red-500 transition-colors">🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={addItem}
        className="mt-3 w-full text-sm text-green-600 hover:text-green-700 border border-dashed border-green-300 hover:border-green-500 rounded-lg py-2.5 transition-colors"
      >
        + Add Item
      </button>
    </div>
  );
}
