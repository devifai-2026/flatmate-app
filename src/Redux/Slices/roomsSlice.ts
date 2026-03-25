import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Room {
  _id: string;
  title: string;
  description?: string;
  location: string;
  rent: number;
  deposit?: number;
  amenities?: string[];
  images?: string[];
  availableFrom?: string;
  postedBy: {
    _id: string;
    name: string;
    profileImage?: string;
    phone?: string;
  };
  preferredTenant?: 'male' | 'female' | 'any' | 'family' | 'students' | 'working-professionals';
  phoneVisibility?: 'masked' | 'reveal';
  contactPhone?: string;
  createdAt?: string;
}

interface RoomsState {
  list: Room[];
  selected: Room | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

const initialState: RoomsState = {
  list: [],
  selected: null,
  isLoading: false,
  error: null,
  hasMore: true,
  page: 1,
};

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setRooms(state, action: PayloadAction<Room[]>) {
      state.list = action.payload;
      state.page = 1;
    },
    appendRooms(state, action: PayloadAction<Room[]>) {
      state.list.push(...action.payload);
      state.page += 1;
    },
    setSelectedRoom(state, action: PayloadAction<Room | null>) {
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
    clearRooms(state) {
      state.list = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
});

export const {
  setRooms,
  appendRooms,
  setSelectedRoom,
  setLoading,
  setError,
  setHasMore,
  clearRooms,
} = roomsSlice.actions;

export default roomsSlice.reducer;
