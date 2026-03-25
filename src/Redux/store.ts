import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './Slices/authSlice';
import userReducer from './Slices/userSlice';
import roomsReducer from './Slices/roomsSlice';
import pgsReducer from './Slices/pgsSlice';
import requirementsReducer from './Slices/requirementsSlice';
import matchesReducer from './Slices/matchesSlice';
import chatReducer from './Slices/chatSlice';
import wishlistReducer from './Slices/wishlistSlice';
import walletReducer from './Slices/walletSlice';
import notificationsReducer from './Slices/notificationsSlice';
import teamsReducer from './Slices/teamsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  rooms: roomsReducer,
  pgs: pgsReducer,
  requirements: requirementsReducer,
  matches: matchesReducer,
  chat: chatReducer,
  wishlist: wishlistReducer,
  wallet: walletReducer,
  notifications: notificationsReducer,
  teams: teamsReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Only persist auth and wallet balance — everything else is fetched fresh
  whitelist: ['auth', 'wallet'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
