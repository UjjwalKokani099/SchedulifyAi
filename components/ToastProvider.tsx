import React, { createContext, useContext, useState, useCallback } from 'react';
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
  const baseClasses = 'flex items-center w-full max-w-xs p-4 text-gray-800 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out transform';
  
  const typeStyles = {
    success: { icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />, iconBg: 'bg-green-100' },
    error: { icon: <XIcon className="w-6 h-6 text-red-500" />, iconBg: 'bg-red-100' },
    info: { icon: <BellIcon className="w-6 h-6 text-blue-500" />, iconBg: 'bg-blue-100' },
  };

  const { icon, iconBg } = typeStyles[toast.type];

  // Animation state
  const [isVisible, setIsVisible] = useState(false);
  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), 300); // Wait for animation to finish
  }

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
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8" 
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

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    
    setTimeout(() => {
      // Find the specific toast and trigger its dismiss animation
      // The toast component itself will call removeToast from the state array
    }, 5000); // The timeout here is a fallback; dismissal is handled by the Toast component

  }, [removeToast]);

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