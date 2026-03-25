import { publicClient } from './api.client';
import { Endpoints } from './api.endpoints';

export interface SendOtpPayload {
  phone: string; // Full number with country code, e.g. "+919876543210"
}

export interface SendOtpResponse {
  message: string;
  verificationId?: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
  verificationId?: string;
}

export interface VerifyOtpResponse {
  token: string;
  user: any;
  isNewUser: boolean;
}

export const AuthService = {
  sendOtp: async (payload: SendOtpPayload): Promise<SendOtpResponse> => {
    const { data } = await publicClient.post<{ success: boolean; data: SendOtpResponse }>(
      Endpoints.auth.sendOtp,
      payload,
    );
    return data.data;
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    const { data } = await publicClient.post<{ success: boolean; data: VerifyOtpResponse }>(
      Endpoints.auth.verifyOtp,
      payload,
    );
    return data.data;
  },
};
