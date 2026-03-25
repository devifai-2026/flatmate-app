import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PG {
  _id: string;
  title: string;
  description?: string;
  location: string;
  city: string;
  rent: number;
  deposit?: number;
  sharing?: 'single' | 'double' | 'triple' | 'any';
  gender?: 'male' | 'female' | 'unisex';
  amenities?: string[];
  meals?: boolean;
  images?: string[];
  availableFrom?: string;
  postedBy: {
    _id: string;
    name: string;
    profileImage?: string;
    phone?: string;
  };
  phoneVisibility?: 'masked' | 'reveal';
  contactPhone?: string;
  createdAt?: string;
}

interface PGsState {
  list: PG[];
  selected: PG | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

const initialState: PGsState = {
  list: [],
  selected: null,
  isLoading: false,
  error: null,
  hasMore: true,
  page: 1,
};

const pgsSlice = createSlice({
  name: 'pgs',
  initialState,
  reducers: {
    setPGs(state, action: PayloadAction<PG[]>) {
      state.list = action.payload;
      state.page = 1;
    },
    appendPGs(state, action: PayloadAction<PG[]>) {
      state.list.push(...action.payload);
      state.page += 1;
    },
    setSelectedPG(state, action: PayloadAction<PG | null>) {
      state.selected = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setHasMore(state, action: PayloadAction<boolean>) {
      state.hasMore = action.payload;
    },
    clearPGs(state) {
      state.list = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
});

export const {
  setPGs,
  appendPGs,
  setSelectedPG,
  setLoading,
  setError,
  setHasMore,
  clearPGs,
} = pgsSlice.actions;

export default pgsSlice.reducer;
