import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from './authSlice';

interface UserState {
  profile: User | null;
  viewingProfile: User | null; // Profile of another user being viewed
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  viewingProfile: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<User>) {
      state.profile = action.payload;
    },
    setViewingProfile(state, action: PayloadAction<User | null>) {
      state.viewingProfile = action.payload;
    },
    updateProfile(state, action: PayloadAction<Partial<User>>) {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    clearViewingProfile(state) {
      state.viewingProfile = null;
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
  setProfile,
  setViewingProfile,
  updateProfile,
  clearViewingProfile,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;
