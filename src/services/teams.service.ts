import { apiClient } from './api.client';
import { Endpoints } from './api.endpoints';
import { Team, SharedWishlistItem } from '../Redux/Slices/teamsSlice';

export const TeamsService = {
  getMyTeams: async (): Promise<Team[]> => {
    const { data } = await apiClient.get(Endpoints.teams.list);
    return data.teams ?? data.data ?? [];
  },

  getTeamById: async (id: string): Promise<Team> => {
    const { data } = await apiClient.get(Endpoints.teams.byId(id));
    return data.team ?? data.data;
  },

  createTeam: async (payload: {
    name: string;
    description?: string;
    location?: string;
    budget?: { min: number; max: number };
    maxMembers?: number;
  }): Promise<Team> => {
    const { data } = await apiClient.post(Endpoints.teams.create, payload);
    return data.team ?? data.data;
  },

  joinTeam: async (passkey: string): Promise<Team> => {
    const { data } = await apiClient.post(Endpoints.teams.join, { passkey });
    return data.team ?? data.data;
  },

  leaveTeam: async (teamId: string): Promise<void> => {
    await apiClient.post(Endpoints.teams.leave(teamId));
  },

  deleteTeam: async (teamId: string): Promise<void> => {
    await apiClient.delete(Endpoints.teams.delete(teamId));
  },

  getSharedWishlist: async (teamId: string): Promise<SharedWishlistItem[]> => {
    const { data } = await apiClient.get(Endpoints.teams.sharedWishlist(teamId));
    return data.wishlist ?? data.data ?? [];
  },

  addToSharedWishlist: async (
    teamId: string,
    payload: { itemType: 'room' | 'pg' | 'requirement'; itemId: string },
  ): Promise<void> => {
    await apiClient.post(Endpoints.teams.addToSharedWishlist(teamId), payload);
  },

  removeFromSharedWishlist: async (
    teamId: string,
    payload: { itemType: 'room' | 'pg' | 'requirement'; itemId: string },
  ): Promise<void> => {
    await apiClient.delete(Endpoints.teams.removeFromSharedWishlist(teamId), {
      data: payload,
    });
  },
};
