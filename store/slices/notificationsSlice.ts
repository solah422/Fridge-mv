import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';
import { Notification, NotificationType } from '../../types';

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const newNotification: Notification = {
        id: `notif-${Date.now()}-${Math.random()}`,
        ...action.payload,
      };
      state.items.push(newNotification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
  },
});

export const { addNotification, removeNotification } = notificationsSlice.actions;

export const selectAllNotifications = (state: RootState) => state.notifications.items;

export default notificationsSlice.reducer;
