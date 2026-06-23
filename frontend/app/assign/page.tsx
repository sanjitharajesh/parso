'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useReceipt } from '@/contexts/ReceiptContext';
import { getGroups, getMembers, createExpense } from '@/lib/api';
import { SplitwiseGroup, SplitwiseMember } from '@/lib/types';

interface IndividualAssignment {
  itemIndex: number;
  assignedUserIds: number[];
}

export default function AssignPage() {
  const router = useRouter();
  const { receipt, clearReceipt } = useReceipt();

  const [groups, setGroups] = useState<SplitwiseGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [members, setMembers] = useState<SplitwiseMember[]>([]);
  const [paidByUserId, setPaidByUserId] = useState<number | null>(null);

  const [sharedIndices, setSharedIndices] = useState<Set<number>>(new Set());
  const [individualAssignments, setIndividualAssignments] = useState<IndividualAssignment[]>([]);

  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if no receipt
  useEffect(() => {
    if (!receipt) {
      router.replace('/');
    }
  }, [receipt, router]);

  // Load groups
  useEffect(() => {
    setLoadingGroups(true);
    getGroups()
      .then(data => setGroups(data))
      .catch(() => setError('Failed to load Splitwise groups.'))
      .finally(() => setLoadingGroups(false));
  }, []);

  // Load members when group changes
  useEffect(() => {
    if (selectedGroupId === null) {
      setMembers([]);
      setPaidByUserId(null);
      return;
    }
    setLoadingMembers(true);
    getMembers(selectedGroupId)
      .then(data => {
        const m = data;
        setMembers(m);
        if (m.length > 0) setPaidByUserId(m[0].id);
      })
      .catch(() => setError('Failed to load group members.'))
      .finally(() => setLoadingMembers(false));
  }, [selectedGroupId]);

  // Sync individual assignments when shared items change
  useEffect(() => {
    if (!receipt) return;
    const unsharedIndices = receipt.items
      .map((_, i) => i)
      .filter(i => !sharedIndices.has(i));

    setIndividualAssignments(prev => {
      const prevMap = new Map(prev.map(a => [a.itemIndex, a]));
      return unsharedIndices.map(i => prevMap.get(i) || { itemIndex: i, assignedUserIds: [] });
    });
  }, [sharedIndices, receipt]);

  if (!receipt) return null;

  const items = receipt.items;

  const toggleShared = (index: number) => {
    setSharedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleMemberForItem = (itemIndex: number, userId: number) => {
    setIndividualAssignments(prev =>
      prev.map(a => {
        if (a.itemIndex !== itemIndex) return a;
        const ids = a.assignedUserIds.includes(userId)
          ? a.assignedUserIds.filter(id => id !== userId)
          : [...a.assignedUserIds, userId];
        return { ...a, assignedUserIds: ids };
      })
    );
  };

  // Split calculation
  const userSplits: Record<number, number> = {};
  if (members.length > 0) {
    const sharedTotal = [...sharedIndices].reduce((sum, i) => sum + items[i].price, 0);
    const perPerson = sharedTotal / members.length;
    members.forEach(m => { userSplits[m.id] = perPerson; });

    individualAssignments.forEach(({ itemIndex, assignedUserIds }) => {
      if (assignedUserIds.length === 0) return;
      const splitAmount = items[itemIndex].price / assignedUserIds.length;
      assignedUserIds.forEach(uid => {
        userSplits[uid] = (userSplits[uid] || 0) + splitAmount;
      });
    });
  }

  const sharedTotal = [...sharedIndices].reduce((sum, i) => sum + items[i].price, 0);
  const unsharedItems = items.filter((_, i) => !sharedIndices.has(i));

  // Validation
  const allAssigned = unsharedItems.every((_, unsharedIdx) => {
    const realIdx = items.indexOf(unsharedItems[unsharedIdx]);
    const assignment = individualAssignments.find(a => a.itemIndex === realIdx);
    return assignment && assignment.assignedUserIds.length > 0;
  });

  const validate = (): string | null => {
    if (!selectedGroupId) return 'Please select a Splitwise group.';
    if (members.length === 0) return 'The selected group has no members.';
    if (!paidByUserId) return 'Please select who paid.';
    if (items.length === 0) return 'No items to split.';
    if (!allAssigned) return 'All non-shared items must be assigned to at least one person.';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    const total = Object.values(userSplits).reduce((sum, v) => sum + v, 0);

    try {
      const result = await createExpense({
        group_id: selectedGroupId!,
        description: receipt.store_name || 'Receipt split via BillBuddy',
        total,
        user_splits: userSplits,
        paid_by_user_id: paidByUserId!,
      });

      clearReceipt();
      router.push(`/success?expense_id=${result.expense_id}&expense_url=${encodeURIComponent(result.expense_url || '')}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Failed to create expense. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const memberName = (m: SplitwiseMember) =>
    m.last_name ? `${m.first_name} ${m.last_name}` : m.first_name;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/review" className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-1">
            💰 BillBuddy
          </h1>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">Assign Bill Split</h2>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Group Selector */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Splitwise Group
          </label>
          {loadingGroups ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Spinner className="h-4 w-4" /> Loading groups...
            </div>
          ) : (
            <select
              value={selectedGroupId ?? ''}
              onChange={e => {
                const val = e.target.value;
                setSelectedGroupId(val ? Number(val) : null);
                setSharedIndices(new Set());
                setIndividualAssignments([]);
                setError(null);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select group</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          )}

          {loadingMembers && (
            <div className="flex items-center gap-2 text-gray-500 text-sm mt-3">
              <Spinner className="h-4 w-4" /> Loading members...
            </div>
          )}

          {members.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-500">
                Group Members:{' '}
                <span className="text-gray-800 font-medium">
                  {members.map(memberName).join(', ')}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Paid By */}
        {members.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who paid for this receipt?
            </label>
            <select
              value={paidByUserId ?? ''}
              onChange={e => setPaidByUserId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{memberName(m)}</option>
              ))}
            </select>
          </div>
        )}

        {/* Step 1: Shared Items */}
        {members.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-1">Step 1: Select Shared Items</h3>
            <p className="text-xs text-gray-500 mb-4">These will be split equally among all members</p>

            <div className="space-y-2">
              {items.map((item, index) => (
                <label key={index} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={sharedIndices.has(index)}
                      onChange={() => toggleShared(index)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-800 group-hover:text-gray-900">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">${item.price.toFixed(2)}</span>
                </label>
              ))}
            </div>

            {sharedIndices.size > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-600">
                Shared Total:{' '}
                <span className="font-semibold text-gray-800">${sharedTotal.toFixed(2)}</span>
                {' '}
                <span className="text-gray-400">
                  (${(sharedTotal / members.length).toFixed(2)} per person)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Individual Items */}
        {members.length > 0 && unsharedItems.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-1">Step 2: Assign Individual Items</h3>
            <p className="text-xs text-gray-500 mb-4">Select who is responsible for each item (can be multiple people)</p>

            <div className="space-y-4">
              {individualAssignments.map(({ itemIndex, assignedUserIds }) => {
                const item = items[itemIndex];
                return (
                  <div key={itemIndex} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">{item.name}</span>
                      <span className="text-sm text-gray-600">${item.price.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">Assign to:</div>
                    <div className="flex flex-wrap gap-2">
                      {members.map(m => {
                        const selected = assignedUserIds.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            onClick={() => toggleMemberForItem(itemIndex, m.id)}
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
                      <p className="text-xs text-amber-600 mt-1">Please assign this item to at least one person</p>
                    )}
                    {assignedUserIds.length > 1 && (
                      <p className="text-xs text-gray-400 mt-1">
                        ${(item.price / assignedUserIds.length).toFixed(2)} each
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Split Summary */}
        {members.length > 0 && Object.keys(userSplits).length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Split Summary</h3>
            <div className="space-y-1.5">
              {members.map(m => {
                const amount = userSplits[m.id] || 0;
                const isPayer = m.id === paidByUserId;
                return (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">
                      {memberName(m)}
                      {isPayer && (
                        <span className="ml-2 text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded">paid</span>
                      )}
                    </span>
                    <span className="font-semibold text-gray-900">${amount.toFixed(2)}</span>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-green-200 flex items-center justify-between text-sm font-bold text-gray-900">
                <span>Total</span>
                <span>${Object.values(userSplits).reduce((s, v) => s + v, 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedGroupId || members.length === 0 || !allAssigned}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {submitting ? (
            <>
              <Spinner className="h-5 w-5" />
              Creating expense...
            </>
          ) : (
            <>
              Create Expense →
            </>
          )}
        </button>
      </div>
    </main>
  );
}

function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
