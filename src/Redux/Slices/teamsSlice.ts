import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TeamMember {
  _id: string;
  name: string;
  profileImage?: string;
}

export interface SharedWishlistItem {
  itemType: 'room' | 'pg' | 'requirement';
  itemId: string;
  addedBy: string;
  addedAt: string;
}

export interface Team {
  _id: string;
  name: string;
  passkey: string; // e.g. FM-XXXXX
  description?: string;
  location?: string;
  budget?: { min: number; max: number };
  createdBy: string;
  conversation?: string;
  members: TeamMember[];
  maxMembers: number;
  sharedWishlist?: SharedWishlistItem[];
  createdAt?: string;
}

interface TeamsState {
  list: Team[];
  selected: Team | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  list: [],
  selected: null,
  isLoading: false,
  error: null,
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setTeams(state, action: PayloadAction<Team[]>) {
      state.list = action.payload;
    },
    addTeam(state, action: PayloadAction<Team>) {
      state.list.unshift(action.payload);
    },
    setSelectedTeam(state, action: PayloadAction<Team | null>) {
      state.selected = action.payload;
    },
    updateTeam(state, action: PayloadAction<Team>) {
      const idx = state.list.findIndex(t => t._id === action.payload._id);
      if (idx >= 0) {
        state.list[idx] = action.payload;
      }
      if (state.selected?._id === action.payload._id) {
        state.selected = action.payload;
      }
    },
    removeTeam(state, action: PayloadAction<string>) {
      state.list = state.list.filter(t => t._id !== action.payload);
      if (state.selected?._id === action.payload) {
        state.selected = null;
      }
    },
    addToSharedWishlist(
      state,
      action: PayloadAction<{ teamId: string; item: SharedWishlistItem }>,
    ) {
      const team = state.list.find(t => t._id === action.payload.teamId);
      if (team) {
        if (!team.sharedWishlist) {
          team.sharedWishlist = [];
        }
        team.sharedWishlist.push(action.payload.item);
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearTeams(state) {
      state.list = [];
      state.selected = null;
    },
  },
});

export const {
  setTeams,
  addTeam,
  setSelectedTeam,
  updateTeam,
  removeTeam,
  addToSharedWishlist,
  setLoading,
  setError,
  clearTeams,
} = teamsSlice.actions;

export default teamsSlice.reducer;
