import { apiClient } from './api.client';
import { Endpoints } from './api.endpoints';
import { Room } from '../Redux/Slices/roomsSlice';
import { PG } from '../Redux/Slices/pgsSlice';
import { Requirement } from '../Redux/Slices/requirementsSlice';
import { Match } from '../Redux/Slices/matchesSlice';
import { AppNotification } from '../Redux/Slices/notificationsSlice';

export interface ListParams {
  page?: number;
  limit?: number;
  city?: string;
  minRent?: number;
  maxRent?: number;
  search?: string;
}

export const ListingsService = {
  // ── Rooms ──────────────────────────────────────────────────
  getRooms: async (params?: ListParams): Promise<{ rooms: Room[]; hasMore: boolean }> => {
    const { data } = await apiClient.get(Endpoints.rooms.list, { params });
    return {
      rooms: data.rooms ?? data.data ?? [],
      hasMore: data.hasMore ?? data.pagination?.hasNextPage ?? false,
    };
  },

  getRoomById: async (id: string): Promise<Room> => {
    const { data } = await apiClient.get(Endpoints.rooms.byId(id));
    return data.room ?? data.data;
  },

  // ── PGs ────────────────────────────────────────────────────
  getPGs: async (params?: ListParams): Promise<{ pgs: PG[]; hasMore: boolean }> => {
    const { data } = await apiClient.get(Endpoints.pgs.list, { params });
    return {
      pgs: data.pgs ?? data.data ?? [],
      hasMore: data.hasMore ?? data.pagination?.hasNextPage ?? false,
    };
  },

  getPGById: async (id: string): Promise<PG> => {
    const { data } = await apiClient.get(Endpoints.pgs.byId(id));
    return data.pg ?? data.data;
  },

  // ── Requirements ───────────────────────────────────────────
  getRequirements: async (
    params?: ListParams,
  ): Promise<{ requirements: Requirement[]; hasMore: boolean }> => {
    const { data } = await apiClient.get(Endpoints.requirements.list, { params });
    return {
      requirements: data.requirements ?? data.data ?? [],
      hasMore: data.hasMore ?? data.pagination?.hasNextPage ?? false,
    };
  },

  getRequirementById: async (id: string): Promise<Requirement> => {
    const { data } = await apiClient.get(Endpoints.requirements.byId(id));
    return data.requirement ?? data.data;
  },

  // ── Matches ────────────────────────────────────────────────
  getMatches: async (userId: string): Promise<Match[]> => {
    const { data } = await apiClient.get(Endpoints.match.forUser(userId));
    return data.matches ?? data.data ?? [];
  },

  // ── Wishlist ───────────────────────────────────────────────
  toggleWishlist: async (
    listingId: string,
    listingType: 'room' | 'pg' | 'requirement',
  ): Promise<{ saved: boolean }> => {
    const { data } = await apiClient.post(Endpoints.wishlist.toggle, {
      listingId,
      listingType,
    });
    return { saved: data.saved ?? data.isSaved ?? false };
  },

  getWishlistIds: async (): Promise<string[]> => {
    const { data } = await apiClient.get(Endpoints.wishlist.ids);
    return data.ids ?? [];
  },

  getWishlist: async (): Promise<import('../Redux/Slices/wishlistSlice').WishlistItem[]> => {
    const { data } = await apiClient.get(Endpoints.wishlist.list);
    return data.wishlist ?? data.items ?? data.data ?? [];
  },
};

export const NotificationsService = {
  getNotifications: async (): Promise<AppNotification[]> => {
    const { data } = await apiClient.get(Endpoints.notifications.list);
    return data.notifications ?? data.data ?? [];
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get(Endpoints.notifications.unreadCount);
    return data.count ?? data.unreadCount ?? 0;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.put(Endpoints.notifications.markRead(id));
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.put(Endpoints.notifications.markAllRead);
  },

  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(Endpoints.notifications.delete(id));
  },
};
