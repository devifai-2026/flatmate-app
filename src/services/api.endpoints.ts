/**
 * Flatmate API Endpoints
 * All paths are relative to BASE_URL (e.g. /api)
 */

export const Endpoints = {
  // ── Auth ──────────────────────────────────────────────────
  auth: {
    sendOtp: '/auth/send-otp',
    verifyOtp: '/auth/verify-otp',
  },

  // ── User ──────────────────────────────────────────────────
  user: {
    me: '/users/me',
    preferences: '/users/preferences',
    byId: (id: string) => `/users/${id}`,
  },

  // ── Onboarding ────────────────────────────────────────────
  onboarding: {
    step1: '/onboarding/step1',
    step2: '/onboarding/step2',
    location: '/onboarding/location',
  },

  // ── Rooms ─────────────────────────────────────────────────
  rooms: {
    list: '/rooms',
    create: '/rooms',
    byId: (id: string) => `/rooms/${id}`,
    update: (id: string) => `/rooms/${id}`,
    delete: (id: string) => `/rooms/${id}`,
  },

  // ── PGs ───────────────────────────────────────────────────
  pgs: {
    list: '/pgs',
    create: '/pgs',
    byId: (id: string) => `/pgs/${id}`,
    update: (id: string) => `/pgs/${id}`,
    delete: (id: string) => `/pgs/${id}`,
  },

  // ── Requirements ──────────────────────────────────────────
  requirements: {
    list: '/requirements',
    create: '/requirements',
    byId: (id: string) => `/requirements/${id}`,
    update: (id: string) => `/requirements/${id}`,
    delete: (id: string) => `/requirements/${id}`,
  },

  // ── Roommates ─────────────────────────────────────────────
  roommates: {
    list: '/roommates',
    create: '/roommates',
  },

  // ── Match (AI) ────────────────────────────────────────────
  match: {
    forUser: (userId: string) => `/match/${userId}`,
  },

  // ── Chat ──────────────────────────────────────────────────
  chat: {
    conversations: '/chat/conversations',
    messages: (conversationId: string) => `/chat/${conversationId}/messages`,
    sendMessage: (conversationId: string) => `/chat/${conversationId}/messages`,
    markRead: (conversationId: string) => `/chat/${conversationId}/read`,
    deleteMessage: (messageId: string) => `/chat/messages/${messageId}`,
    block: '/chat/block',
    unblock: '/chat/unblock',
  },

  // ── Enquiry (₹19 paid access) ────────────────────────────
  enquiry: {
    createOrder: '/enquiry/order',
    verify: '/enquiry/verify',
    mine: '/enquiry/mine',
    access: (listingId: string) => `/enquiry/access/${listingId}`,
  },

  // ── Wishlist ──────────────────────────────────────────────
  wishlist: {
    toggle: '/wishlist/toggle',
    list: '/wishlist',
    ids: '/wishlist/ids',
  },

  // ── Wallet ────────────────────────────────────────────────
  wallet: {
    balance: '/wallet/balance',
    recharge: '/wallet/recharge',
    rechargeVerify: '/wallet/recharge/verify',
    unlock: '/wallet/unlock',
    access: (listingType: string, listingId: string) =>
      `/wallet/access/${listingType}/${listingId}`,
    unlocked: '/wallet/unlocked',
    transactions: '/wallet/transactions',
  },

  // ── Notifications ─────────────────────────────────────────
  notifications: {
    list: '/notifications',
    unreadCount: '/notifications/unread-count',
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    delete: (id: string) => `/notifications/${id}`,
    clear: '/notifications',
  },

  // ── Teams ─────────────────────────────────────────────────
  teams: {
    create: '/teams',
    join: '/teams/join',
    list: '/teams',
    byId: (id: string) => `/teams/${id}`,
    delete: (id: string) => `/teams/${id}`,
    leave: (id: string) => `/teams/${id}/leave`,
    sharedWishlist: (id: string) => `/teams/${id}/wishlist`,
    addToSharedWishlist: (id: string) => `/teams/${id}/wishlist`,
    removeFromSharedWishlist: (id: string) => `/teams/${id}/wishlist`,
  },
} as const;
