/**
 * ListingsScreen (Browse) — 3-tab browser: Rooms | PGs | Flatmates
 * Grid layout for rooms/PGs, full-width profile cards for flatmates.
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { useAppDispatch } from '../../hooks/useRedux';
import { setRooms, appendRooms, Room } from '../../Redux/Slices/roomsSlice';
import { setPGs, appendPGs, PG } from '../../Redux/Slices/pgsSlice';
import { setRequirements, appendRequirements, Requirement } from '../../Redux/Slices/requirementsSlice';
import { ListingsService } from '../../services/listings.service';
import { DiscoverStackParamList } from '../../navigation/types';

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_GAP = spacing[3];
const CARD_W = (SCREEN_W - layout.screenPaddingH * 2 - GRID_GAP) / 2;

type Props = NativeStackScreenProps<DiscoverStackParamList, 'Browse'>;
type Tab = 'rooms' | 'pgs' | 'flatmates';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'rooms', label: 'Rooms', icon: 'home-outline' },
  { key: 'pgs', label: 'PGs', icon: 'business-outline' },
  { key: 'flatmates', label: 'Flatmates', icon: 'people-outline' },
];

// ── Room card (vertical grid) ──────────────────────────────────────────────
const RoomCard = ({ room, onPress }: { room: Room; onPress: () => void }) => (
  <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.88}>
    <View style={styles.gridCardImg}>
      {room.images?.[0] ? (
        <Image source={{ uri: room.images[0] }} style={styles.gridCardImgFull} resizeMode="cover" />
      ) : (
        <View style={styles.gridImgPlaceholder}>
          <Icon name="home-outline" size={30} color={colors.gray400} />
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.62)']}
        style={styles.gridImgGradient}
      />
      <View style={styles.gridPricePill}>
        <Text style={styles.gridPriceText}>₹{room.rent.toLocaleString()}</Text>
        <Text style={styles.gridPriceSub}>/mo</Text>
      </View>
      {room.preferredTenant && room.preferredTenant !== 'any' && (
        <View style={styles.gridTopBadge}>
          <Text style={styles.gridTopBadgeText}>{room.preferredTenant}</Text>
        </View>
      )}
    </View>
    <View style={styles.gridCardBody}>
      <Text style={styles.gridCardTitle} numberOfLines={1}>{room.title}</Text>
      <View style={styles.gridCardMeta}>
        <Icon name="location-outline" size={11} color={colors.muted} />
        <Text style={styles.gridCardLoc} numberOfLines={1}>{room.location}</Text>
      </View>
      {room.deposit ? (
        <Text style={styles.gridCardSub}>Dep ₹{room.deposit.toLocaleString()}</Text>
      ) : null}
    </View>
  </TouchableOpacity>
);

// ── PG card (vertical grid) ────────────────────────────────────────────────
const PGCard = ({ pg, onPress }: { pg: PG; onPress: () => void }) => (
  <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.88}>
    <View style={styles.gridCardImg}>
      {pg.images?.[0] ? (
        <Image source={{ uri: pg.images[0] }} style={styles.gridCardImgFull} resizeMode="cover" />
      ) : (
        <View style={styles.gridImgPlaceholder}>
          <Icon name="business-outline" size={30} color={colors.gray400} />
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.62)']}
        style={styles.gridImgGradient}
      />
      <View style={styles.gridPricePill}>
        <Text style={styles.gridPriceText}>₹{pg.rent.toLocaleString()}</Text>
        <Text style={styles.gridPriceSub}>/mo</Text>
      </View>
      {pg.gender && pg.gender !== 'unisex' && (
        <View style={[
          styles.gridTopBadge,
          pg.gender === 'female' ? styles.gridTopBadgeFemale : styles.gridTopBadgeMale,
        ]}>
          <Text style={[
            styles.gridTopBadgeText,
            pg.gender === 'female' ? styles.gridTopBadgeTextFemale : styles.gridTopBadgeTextMale,
          ]}>
            {pg.gender}
          </Text>
        </View>
      )}
    </View>
    <View style={styles.gridCardBody}>
      <Text style={styles.gridCardTitle} numberOfLines={1}>{pg.title}</Text>
      <View style={styles.gridCardMeta}>
        <Icon name="location-outline" size={11} color={colors.muted} />
        <Text style={styles.gridCardLoc} numberOfLines={1}>{pg.location}</Text>
      </View>
      {pg.meals ? (
        <View style={styles.mealsBadge}>
          <Icon name="restaurant-outline" size={10} color={colors.success} />
          <Text style={styles.mealsBadgeText}>Meals incl.</Text>
        </View>
      ) : null}
    </View>
  </TouchableOpacity>
);

// ── Requirement card (full-width profile card) ─────────────────────────────
const RequirementCard = ({ req, onPress }: { req: Requirement; onPress: () => void }) => (
  <TouchableOpacity style={styles.reqCard} onPress={onPress} activeOpacity={0.88}>
    <View style={styles.reqAvatarWrap}>
      {req.createdBy?.profileImage ? (
        <Image source={{ uri: req.createdBy.profileImage }} style={styles.reqAvatar} />
      ) : (
        <LinearGradient colors={colors.gradients.primary} style={styles.reqAvatarFallback}>
          <Text style={styles.reqAvatarInitial}>
            {req.createdBy?.name?.slice(0, 1).toUpperCase() ?? '?'}
          </Text>
        </LinearGradient>
      )}
    </View>
    <View style={styles.reqCardContent}>
      <Text style={styles.reqCardTitle} numberOfLines={1}>{req.title}</Text>
      <View style={styles.reqCardMeta}>
        <Icon name="location-outline" size={12} color={colors.muted} />
        <Text style={styles.reqCardLoc} numberOfLines={1}>{req.location}</Text>
      </View>
      <View style={styles.reqBudgetRow}>
        <LinearGradient
          colors={colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.reqBudgetPill}
        >
          <Text style={styles.reqBudgetText}>
            ₹{req.budget.min.toLocaleString()} – ₹{req.budget.max.toLocaleString()}
          </Text>
        </LinearGradient>
        {req.createdBy?.name ? (
          <Text style={styles.reqPostedBy}>by {req.createdBy.name}</Text>
        ) : null}
      </View>
    </View>
    <Icon name="chevron-forward" size={16} color={colors.gray300} style={styles.reqChevron} />
  </TouchableOpacity>
);

// ── Main screen ────────────────────────────────────────────────────────────
const ListingsScreen = ({ navigation, route }: Props) => {
  const dispatch = useAppDispatch();
  const initialTab = route.params?.initialTab ?? 'rooms';

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [rooms, setRoomsLocal] = useState<Room[]>([]);
  const [pgs, setPGsLocal] = useState<PG[]>([]);
  const [requirements, setRequirementsLocal] = useState<Requirement[]>([]);

  const [roomHasMore, setRoomHasMore] = useState(true);
  const [pgHasMore, setPGHasMore] = useState(true);
  const [reqHasMore, setReqHasMore] = useState(true);

  const pageRef = useRef({ rooms: 1, pgs: 1, flatmates: 1 });

  const loadTab = useCallback(
    async (tab: Tab, page = 1, append = false) => {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      try {
        const params = { page, limit: 10, search: search || undefined };
        if (tab === 'rooms') {
          const res = await ListingsService.getRooms(params);
          append ? setRoomsLocal(p => [...p, ...res.rooms]) : setRoomsLocal(res.rooms);
          setRoomHasMore(res.hasMore);
          if (!append) dispatch(setRooms(res.rooms));
          else dispatch(appendRooms(res.rooms));
        } else if (tab === 'pgs') {
          const res = await ListingsService.getPGs(params);
          append ? setPGsLocal(p => [...p, ...res.pgs]) : setPGsLocal(res.pgs);
          setPGHasMore(res.hasMore);
          if (!append) dispatch(setPGs(res.pgs));
          else dispatch(appendPGs(res.pgs));
        } else {
          const res = await ListingsService.getRequirements(params);
          append
            ? setRequirementsLocal(p => [...p, ...res.requirements])
            : setRequirementsLocal(res.requirements);
          setReqHasMore(res.hasMore);
          if (!append) dispatch(setRequirements(res.requirements));
          else dispatch(appendRequirements(res.requirements));
        }
      } catch { /* fail silently */ } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setRefreshing(false);
      }
    },
    [search, dispatch],
  );

  useEffect(() => {
    pageRef.current[activeTab] = 1;
    loadTab(activeTab, 1, false);
  }, [activeTab, loadTab]);

  const onRefresh = () => {
    setRefreshing(true);
    pageRef.current[activeTab] = 1;
    loadTab(activeTab, 1, false);
  };

  const onEndReached = () => {
    const hasMore =
      activeTab === 'rooms' ? roomHasMore : activeTab === 'pgs' ? pgHasMore : reqHasMore;
    if (!hasMore || isLoadingMore) return;
    const nextPage = pageRef.current[activeTab] + 1;
    pageRef.current[activeTab] = nextPage;
    loadTab(activeTab, nextPage, true);
  };

  const data =
    activeTab === 'rooms' ? rooms : activeTab === 'pgs' ? pgs : requirements;

  const isFlatmates = activeTab === 'flatmates';
  const numCols = isFlatmates ? 1 : 2;

  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === 'rooms')
      return (
        <RoomCard
          room={item as Room}
          onPress={() => navigation.navigate('RoomDetail', { roomId: item._id })}
        />
      );
    if (activeTab === 'pgs')
      return (
        <PGCard
          pg={item as PG}
          onPress={() => navigation.navigate('PGDetail', { pgId: item._id })}
        />
      );
    return (
      <RequirementCard
        req={item as Requirement}
        onPress={() => navigation.navigate('RoommateDetail', { requirementId: item._id })}
      />
    );
  };

  const Footer = () =>
    isLoadingMore ? (
      <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing[5] }} />
    ) : null;

  const Empty = () =>
    isLoading ? null : (
      <View style={styles.empty}>
        <View style={styles.emptyIconWrap}>
          <Icon name="search-outline" size={36} color={colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>No listings found</Text>
        <Text style={styles.emptySub}>Try adjusting your search or pull to refresh</Text>
      </View>
    );

  const tabLabel =
    activeTab === 'rooms' ? 'rooms' : activeTab === 'pgs' ? 'PGs' : 'flatmate requests';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* ── Header ──────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="chevron-back" size={20} color={colors.dark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Browse</Text>
          <Text style={styles.headerSub}>Find your perfect space</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* ── Search bar ──────────────────────────────────── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchInner}>
          <Icon name="search-outline" size={17} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${tabLabel}…`}
            placeholderTextColor={colors.subtle}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => { pageRef.current[activeTab] = 1; loadTab(activeTab, 1); }}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close-circle" size={17} color={colors.gray400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Tab bar ─────────────────────────────────────── */}
      <View style={styles.tabBar}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.75}
            >
              {isActive ? (
                <LinearGradient
                  colors={colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabGradient}
                >
                  <Icon name={tab.icon} size={15} color={colors.white} />
                  <Text style={[styles.tabLabel, styles.tabLabelActive]}>{tab.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabInner}>
                  <Icon name={tab.icon} size={15} color={colors.muted} />
                  <Text style={styles.tabLabel}>{tab.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── List ────────────────────────────────────────── */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading {tabLabel}…</Text>
        </View>
      ) : (
        <FlatList
          key={activeTab}
          data={data}
          keyExtractor={item => (item as any)._id}
          renderItem={renderItem}
          numColumns={numCols}
          columnWrapperStyle={isFlatmates ? undefined : styles.columnWrapper}
          ListEmptyComponent={<Empty />}
          ListFooterComponent={<Footer />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            data.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default ListingsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },

  // ── Header ────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  headerCenter: { alignItems: 'center', gap: 2 },
  headerTitle: { ...textPresets.h5, color: colors.dark },
  headerSub: { ...textPresets.caption, color: colors.muted },

  // ── Search ────────────────────────────────────────────────────
  searchWrap: {
    paddingHorizontal: layout.screenPaddingH,
    marginBottom: spacing[3],
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
    ...shadows.xs,
  },
  searchInput: {
    flex: 1,
    ...textPresets.body,
    color: colors.dark,
    paddingVertical: 0,
  },

  // ── Tab bar ───────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: layout.screenPaddingH,
    marginBottom: spacing[4],
    backgroundColor: colors.gray100,
    borderRadius: radius.full,
    padding: spacing[1],
    gap: spacing[1],
  },
  tabItem: { flex: 1, borderRadius: radius.full, overflow: 'hidden' },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1.5],
    paddingVertical: spacing[2.5],
    borderRadius: radius.full,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1.5],
    paddingVertical: spacing[2.5],
  },
  tabLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: colors.muted,
  },
  tabLabelActive: { color: colors.white },

  // ── List ──────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing[10],
  },
  listEmpty: { flex: 1, justifyContent: 'center' },
  columnWrapper: { gap: GRID_GAP, marginBottom: GRID_GAP },

  // ── Grid card (rooms / PGs) ───────────────────────────────────
  gridCard: {
    width: CARD_W,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  gridCardImg: {
    height: CARD_W * 0.9,
    backgroundColor: colors.surfaceDark,
    position: 'relative',
  },
  gridCardImgFull: { width: '100%', height: '100%' },
  gridImgPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceDark,
  },
  gridImgGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  gridPricePill: {
    position: 'absolute',
    bottom: spacing[2],
    left: spacing[2],
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
  },
  gridPriceText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: colors.white,
  },
  gridPriceSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.78)',
  },
  gridTopBadge: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,19,81,0.85)',
  },
  gridTopBadgeFemale: { backgroundColor: 'rgba(236,72,153,0.85)' },
  gridTopBadgeMale: { backgroundColor: 'rgba(59,130,246,0.85)' },
  gridTopBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: colors.white,
    textTransform: 'capitalize',
  },
  gridTopBadgeTextFemale: { color: colors.white },
  gridTopBadgeTextMale: { color: colors.white },
  gridCardBody: {
    padding: spacing[3],
    gap: spacing[1],
  },
  gridCardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: colors.dark,
  },
  gridCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  gridCardLoc: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: colors.muted,
    flex: 1,
  },
  gridCardSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: colors.subtle,
  },

  // ── Meals badge ───────────────────────────────────────────────
  mealsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.successLight,
  },
  mealsBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: colors.success,
  },

  // ── Requirement card (full-width) ─────────────────────────────
  reqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    gap: spacing[3],
    ...shadows.sm,
  },
  reqAvatarWrap: {
    flexShrink: 0,
  },
  reqAvatar: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
  },
  reqAvatarFallback: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqAvatarInitial: {
    fontFamily: 'Inter-ExtraBold',
    fontSize: 24,
    color: colors.white,
  },
  reqCardContent: { flex: 1, gap: spacing[1.5] },
  reqCardTitle: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: colors.dark },
  reqCardMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  reqCardLoc: { fontFamily: 'Inter-Regular', fontSize: 12, color: colors.muted, flex: 1 },
  reqBudgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  reqBudgetPill: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  reqBudgetText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: colors.white,
  },
  reqPostedBy: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: colors.muted,
  },
  reqChevron: { flexShrink: 0 },

  // ── Loading / empty ───────────────────────────────────────────
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  loadingText: {
    ...textPresets.bodySm,
    color: colors.muted,
  },
  empty: {
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: layout.screenPaddingH,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...textPresets.h5, color: colors.dark },
  emptySub: { ...textPresets.bodySm, color: colors.muted, textAlign: 'center' },
});
