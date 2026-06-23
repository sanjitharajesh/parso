'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { uploadReceipt } from '@/lib/api';
import { useReceipt } from '@/contexts/ReceiptContext';

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
};

const MAX_FILES = 5;

export default function UploadPage() {
  const router = useRouter();
  const { setReceipt } = useReceipt();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const messages = rejectedFiles.flatMap(f => f.errors.map(e => e.message));
      setError(messages[0] || 'Some files were rejected.');
      return;
    }

    const combined = [...files, ...acceptedFiles].slice(0, MAX_FILES);
    if (files.length + acceptedFiles.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed.`);
    }
    setFiles(combined);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: MAX_FILES,
    maxSize: 20 * 1024 * 1024, // 20MB per file
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one receipt image.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await uploadReceipt(files);
      setReceipt(result);
      router.push('/review');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Failed to process receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <span>💰</span> BillBuddy
          </h1>
          <p className="mt-2 text-gray-500 text-lg">Split bills instantly with AI</p>
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
            ${isDragActive
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 bg-white hover:border-green-400 hover:bg-green-50'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <span className="text-5xl">📤</span>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop the files here...' : 'Drop receipt images here'}
              </p>
              <p className="text-gray-500 text-sm mt-1">or click to upload</p>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Supports: JPG, PNG, HEIC (max {MAX_FILES} files, 20MB each)
            </p>
            <p className="text-xs text-gray-400">
              HEIC files will be converted automatically server-side
            </p>
          </div>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="mt-4 bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-gray-400 text-lg">📄</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-4 flex-shrink-0"
                  aria-label="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleUpload}
          disabled={loading || files.length === 0}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors text-base"
        >
          {loading ? (
            <>
              <Spinner />
              Processing receipt...
            </>
          ) : (
            <>
              Process Receipt
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
