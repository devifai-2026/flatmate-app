/**
 * MyProfileScreen — Authenticated user's own profile hub
 *
 * Sections:
 *  • Gradient hero — avatar, name, city, userType badge
 *  • Stats row — wallet balance, saved count
 *  • Lifestyle tags strip (horizontal scroll)
 *  • Menu list — navigates to all profile sub-screens
 *  • Logout button
 */

import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout } from '../../Redux/Slices/authSlice';
import { setBalance } from '../../Redux/Slices/walletSlice';
import { setSavedIds } from '../../Redux/Slices/wishlistSlice';
import { WalletService } from '../../services/wallet.service';
import { ListingsService } from '../../services/listings.service';
import { persistor } from '../../Redux/store';
import { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'MyProfile'>;

// ── Data ──────────────────────────────────────────────────────────────────────

const USER_TYPE_LABELS: Record<string, string> = {
  seeker: 'Flatmate Seeker',
  'flat-owner': 'Flat Owner',
  'pg-owner': 'PG Owner',
};

type MenuItem = {
  icon: string;
  label: string;
  route: keyof ProfileStackParamList;
  tint?: string;
};

const MENU: MenuItem[] = [
  { icon: 'create-outline',      label: 'Edit Profile',     route: 'EditProfile' },
  { icon: 'wallet-outline',      label: 'Wallet & Payments',route: 'Wallet' },
  { icon: 'bookmark-outline',    label: 'Saved Items',      route: 'Saved' },
  { icon: 'people-outline',      label: 'Teams',            route: 'Teams' },
  { icon: 'options-outline',     label: 'Preferences',      route: 'Preferences' },
  { icon: 'add-circle-outline',  label: 'Post a Listing',   route: 'PostListing' },
  { icon: 'ban-outline',         label: 'Blocked Users',    route: 'BlockedUsers', tint: colors.muted },
];

// ── Screen ────────────────────────────────────────────────────────────────────

const MyProfileScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const user     = useAppSelector(s => s.auth.user);
  const balance  = useAppSelector(s => s.wallet.balance);
  const savedCount = useAppSelector(s => s.wishlist.savedIds.length);

  useEffect(() => {
    WalletService.getBalance()
      .then(b => dispatch(setBalance(b)))
      .catch(() => {});
    ListingsService.getWishlistIds()
      .then(ids => dispatch(setSavedIds(ids)))
      .catch(() => {});
  }, [dispatch]);

  const handleLogout = useCallback(() => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
          persistor.purge();
          // RootNavigator auto-redirects to Auth when isAuthenticated → false
        },
      },
    ]);
  }, [dispatch]);

  if (!user) return null;

  const initials = (user.name ?? '')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero ── */}
        <LinearGradient
          colors={colors.gradients.primaryDeep}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>

          {/* Edit shortcut */}
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => navigation.navigate('EditProfile')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="create-outline" size={20} color={colors.white} />
          </TouchableOpacity>

          {/* Avatar */}
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}

          <Text style={styles.heroName}>{user.name}</Text>

          <View style={styles.heroMeta}>
            {user.city ? (
              <View style={styles.heroPill}>
                <Icon name="location-outline" size={13} color="rgba(255,255,255,0.85)" />
                <Text style={styles.heroPillText}>{user.city}</Text>
              </View>
            ) : null}
            {user.userType ? (
              <View style={[styles.heroPill, styles.heroPillBorder]}>
                <Text style={styles.heroPillText}>
                  {USER_TYPE_LABELS[user.userType] ?? user.userType}
                </Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('Wallet')}
            activeOpacity={0.75}>
            <Icon name="wallet" size={20} color={colors.primary} />
            <Text style={styles.statValue}>₹{balance}</Text>
            <Text style={styles.statLabel}>Wallet</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('Saved')}
            activeOpacity={0.75}>
            <Icon name="bookmark" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{savedCount}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </TouchableOpacity>
        </View>

        {/* ── Lifestyle tags ── */}
        {user.lifestyleTags && user.lifestyleTags.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lifestyle</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsScroll}>
              {user.lifestyleTags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* ── Menu list ── */}
        <View style={styles.menuCard}>
          {MENU.map((item, index) => (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.menuRow,
                index < MENU.length - 1 && styles.menuRowBorder,
              ]}
              onPress={() => navigation.navigate(item.route as any)}
              activeOpacity={0.72}>
              <View style={styles.menuIconWrap}>
                <Icon
                  name={item.icon}
                  size={20}
                  color={item.tint ?? colors.primary}
                />
              </View>
              <Text style={[styles.menuLabel, item.tint ? { color: item.tint } : null]}>
                {item.label}
              </Text>
              <Icon name="chevron-forward" size={16} color={colors.subtle} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}>
          <Icon name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyProfileScreen;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingBottom: spacing[4] },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: spacing[8],
    paddingBottom: spacing[8],
    paddingHorizontal: layout.screenPaddingH,
  },
  editIcon: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    padding: spacing[2],
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: spacing[3],
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: spacing[3],
  },
  avatarInitials: {
    ...textPresets.h4,
    color: colors.white,
  },
  heroName: {
    ...textPresets.h4,
    color: colors.white,
    marginBottom: spacing[2],
  },
  heroMeta: {
    flexDirection: 'row',
    gap: spacing[2],
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  heroPillBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroPillText: {
    ...textPresets.caption,
    color: 'rgba(255,255,255,0.9)',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceCard,
    marginHorizontal: layout.screenPaddingH,
    marginTop: -spacing[5],
    borderRadius: radius.xl,
    ...shadows.md,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[5],
    gap: spacing[1],
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing[4],
  },
  statValue: {
    ...textPresets.h5,
    color: colors.dark,
  },
  statLabel: {
    ...textPresets.caption,
    color: colors.muted,
  },

  // Lifestyle
  section: {
    marginTop: spacing[6],
    paddingHorizontal: layout.screenPaddingH,
  },
  sectionTitle: {
    ...textPresets.labelSm,
    color: colors.muted,
    marginBottom: spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tagsScroll: {
    gap: spacing[2],
    paddingBottom: spacing[1],
  },
  tag: {
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
  },
  tagText: {
    ...textPresets.caption,
    color: colors.primary,
    textTransform: 'capitalize',
  },

  // Menu
  menuCard: {
    backgroundColor: colors.surfaceCard,
    marginHorizontal: layout.screenPaddingH,
    marginTop: spacing[6],
    borderRadius: radius.xl,
    ...shadows.xs,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    gap: spacing[3],
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    ...textPresets.label,
    color: colors.dark,
    flex: 1,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginHorizontal: layout.screenPaddingH,
    marginTop: spacing[4],
    paddingVertical: spacing[4],
    backgroundColor: colors.errorLight,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
  },
  logoutText: {
    ...textPresets.label,
    color: colors.error,
  },
});
