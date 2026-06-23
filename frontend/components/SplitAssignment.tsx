'use client';

import { ReceiptItem, SplitwiseMember } from '@/lib/types';

interface SplitAssignmentProps {
  items: ReceiptItem[];
  members: SplitwiseMember[];
  sharedIndices: Set<number>;
  individualAssignments: { itemIndex: number; assignedUserIds: number[] }[];
  onToggleShared: (index: number) => void;
  onToggleMember: (itemIndex: number, userId: number) => void;
}

export default function SplitAssignment({
  items,
  members,
  sharedIndices,
  individualAssignments,
  onToggleShared,
  onToggleMember,
}: SplitAssignmentProps) {
  const memberName = (m: SplitwiseMember) =>
    m.last_name ? `${m.first_name} ${m.last_name}` : m.first_name;

  const unsharedAssignments = individualAssignments.filter(a => !sharedIndices.has(a.itemIndex));
  const sharedTotal = [...sharedIndices].reduce((sum, i) => sum + items[i].price, 0);

  return (
    <div className="space-y-4">
      {/* Shared Items */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-gray-800 mb-1">Step 1: Select Shared Items</h3>
        <p className="text-xs text-gray-500 mb-4">Split equally among all members</p>
        <div className="space-y-2">
          {items.map((item, index) => (
            <label key={index} className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={sharedIndices.has(index)}
                  onChange={() => onToggleShared(index)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-800">{item.name}</span>
              </div>
              <span className="text-sm text-gray-600">${item.price.toFixed(2)}</span>
            </label>
          ))}
        </div>
        {sharedIndices.size > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-600">
            Shared Total: <span className="font-semibold text-gray-800">${sharedTotal.toFixed(2)}</span>
            {' '}
            <span className="text-gray-400">(${(sharedTotal / members.length).toFixed(2)}/person)</span>
          </div>
        )}
      </div>

      {/* Individual Items */}
      {unsharedAssignments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-1">Step 2: Assign Individual Items</h3>
          <p className="text-xs text-gray-500 mb-4">Select who pays for each item</p>
          <div className="space-y-4">
            {unsharedAssignments.map(({ itemIndex, assignedUserIds }) => {
              const item = items[itemIndex];
              return (
                <div key={itemIndex} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800">{item.name}</span>
                    <span className="text-sm text-gray-600">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {members.map(m => {
                      const selected = assignedUserIds.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          onClick={() => onToggleMember(itemIndex, m.id)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            selected
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {memberName(m)}
                        </button>
                      );
                    })}
                  </div>
                  {assignedUserIds.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">Assign to at least one person</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
