import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WalletTransaction {
  _id: string;
  type: 'recharge' | 'debit';
  amount: number;
  tokens: number;
  description: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  listingType?: string;
  listingId?: string;
  createdAt: string;
}

interface WalletState {
  balance: number;
  transactions: WalletTransaction[];
  unlockedIds: string[]; // Item IDs unlocked via tokens
  isLoading: boolean;
  isPaymentLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  balance: 0,
  transactions: [],
  unlockedIds: [],
  isLoading: false,
  isPaymentLoading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalance(state, action: PayloadAction<number>) {
      state.balance = action.payload;
    },
    setTransactions(state, action: PayloadAction<WalletTransaction[]>) {
      state.transactions = action.payload;
    },
    addTransaction(state, action: PayloadAction<WalletTransaction>) {
      state.transactions.unshift(action.payload);
    },
    setUnlockedIds(state, action: PayloadAction<string[]>) {
      state.unlockedIds = action.payload;
    },
    addUnlockedId(state, action: PayloadAction<string>) {
      if (!state.unlockedIds.includes(action.payload)) {
        state.unlockedIds.push(action.payload);
      }
    },
    deductBalance(state, action: PayloadAction<number>) {
      state.balance = Math.max(0, state.balance - action.payload);
    },
    addBalance(state, action: PayloadAction<number>) {
      state.balance += action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setPaymentLoading(state, action: PayloadAction<boolean>) {
      state.isPaymentLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearWallet(state) {
      state.balance = 0;
      state.transactions = [];
      state.unlockedIds = [];
    },
  },
});

export const {
  setBalance,
  setTransactions,
  addTransaction,
  setUnlockedIds,
  addUnlockedId,
  deductBalance,
  addBalance,
  setLoading,
  setPaymentLoading,
  setError,
  clearWallet,
} = walletSlice.actions;

export default walletSlice.reducer;
