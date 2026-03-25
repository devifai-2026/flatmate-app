import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppNotification {
  _id: string;
  type: 'message' | 'match' | 'inquiry' | 'system';
  title: string;
  body: string;
  link?: { type: string; id: string };
  fromUser?: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  read: boolean;
  createdAt: string;
}

interface NotificationsState {
  list: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  list: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<AppNotification[]>) {
      state.list = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },
    addNotification(state, action: PayloadAction<AppNotification>) {
      state.list.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markRead(state, action: PayloadAction<string>) {
      const notif = state.list.find(n => n._id === action.payload);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead(state) {
      state.list.forEach(n => (n.read = true));
      state.unreadCount = 0;
    },
    removeNotification(state, action: PayloadAction<string>) {
      const notif = state.list.find(n => n._id === action.payload);
      if (notif && !notif.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.list = state.list.filter(n => n._id !== action.payload);
    },
    clearNotifications(state) {
      state.list = [];
      state.unreadCount = 0;
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markRead,
  markAllRead,
  removeNotification,
  clearNotifications,
  setUnreadCount,
  setLoading,
  setError,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
