import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
  bio?: string;
  profileImage?: string;
  userType?: 'seeker' | 'pg-owner' | 'flat-owner';
  city?: string;
  lifestyleTags?: string[];
  walletBalance?: number;
  onboardingComplete?: boolean;
  phoneVerified?: boolean;
  preferences?: {
    lookingFor?: 'room' | 'flatmate' | 'pg';
    budgetMin?: number;
    budgetMax?: number;
    preferredLocation?: string;
    lifestyle?: {
      smoking?: boolean;
      drinking?: boolean;
      pets?: boolean;
      sleepSchedule?: string;
    };
    interests?: string[];
    roommatePreferences?: {
      ageMin?: number;
      ageMax?: number;
      gender?: string;
    };
  };
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  uid: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  uid: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(
      state,
      action: PayloadAction<{ user: User; token: string; uid: string }>,
    ) {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.uid = action.payload.uid;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.uid = null;
      state.isLoading = false;
      state.error = null;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setOnboardingComplete(state) {
      if (state.user) {
        state.user.onboardingComplete = true;
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  setOnboardingComplete,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
