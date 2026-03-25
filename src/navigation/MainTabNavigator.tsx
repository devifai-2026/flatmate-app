import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors, radius, shadows } from '../theme';
import {
  MainTabParamList,
  HomeStackParamList,
  DiscoverStackParamList,
  ChatStackParamList,
  ProfileStackParamList,
} from './types';

// ── Home Stack ─────────────────────────────────────────────
import DashboardScreen from '../Screens/home/DashboardScreen';
import NotificationsScreen from '../Screens/home/NotificationsScreen';

// ── Discover Stack ─────────────────────────────────────────
import DiscoverScreen from '../Screens/discover/DiscoverScreen';
import FlatmateProfileScreen from '../Screens/discover/FlatmateProfileScreen';
import ListingsScreen from '../Screens/listings/ListingsScreen';
import RoomDetailScreen from '../Screens/listings/RoomDetailScreen';
import PGDetailScreen from '../Screens/listings/PGDetailScreen';
import RoommateDetailScreen from '../Screens/listings/RoommateDetailScreen';

// ── Chat Stack ─────────────────────────────────────────────
import ChatListScreen from '../Screens/chat/ChatListScreen';
import ChatDetailScreen from '../Screens/chat/ChatDetailScreen';

// ── Profile Stack ──────────────────────────────────────────
import MyProfileScreen from '../Screens/profile/MyProfileScreen';
import EditProfileScreen from '../Screens/profile/EditProfileScreen';
import ViewUserProfileScreen from '../Screens/profile/ViewUserProfileScreen';
import SavedScreen from '../Screens/profile/SavedScreen';
import WalletScreen from '../Screens/wallet/WalletScreen';
import TeamsScreen from '../Screens/teams/TeamsScreen';
import CreateTeamScreen from '../Screens/teams/CreateTeamScreen';
import TeamDetailScreen from '../Screens/teams/TeamDetailScreen';
import PreferencesScreen from '../Screens/settings/PreferencesScreen';
import PostListingScreen from '../Screens/settings/PostListingScreen';
import BlockedUsersScreen from '../Screens/settings/BlockedUsersScreen';

// ── Sub-Stack Navigators ───────────────────────────────────
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const HomeNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
    <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
  </HomeStack.Navigator>
);

const DiscoverStack = createNativeStackNavigator<DiscoverStackParamList>();
const DiscoverNavigator = () => (
  <DiscoverStack.Navigator screenOptions={{ headerShown: false }}>
    <DiscoverStack.Screen name="Discover" component={DiscoverScreen} />
    <DiscoverStack.Screen name="FlatmateProfile" component={FlatmateProfileScreen} />
    <DiscoverStack.Screen name="Browse" component={ListingsScreen} />
    <DiscoverStack.Screen name="RoomDetail" component={RoomDetailScreen} />
    <DiscoverStack.Screen name="PGDetail" component={PGDetailScreen} />
    <DiscoverStack.Screen name="RoommateDetail" component={RoommateDetailScreen} />
  </DiscoverStack.Navigator>
);

const ChatStack = createNativeStackNavigator<ChatStackParamList>();
const ChatNavigator = () => (
  <ChatStack.Navigator screenOptions={{ headerShown: false }}>
    <ChatStack.Screen name="ChatList" component={ChatListScreen} />
    <ChatStack.Screen name="ChatDetail" component={ChatDetailScreen} />
  </ChatStack.Navigator>
);

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const ProfileNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="MyProfile" component={MyProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="ViewUserProfile" component={ViewUserProfileScreen} />
    <ProfileStack.Screen name="Saved" component={SavedScreen} />
    <ProfileStack.Screen name="Wallet" component={WalletScreen} />
    <ProfileStack.Screen name="Teams" component={TeamsScreen} />
    <ProfileStack.Screen name="CreateTeam" component={CreateTeamScreen} />
    <ProfileStack.Screen name="TeamDetail" component={TeamDetailScreen} />
    <ProfileStack.Screen name="Preferences" component={PreferencesScreen} />
    <ProfileStack.Screen name="PostListing" component={PostListingScreen} />
    <ProfileStack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
  </ProfileStack.Navigator>
);

// ── Bottom Tab Navigator ───────────────────────────────────
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: true,
      tabBarActiveTintColor: colors.tabActive,
      tabBarInactiveTintColor: colors.tabInactive,
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: Platform.OS === 'ios' ? 0 : 4,
      },
      tabBarStyle: {
        height: Platform.OS === 'ios' ? 84 : 64,
        backgroundColor: colors.tabBackground,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        paddingTop: 8,
        ...shadows.sm,
      },
      tabBarIcon: ({ focused, color }) => {
        const icons: Record<string, [string, string]> = {
          HomeTab: ['home', 'home-outline'],
          DiscoverTab: ['compass', 'compass-outline'],
          ChatTab: ['chatbubble-ellipses', 'chatbubble-ellipses-outline'],
          ProfileTab: ['person', 'person-outline'],
        };
        const [activeIcon, inactiveIcon] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
        return (
          <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
            <Icon name={focused ? activeIcon : inactiveIcon} size={22} color={color} />
          </View>
        );
      },
    })}
  >
    <Tab.Screen name="HomeTab" component={HomeNavigator} options={{ tabBarLabel: 'Home' }} />
    <Tab.Screen name="DiscoverTab" component={DiscoverNavigator} options={{ tabBarLabel: 'Discover' }} />
    <Tab.Screen name="ChatTab" component={ChatNavigator} options={{ tabBarLabel: 'Chat' }} />
    <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ tabBarLabel: 'Profile' }} />
  </Tab.Navigator>
);

export default MainTabNavigator;

const styles = StyleSheet.create({
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.primarySubtle,
  },
});
