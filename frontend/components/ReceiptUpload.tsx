'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';

interface ReceiptUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
};

export default function ReceiptUpload({ onFilesChange, maxFiles = 5 }: ReceiptUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dropError, setDropError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setDropError(null);
      if (rejectedFiles.length > 0) {
        setDropError(rejectedFiles[0].errors[0]?.message || 'Some files were rejected.');
        return;
      }
      const combined = [...files, ...acceptedFiles].slice(0, maxFiles);
      if (files.length + acceptedFiles.length > maxFiles) {
        setDropError(`Maximum ${maxFiles} files allowed.`);
      }
      setFiles(combined);
      onFilesChange(combined);
    },
    [files, maxFiles, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles,
    maxSize: 20 * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesChange(updated);
  };

  return (
    <div>
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
          <p className="text-xs text-gray-400">
            Supports: JPG, PNG, HEIC (max {maxFiles} files, 20MB each)
          </p>
        </div>
      </div>

      {dropError && (
        <p className="mt-2 text-sm text-red-600">{dropError}</p>
      )}

      {files.length > 0 && (
        <div className="mt-3 bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-gray-400">📄</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                className="text-gray-400 hover:text-red-500 transition-colors ml-4 flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
