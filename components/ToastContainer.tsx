import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectAllNotifications, removeNotification } from '../store/slices/notificationsSlice';
import { Toast } from './Toast';

export const ToastContainer: React.FC = () => {
  const notifications = useAppSelector(selectAllNotifications);
  const dispatch = useAppDispatch();

  const handleDismiss = (id: string) => {
    dispatch(removeNotification(id));
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] w-full max-w-sm space-y-3">
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          notification={notification}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
};
