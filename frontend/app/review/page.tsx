'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useReceipt } from '@/contexts/ReceiptContext';
import { ReceiptItem } from '@/lib/types';

export default function ReviewPage() {
  const router = useRouter();
  const { receipt, updateItems } = useReceipt();
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (!receipt) {
      router.replace('/');
      return;
    }
    setItems(receipt.items.map(item => ({ ...item })));
  }, [receipt, router]);

  if (!receipt) return null;

  const calculatedTotal = items.reduce((sum, item) => sum + item.price, 0);

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
    const updated = items.map((item, i) =>
      i === index ? { name: editName.trim(), price } : item
    );
    setItems(updated);
    setEditingIndex(null);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditError(null);
  };

  const deleteItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const addItem = () => {
    const newItems = [...items, { name: 'New Item', price: 0 }];
    setItems(newItems);
    startEdit(newItems.length - 1);
  };

  const handleContinue = () => {
    if (items.length === 0) return;
    updateItems(items);
    router.push('/assign');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-1">
            💰 Parso
          </h1>
        </div>

        {/* Receipt Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Review Receipt</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {receipt.store_name && (
              <>
                <span className="text-gray-500">Store</span>
                <span className="text-gray-900 font-medium">{receipt.store_name}</span>
              </>
            )}
            {receipt.date && (
              <>
                <span className="text-gray-500">Date</span>
                <span className="text-gray-900 font-medium">{receipt.date}</span>
              </>
            )}
            {receipt.subtotal > 0 && (
              <>
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">${receipt.subtotal.toFixed(2)}</span>
              </>
            )}
            {receipt.tax > 0 && (
              <>
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900">${receipt.tax.toFixed(2)}</span>
              </>
            )}
            <span className="text-gray-500 font-medium">Total</span>
            <span className="text-gray-900 font-bold">${calculatedTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Items</h3>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              No items. Add items below.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <div key={index}>
                  {editingIndex === index ? (
                    <div className="px-4 py-3 bg-green-50">
                      <div className="flex gap-2 items-start">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          placeholder="Item name"
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(index); if (e.key === 'Escape') cancelEdit(); }}
                        />
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={e => setEditPrice(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="w-24 pl-5 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            onKeyDown={e => { if (e.key === 'Enter') saveEdit(index); if (e.key === 'Escape') cancelEdit(); }}
                          />
                        </div>
                      </div>
                      {editError && (
                        <p className="text-red-600 text-xs mt-1">{editError}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => saveEdit(index)}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 group">
                      <span className="text-gray-800 text-sm flex-1 truncate">{item.name}</span>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-gray-900 font-medium text-sm w-16 text-right">
                          ${item.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => startEdit(index)}
                          className="text-gray-400 hover:text-green-600 transition-colors text-base"
                          aria-label="Edit item"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteItem(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors text-base"
                          aria-label="Delete item"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Item */}
        <button
          onClick={addItem}
          className="w-full text-sm text-green-600 hover:text-green-700 border border-dashed border-green-300 hover:border-green-500 rounded-lg py-2.5 transition-colors"
        >
          + Add Item
        </button>

        {/* Continue */}
        <button
          onClick={handleContinue}
          disabled={items.length === 0}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Continue to Split →
        </button>
      </div>
    </main>
  );
}
