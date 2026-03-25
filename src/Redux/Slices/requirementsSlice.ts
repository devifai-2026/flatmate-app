import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Requirement {
  _id: string;
  createdBy: {
    _id: string;
    name: string;
    profileImage?: string;
    phone?: string;
  };
  type: 'room' | 'flatmate';
  title: string;
  description?: string;
  budget: { min: number; max: number };
  location: string;
  moveInDate?: string;
  preferredRoommate?: {
    gender?: string;
    ageMin?: number;
    ageMax?: number;
    occupation?: string;
  };
  lifestyle?: {
    smoking?: boolean;
    drinking?: boolean;
    pets?: boolean;
    sleepSchedule?: string;
  };
  notes?: string;
  isActive?: boolean;
  phoneVisibility?: 'masked' | 'reveal';
  contactPhone?: string;
  createdAt?: string;
}

interface RequirementsState {
  list: Requirement[];
  selected: Requirement | null;
  myRequirements: Requirement[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RequirementsState = {
  list: [],
  selected: null,
  myRequirements: [],
  isLoading: false,
  error: null,
};

const requirementsSlice = createSlice({
  name: 'requirements',
  initialState,
  reducers: {
    setRequirements(state, action: PayloadAction<Requirement[]>) {
      state.list = action.payload;
    },
    appendRequirements(state, action: PayloadAction<Requirement[]>) {
      state.list.push(...action.payload);
    },
    setSelectedRequirement(state, action: PayloadAction<Requirement | null>) {
      state.selected = action.payload;
    },
    setMyRequirements(state, action: PayloadAction<Requirement[]>) {
      state.myRequirements = action.payload;
    },
    addMyRequirement(state, action: PayloadAction<Requirement>) {
      state.myRequirements.unshift(action.payload);
    },
    removeMyRequirement(state, action: PayloadAction<string>) {
      state.myRequirements = state.myRequirements.filter(
        r => r._id !== action.payload,
      );
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
  setRequirements,
  appendRequirements,
  setSelectedRequirement,
  setMyRequirements,
  addMyRequirement,
  removeMyRequirement,
  setLoading,
  setError,
} = requirementsSlice.actions;

export default requirementsSlice.reducer;
