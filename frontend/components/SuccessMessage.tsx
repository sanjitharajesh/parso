'use client';

import { useRouter } from 'next/navigation';

interface SuccessMessageProps {
  expenseId: number;
  expenseUrl: string;
  message?: string;
}

export default function SuccessMessage({ expenseId, expenseUrl, message }: SuccessMessageProps) {
  const router = useRouter();

  return (
    <div className="text-center">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Expense Created!</h2>
      <p className="text-gray-500 mb-6">{message || 'Your bill has been split in Splitwise'}</p>

      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-6 text-sm">
        <span className="text-gray-500">Expense ID: </span>
        <span className="text-gray-900 font-mono font-semibold">{expenseId}</span>
      </div>

      <div className="space-y-3">
        {expenseUrl && (
          <a
            href={expenseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            View in Splitwise →
          </a>
        )}
        <button
          onClick={() => router.push('/')}
          className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Split Another Receipt
        </button>
      </div>
    </div>
  );
}
