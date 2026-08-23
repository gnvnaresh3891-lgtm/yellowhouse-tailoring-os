'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
  title?: string;
}

interface ToastAPI {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastAPI | undefined>(undefined);

const ToastItem = ({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) => {
  const [width, setWidth] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 4000;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setWidth(remaining);
    }, 16);
    
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div className="relative overflow-hidden w-80 glass-card bg-[#0B0F19]/90 backdrop-blur-md border border-yellow-600/30 shadow-xl rounded-lg p-4 flex gap-3 animate-in slide-in-from-right fade-in duration-300">
      <div className="flex-shrink-0 mt-0.5">
        {icons[toast.variant]}
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && <h4 className="text-sm font-semibold text-slate-200 mb-1 truncate">{toast.title}</h4>}
        <p className="text-sm text-slate-400 break-words">{toast.message}</p>
      </div>
      <button 
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors h-fit p-1"
      >
        <X className="w-4 h-4" />
      </button>
      <div 
        className="absolute bottom-0 left-0 h-1 bg-yellow-600/50" 
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((variant: ToastVariant, message: string, title?: string) => {
    setToasts((prev) => {
      const newToast = { id: Math.random().toString(36).substring(2, 9), variant, message, title };
      const nextToasts = [...prev, newToast];
      if (nextToasts.length > 3) {
        return nextToasts.slice(nextToasts.length - 3);
      }
      return nextToasts;
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string, title?: string) => addToast('success', message, title), [addToast]);
  const error = useCallback((message: string, title?: string) => addToast('error', message, title), [addToast]);
  const warning = useCallback((message: string, title?: string) => addToast('warning', message, title), [addToast]);
  const info = useCallback((message: string, title?: string) => addToast('info', message, title), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
