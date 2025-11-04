import React, { useEffect, useState } from 'react';
import { Notification } from '../types';

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const ToastIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
  const baseClasses = "h-6 w-6 mr-3";
  switch (type) {
    case 'success':
      return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'error':
      return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'info':
      return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    default:
      return null;
  }
};

export const Toast: React.FC<ToastProps> = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
        handleDismiss();
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, [notification.id]);
  
  const handleDismiss = () => {
      setIsExiting(true);
      setTimeout(() => onDismiss(notification.id), 300); // Wait for animation to finish
  };

  const typeClasses = {
    success: 'bg-green-100 dark:bg-green-900/70 border-green-400 dark:border-green-600',
    error: 'bg-red-100 dark:bg-red-900/70 border-red-400 dark:border-red-600',
    info: 'bg-blue-100 dark:bg-blue-900/70 border-blue-400 dark:border-blue-600',
  };

  return (
    <div
      className={`
        w-full max-w-sm rounded-lg shadow-lg flex items-center p-4 border-l-4 transition-all duration-300 ease-in-out
        ${typeClasses[notification.type]}
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      role="alert"
    >
      <ToastIcon type={notification.type} />
      <p className="flex-1 text-sm font-medium text-[rgb(var(--color-text-base))]">{notification.message}</p>
      <button onClick={handleDismiss} className="ml-4 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgb(var(--color-text-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
