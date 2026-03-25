import { apiClient } from './api.client';
import { Endpoints } from './api.endpoints';
import { WalletTransaction } from '../Redux/Slices/walletSlice';

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export const WalletService = {
  getBalance: async (): Promise<number> => {
    const { data } = await apiClient.get<{ balance: number }>(
      Endpoints.wallet.balance,
    );
    return data.balance;
  },

  getTransactions: async (): Promise<WalletTransaction[]> => {
    const { data } = await apiClient.get<{ transactions: WalletTransaction[] }>(
      Endpoints.wallet.transactions,
    );
    return data.transactions;
  },

  createRechargeOrder: async (amount: number): Promise<RazorpayOrder> => {
    const { data } = await apiClient.post<RazorpayOrder>(
      Endpoints.wallet.recharge,
      { amount },
    );
    return data;
  },

  verifyRecharge: async (payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<{ balance: number }> => {
    const { data } = await apiClient.post<{ balance: number }>(
      Endpoints.wallet.rechargeVerify,
      payload,
    );
    return data;
  },

  unlockListing: async (payload: {
    listingType: 'room' | 'pg' | 'requirement';
    listingId: string;
  }): Promise<{ balance: number }> => {
    const { data } = await apiClient.post<{ balance: number }>(
      Endpoints.wallet.unlock,
      payload,
    );
    return data;
  },

  checkAccess: async (
    listingType: string,
    listingId: string,
  ): Promise<boolean> => {
    const { data } = await apiClient.get<{ hasAccess: boolean }>(
      Endpoints.wallet.access(listingType, listingId),
    );
    return data.hasAccess;
  },

  getUnlockedIds: async (): Promise<string[]> => {
    const { data } = await apiClient.get<{ ids: string[] }>(
      Endpoints.wallet.unlocked,
    );
    return data.ids;
  },

  // ₹19 enquiry (direct Razorpay payment, no wallet)
  createEnquiryOrder: async (listingId: string): Promise<RazorpayOrder> => {
    const { data } = await apiClient.post<RazorpayOrder>(
      Endpoints.enquiry.createOrder,
      { listingId },
    );
    return data;
  },

  verifyEnquiry: async (payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    listingId: string;
  }): Promise<{ canChat: boolean }> => {
    const { data } = await apiClient.post<{ canChat: boolean }>(
      Endpoints.enquiry.verify,
      payload,
    );
    return data;
  },
};
