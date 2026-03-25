import { apiClient } from './api.client';
import { Endpoints } from './api.endpoints';
import { User } from '../Redux/Slices/authSlice';

export const UserService = {
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<{ user: User }>(Endpoints.user.me);
    return data.user;
  },

  getUserById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<{ user: User }>(
      Endpoints.user.byId(id),
    );
    return data.user;
  },

  updatePreferences: async (preferences: User['preferences']): Promise<User> => {
    const { data } = await apiClient.put<{ user: User }>(
      Endpoints.user.preferences,
      { preferences },
    );
    return data.user;
  },

  updateOnboardingStep1: async (payload: {
    name: string;
    userType: 'seeker' | 'pg-owner' | 'flat-owner';
    gender: 'male' | 'female' | 'non-binary' | 'other';
    city: string;
    profileImage?: string;
  }): Promise<User> => {
    const { data } = await apiClient.put<{ data: User }>(
      Endpoints.onboarding.step1,
      payload,
    );
    return data.data;
  },

  updateOnboardingStep2: async (payload: {
    lifestyleTags: string[];
  }): Promise<User> => {
    const { data } = await apiClient.put<{ data: User }>(
      Endpoints.onboarding.step2,
      payload,
    );
    return data.data;
  },

  updateLocation: async (payload: {
    lat: number;
    lng: number;
    city?: string;
  }): Promise<User> => {
    const { data } = await apiClient.put<{ user: User }>(
      Endpoints.onboarding.location,
      payload,
    );
    return data.user;
  },
};
