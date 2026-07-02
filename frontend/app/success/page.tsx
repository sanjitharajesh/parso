'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const expenseId = searchParams.get('expense_id');
  const expenseUrl = searchParams.get('expense_url');
  const decodedUrl = expenseUrl ? decodeURIComponent(expenseUrl) : null;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 sm:px-6 text-center">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-1 mb-8">
            💰 Parso
          </h1>

          {/* Success Icon */}
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Expense Created!</h2>
          <p className="text-gray-500">Your bill has been split in Splitwise</p>
        </div>

        {/* Expense ID */}
        {expenseId && (
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-6 text-sm">
            <span className="text-gray-500">Expense ID: </span>
            <span className="text-gray-900 font-mono font-semibold">{expenseId}</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {decodedUrl && (
            <a
              href={decodedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              View in Splitwise →
            </a>
          )}

          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Split Another Receipt
          </button>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
