import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircleIcon, XIcon, BellIcon } from './icons';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const Toast: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  // Fix: Added `pointer-events-auto` to allow clicks on the toast message,
  // resolving an issue where the dismiss button was unresponsive.
  const baseClasses = 'pointer-events-auto flex items-center w-full max-w-xs p-4 text-gray-800 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out transform dark:bg-gray-800 dark:text-gray-200';
  
  const typeStyles = {
    success: { icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />, iconBg: 'bg-green-100 dark:bg-green-800' },
    error: { icon: <XIcon className="w-6 h-6 text-red-500" />, iconBg: 'bg-red-100 dark:bg-red-800' },
    info: { icon: <BellIcon className="w-6 h-6 text-blue-500" />, iconBg: 'bg-blue-100 dark:bg-blue-800' },
  };

  const { icon, iconBg } = typeStyles[toast.type];

  // Animation state
  const [isVisible, setIsVisible] = useState(false);

  // Fix: Wrapped `handleDismiss` in `useCallback` to maintain a stable reference
  // for use in the `useEffect` hook, preventing unnecessary re-renders.
  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), 300); // Wait for animation to finish
  }, [onDismiss, toast.id]);

  // Fix: Implemented auto-dismissal logic within the Toast component itself.
  // A timeout is now set on mount to automatically trigger the dismiss animation after 5 seconds.
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [handleDismiss]);

  return (
    <div 
        className={`${baseClasses} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`} 
        role="alert"
    >
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${iconBg} rounded-lg`}>
        {icon}
      </div>
      <div className="ml-3 text-sm font-medium">{toast.message}</div>
      <button 
        onClick={handleDismiss} 
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:bg-gray-800 dark:text-gray-500 dark:hover:text-white dark:hover:bg-gray-700" 
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};


export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // Fix: Removed the non-functional `setTimeout` and incorrect dependency from `addToast`.
  // Auto-dismissal is now correctly handled by the individual `Toast` component.
  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6 space-y-4 z-50"
      >
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};