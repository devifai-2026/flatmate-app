/**
 * DashboardScreen — Home tab root
 * Greeting + wallet balance + quick browse + matches preview + featured listings
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { setMatches } from '../../Redux/Slices/matchesSlice';
import { setRooms } from '../../Redux/Slices/roomsSlice';
import { setPGs } from '../../Redux/Slices/pgsSlice';
import { setUnreadCount } from '../../Redux/Slices/notificationsSlice';
import { ListingsService, NotificationsService } from '../../services/listings.service';
import { HomeStackParamList } from '../../navigation/types';

type DashboardNav = NativeStackNavigationProp<HomeStackParamList, 'Dashboard'>;

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const getScoreColor = (score: number) =>
  score >= 80 ? colors.success : score >= 60 ? colors.warning : colors.error;

const QUICK_FILTERS = [
  { icon: 'home-outline', label: 'Rooms', tab: 'rooms' as const },
  { icon: 'business-outline', label: 'PGs', tab: 'pgs' as const },
  { icon: 'people-outline', label: 'Flatmates', tab: 'flatmates' as const },
];

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardNav>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const matches = useAppSelector(s => s.matches.list);
  const rooms = useAppSelector(s => s.rooms.list);
  const pgs = useAppSelector(s => s.pgs.list);
  const unreadCount = useAppSelector(s => s.notifications.unreadCount);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?._id) { setIsLoading(false); return; }
    try {
      const [matchResult, roomResult, pgResult, countResult] = await Promise.allSettled([
        ListingsService.getMatches(user._id),
        ListingsService.getRooms({ page: 1, limit: 8 }),
        ListingsService.getPGs({ page: 1, limit: 8 }),
        NotificationsService.getUnreadCount(),
      ]);
      if (matchResult.status === 'fulfilled') dispatch(setMatches(matchResult.value));
      if (roomResult.status === 'fulfilled') dispatch(setRooms(roomResult.value.rooms));
      if (pgResult.status === 'fulfilled') dispatch(setPGs(pgResult.value.pgs));
      if (countResult.status === 'fulfilled') dispatch(setUnreadCount(countResult.value));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?._id, dispatch]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  // Cross-tab navigation helpers
  const goDiscover = () =>
    (navigation as any).getParent()?.navigate('DiscoverTab', { screen: 'Discover' });
  const goBrowse = (tab: 'rooms' | 'pgs' | 'flatmates') =>
    (navigation as any).getParent()?.navigate('DiscoverTab', {
      screen: 'Browse',
      params: { initialTab: tab },
    });
  const goWallet = () =>
    (navigation as any).getParent()?.navigate('ProfileTab', { screen: 'Wallet' });
  const goFlatmateProfile = (userId: string) =>
    (navigation as any).getParent()?.navigate('DiscoverTab', {
      screen: 'FlatmateProfile',
      params: { userId },
    });
  const goRoomDetail = (roomId: string) =>
    (navigation as any).getParent()?.navigate('DiscoverTab', {
      screen: 'RoomDetail',
      params: { roomId },
    });
  const goPGDetail = (pgId: string) =>
    (navigation as any).getParent()?.navigate('DiscoverTab', {
      screen: 'PGDetail',
      params: { pgId },
    });
  const goProfile = () =>
    (navigation as any).getParent()?.navigate('ProfileTab', { screen: 'MyProfile' });

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const initials = (user?.name ?? 'U')
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ── Header ──────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetSmall}>{getGreeting()}</Text>
            <Text style={styles.greetName}>{firstName} 👋</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => navigation.navigate('Notifications')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="notifications-outline" size={22} color={colors.dark} />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadCount > 9 ? '9+' : String(unreadCount)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarBtn} onPress={goProfile}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
              ) : (
                <LinearGradient colors={colors.gradients.primary} style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Wallet card ─────────────────────────────── */}
        <TouchableOpacity onPress={goWallet} activeOpacity={0.88}>
          <LinearGradient
            colors={colors.gradients.primaryDeep}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.6 }}
            style={styles.walletCard}
          >
            <View style={styles.walletLeft}>
              <View style={styles.walletIconWrap}>
                <Icon name="flash" size={16} color={colors.white} />
              </View>
              <View>
                <Text style={styles.walletLabel}>Wallet Balance</Text>
                <Text style={styles.walletBalance}>
                  ₹{(user?.walletBalance ?? 0).toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.walletRight}>
              <Text style={styles.walletRecharge}>Recharge</Text>
              <Icon name="chevron-forward" size={14} color="rgba(255,255,255,0.8)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Quick Browse ─────────────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: spacing[6] }]}>Browse</Text>
        <View style={styles.quickRow}>
          {QUICK_FILTERS.map(({ icon, label, tab }) => (
            <TouchableOpacity
              key={tab}
              style={styles.quickChip}
              onPress={() => goBrowse(tab)}
              activeOpacity={0.75}
            >
              <View style={styles.quickIconWrap}>
                <Icon name={icon} size={26} color={colors.primary} />
              </View>
              <Text style={styles.quickLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Matches section ─────────────────────────── */}
        {matches.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Your Matches</Text>
              <TouchableOpacity onPress={goDiscover} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
            >
              {matches.slice(0, 7).map((m) => (
                <TouchableOpacity
                  key={m.user._id}
                  style={styles.matchCard}
                  onPress={() => goFlatmateProfile(m.user._id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.matchAvatarWrap}>
                    {m.user.profileImage ? (
                      <Image source={{ uri: m.user.profileImage }} style={styles.matchAvatar} />
                    ) : (
                      <LinearGradient
                        colors={colors.gradients.primary}
                        style={styles.matchAvatarFallback}
                      >
                        <Text style={styles.matchInitial}>
                          {m.user.name.slice(0, 1).toUpperCase()}
                        </Text>
                      </LinearGradient>
                    )}
                    <View style={[styles.scorePip, { backgroundColor: getScoreColor(m.score) }]}>
                      <Text style={styles.scorePipText}>{m.score}</Text>
                    </View>
                  </View>
                  <Text style={styles.matchName} numberOfLines={1}>
                    {m.user.name.split(' ')[0]}
                  </Text>
                  <Text style={styles.matchCity} numberOfLines={1}>
                    {m.user.city ?? '—'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── Listings sections ───────────────────────── */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        ) : (
          <>
            {/* Featured Rooms */}
            {rooms.length > 0 && (
              <>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Featured Rooms</Text>
                  <TouchableOpacity onPress={() => goBrowse('rooms')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.seeAll}>See all →</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hScroll}
                >
                  {rooms.slice(0, 6).map((room) => (
                    <TouchableOpacity
                      key={room._id}
                      style={styles.listCard}
                      onPress={() => goRoomDetail(room._id)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.listCardImg}>
                        {room.images?.[0] ? (
                          <Image
                            source={{ uri: room.images[0] }}
                            style={styles.listCardImgFull}
                            resizeMode="cover"
                          />
                        ) : (
                          <Icon name="home-outline" size={30} color={colors.gray300} />
                        )}
                      </View>
                      <View style={styles.listCardBody}>
                        <Text style={styles.listCardTitle} numberOfLines={1}>
                          {room.title}
                        </Text>
                        <View style={styles.listCardMeta}>
                          <Icon name="location-outline" size={11} color={colors.muted} />
                          <Text style={styles.listCardMetaText} numberOfLines={1}>
                            {room.location}
                          </Text>
                        </View>
                        <Text style={styles.listCardRent}>
                          ₹{room.rent.toLocaleString()}/mo
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Featured PGs */}
            {pgs.length > 0 && (
              <>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Featured PGs</Text>
                  <TouchableOpacity onPress={() => goBrowse('pgs')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.seeAll}>See all →</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hScroll}
                >
                  {pgs.slice(0, 6).map((pg) => (
                    <TouchableOpacity
                      key={pg._id}
                      style={styles.listCard}
                      onPress={() => goPGDetail(pg._id)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.listCardImg}>
                        {pg.images?.[0] ? (
                          <Image
                            source={{ uri: pg.images[0] }}
                            style={styles.listCardImgFull}
                            resizeMode="cover"
                          />
                        ) : (
                          <Icon name="business-outline" size={30} color={colors.gray300} />
                        )}
                      </View>
                      <View style={styles.listCardBody}>
                        <Text style={styles.listCardTitle} numberOfLines={1}>
                          {pg.title}
                        </Text>
                        <View style={styles.listCardMeta}>
                          <Icon name="location-outline" size={11} color={colors.muted} />
                          <Text style={styles.listCardMetaText} numberOfLines={1}>
                            {pg.location}
                          </Text>
                        </View>
                        <Text style={styles.listCardRent}>
                          ₹{pg.rent.toLocaleString()}/mo
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {rooms.length === 0 && pgs.length === 0 && (
              <View style={styles.emptyBox}>
                <Icon name="search-outline" size={44} color={colors.gray300} />
                <Text style={styles.emptyText}>No listings yet</Text>
                <Text style={styles.emptySubText}>
                  Pull down to refresh or check back soon
                </Text>
              </View>
            )}
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingHorizontal: layout.screenPaddingH, paddingTop: spacing[4] },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[5],
  },
  greetSmall: { ...textPresets.caption, color: colors.muted },
  greetName: { ...textPresets.h4, color: colors.dark },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    overflow: 'hidden',
    ...shadows.sm,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 15, fontWeight: '800', color: colors.white },

  // ── Wallet card ─────────────────────────────────────────
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.xl,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    ...shadows.primarySm,
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  walletIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletLabel: { ...textPresets.caption, color: 'rgba(255,255,255,0.75)' },
  walletBalance: { ...textPresets.h5, color: colors.white, lineHeight: 22 },
  walletRight: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  walletRecharge: { ...textPresets.labelSm, color: 'rgba(255,255,255,0.85)' },

  // ── Sections ────────────────────────────────────────────
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
    marginTop: spacing[6],
  },
  sectionTitle: {
    ...textPresets.h6,
    color: colors.dark,
    marginBottom: spacing[3],
    marginTop: spacing[6],
  },
  seeAll: { ...textPresets.labelSm, color: colors.primary },

  // ── Quick Browse ─────────────────────────────────────────
  quickRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  quickChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    paddingVertical: spacing[4],
    gap: spacing[2],
    ...shadows.xs,
  },
  quickIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { ...textPresets.labelSm, color: colors.dark },

  // ── Horizontal scroll ───────────────────────────────────
  hScroll: { paddingRight: spacing[4], paddingBottom: spacing[2] },

  // ── Match cards ─────────────────────────────────────────
  matchCard: {
    width: 72,
    alignItems: 'center',
    marginRight: spacing[4],
  },
  matchAvatarWrap: {
    position: 'relative',
    marginBottom: spacing[2],
  },
  matchAvatar: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
  },
  matchAvatarFallback: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchInitial: { fontSize: 22, fontWeight: '800', color: colors.white },
  scorePip: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    minWidth: 22,
    height: 22,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    paddingHorizontal: 3,
  },
  scorePipText: { fontSize: 9, fontWeight: '800', color: colors.white },
  matchName: { ...textPresets.labelSm, color: colors.dark, textAlign: 'center' },
  matchCity: { ...textPresets.caption, color: colors.muted, textAlign: 'center' },

  // ── Listing cards (horizontal) ──────────────────────────
  listCard: {
    width: 160,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginRight: spacing[3],
    ...shadows.xs,
  },
  listCardImg: {
    height: 100,
    backgroundColor: colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCardImgFull: { width: '100%', height: '100%' },
  listCardBody: { padding: spacing[3] },
  listCardTitle: { ...textPresets.label, color: colors.dark, marginBottom: spacing[1] },
  listCardMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginBottom: spacing[1.5] },
  listCardMetaText: { ...textPresets.caption, color: colors.muted, flex: 1 },
  listCardRent: { ...textPresets.labelSm, color: colors.primary },

  // ── Loading / empty ─────────────────────────────────────
  loadingBox: { marginVertical: spacing[10], alignItems: 'center' },
  emptyBox: {
    alignItems: 'center',
    marginVertical: spacing[10],
    gap: spacing[2],
  },
  emptyText: { ...textPresets.h6, color: colors.dark },
  emptySubText: { ...textPresets.bodySm, color: colors.muted, textAlign: 'center' },

  bottomPad: { height: spacing[8] },
});
