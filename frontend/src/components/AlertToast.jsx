import React, { useEffect, useState } from 'react';
import { AlertOctagon, X } from 'lucide-react';
import socket from '../services/socket.js';

const SEVERITY_COLOR = {
  CRITICAL: 'bg-critical border-red-400',
  HIGH: 'bg-orange-600 border-orange-400',
  MEDIUM: 'bg-warning border-amber-400',
  LOW: 'bg-slate-600 border-slate-400',
};

export default function AlertToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleAlert = (alert) => {
      const id = alert._id || Date.now();
      setToasts((prev) => [{ ...alert, id }, ...prev].slice(0, 4));
      // auto-dismiss after 8s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 8000);
    };
    socket.on('alert:new', handleAlert);
    return () => socket.off('alert:new', handleAlert);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${SEVERITY_COLOR[toast.severity] || 'bg-slate-700'} border text-white rounded-lg p-3 shadow-2xl flex gap-2 items-start animate-[fadeIn_0.2s_ease-out]`}
        >
          <AlertOctagon size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1 text-xs">
            <p className="font-bold uppercase tracking-wide">{toast.severity} · {toast.type?.replace(/_/g, ' ')}</p>
            <p className="mt-0.5 leading-snug">{toast.message}</p>
          </div>
          <button onClick={() => dismiss(toast.id)} className="shrink-0 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
