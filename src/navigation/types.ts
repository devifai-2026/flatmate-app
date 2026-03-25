/**
 * Flatmate Navigation Type Definitions
 * Provides full TypeScript safety across all navigators.
 */

// ── Auth Stack ────────────────────────────────────────────
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  OTPVerification: { phone: string };
};

// ── Onboarding Stack ──────────────────────────────────────
// Streamlined to 4 screens that map cleanly to backend:
//   step1: name + userType + gender + city + profileImage
//   step2: lifestyleTags (≥5) → onboardingComplete = true
export type OnboardingStackParamList = {
  /** Step 1 — Collect name + who you are (userType) */
  OnboardingWho: undefined;
  /** Step 2 — Collect gender + city + avatar */
  OnboardingProfile: {
    name: string;
    userType: 'seeker' | 'pg-owner' | 'flat-owner';
  };
  /** Step 3 — Pick ≥5 lifestyle tags */
  OnboardingLifestyle: {
    name: string;
    userType: 'seeker' | 'pg-owner' | 'flat-owner';
    gender: 'male' | 'female';
    city: string;
    profileImage: string;
  };
  /** Step 4 — Preview + submit (calls step1 + step2 APIs) */
  ProfilePreview: {
    name: string;
    userType: 'seeker' | 'pg-owner' | 'flat-owner';
    gender: 'male' | 'female';
    city: string;
    profileImage: string;
    lifestyleTags: string[];
  };
};

// ── Home Stack ────────────────────────────────────────────
export type HomeStackParamList = {
  Dashboard: undefined;
  Notifications: undefined;
};

// ── Discover Stack ────────────────────────────────────────
export type DiscoverStackParamList = {
  /** AI-matched roommates grid */
  Discover: undefined;
  /** Full profile of a matched user */
  FlatmateProfile: { userId: string };
  /** Browse listings — 3 tabs: Rooms / PGs / Flatmates */
  Browse: { initialTab?: 'rooms' | 'pgs' | 'flatmates' };
  RoomDetail: { roomId: string };
  PGDetail: { pgId: string };
  /** Requirement/roommate post detail */
  RoommateDetail: { requirementId: string };
};

// ── Chat Stack ────────────────────────────────────────────
export type ChatStackParamList = {
  ChatList: undefined;
  ChatDetail: {
    conversationId: string;
    participantName: string;
    participantImage?: string;
    participantId: string;
  };
};

// ── Profile Stack ─────────────────────────────────────────
export type ProfileStackParamList = {
  MyProfile: undefined;
  EditProfile: undefined;
  ViewUserProfile: { userId: string };
  Saved: undefined;
  Wallet: undefined;
  Teams: undefined;
  CreateTeam: undefined;
  TeamDetail: { teamId: string };
  Preferences: undefined;
  PostListing: { type?: 'room' | 'pg' | 'requirement' };
  BlockedUsers: undefined;
};

// ── Main Tab Param List ───────────────────────────────────
export type MainTabParamList = {
  HomeTab: undefined;
  DiscoverTab: undefined;
  ChatTab: undefined;
  ProfileTab: undefined;
};

// ── Root Param List (top-level) ───────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};
