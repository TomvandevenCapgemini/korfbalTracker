import React from 'react';

export default function Toast({ message, onClose }: { message: string; onClose?: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50">
      <div className="flex items-center gap-3">
        <div className="flex-1">{message}</div>
        {onClose && <button className="text-sm opacity-80" onClick={onClose}>Close</button>}
      </div>
    </div>
  );
}
