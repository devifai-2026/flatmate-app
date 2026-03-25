import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from './authSlice';

export interface Match {
  user: User;
  score: number; // 0–100
  breakdown: {
    budget: number;
    location: number;
    lifestyle: number;
    interests: number;
  };
}

interface MatchesState {
  list: Match[];
  currentIndex: number; // Current swipe card index
  isLoading: boolean;
  error: string | null;
}

const initialState: MatchesState = {
  list: [],
  currentIndex: 0,
  isLoading: false,
  error: null,
};

const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setMatches(state, action: PayloadAction<Match[]>) {
      state.list = action.payload;
      state.currentIndex = 0;
    },
    swipeNext(state) {
      if (state.currentIndex < state.list.length - 1) {
        state.currentIndex += 1;
      }
    },
    removeMatch(state, action: PayloadAction<string>) {
      state.list = state.list.filter(m => m.user._id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearMatches(state) {
      state.list = [];
      state.currentIndex = 0;
    },
  },
});

export const {
  setMatches,
  swipeNext,
  removeMatch,
  setLoading,
  setError,
  clearMatches,
} = matchesSlice.actions;

export default matchesSlice.reducer;
