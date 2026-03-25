import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WishlistItem {
  _id: string;
  itemType: 'room' | 'pg' | 'roommate' | 'requirement';
  itemId: string;
  itemData?: any; // Populated listing data
  createdAt?: string;
}

interface WishlistState {
  items: WishlistItem[];
  savedIds: string[]; // Quick lookup for "is saved?" checks
  isLoading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  savedIds: [],
  isLoading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist(state, action: PayloadAction<WishlistItem[]>) {
      state.items = action.payload;
      state.savedIds = action.payload.map(i => i.itemId);
    },
    setSavedIds(state, action: PayloadAction<string[]>) {
      state.savedIds = action.payload;
    },
    addToWishlist(state, action: PayloadAction<WishlistItem>) {
      state.items.unshift(action.payload);
      state.savedIds.push(action.payload.itemId);
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.itemId !== action.payload);
      state.savedIds = state.savedIds.filter(id => id !== action.payload);
    },
    toggleSaved(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.savedIds.includes(id)) {
        state.savedIds = state.savedIds.filter(i => i !== id);
        state.items = state.items.filter(i => i.itemId !== id);
      } else {
        state.savedIds.push(id);
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearWishlist(state) {
      state.items = [];
      state.savedIds = [];
    },
  },
});

export const {
  setWishlist,
  setSavedIds,
  addToWishlist,
  removeFromWishlist,
  toggleSaved,
  setLoading,
  setError,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
