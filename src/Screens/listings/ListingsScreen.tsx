/**
 * ListingsScreen (Browse) — 3-tab browser: Rooms | PGs | Flatmates
 * Search + filter chips + infinite-scroll FlatList per tab.
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

type Props = NativeStackScreenProps<DiscoverStackParamList, 'Browse'>;
type Tab = 'rooms' | 'pgs' | 'flatmates';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'rooms', label: 'Rooms', icon: 'home-outline' },
  { key: 'pgs', label: 'PGs', icon: 'business-outline' },
  { key: 'flatmates', label: 'Flatmates', icon: 'people-outline' },
];

// ── Room card ────────────────────────────────────────────────
const RoomCard = ({ room, onPress }: { room: Room; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.cardImg}>
      {room.images?.[0] ? (
        <Image source={{ uri: room.images[0] }} style={styles.cardImgFull} resizeMode="cover" />
      ) : (
        <Icon name="home-outline" size={32} color={colors.gray300} />
      )}
      {room.preferredTenant && room.preferredTenant !== 'any' && (
        <View style={styles.tenantBadge}>
          <Text style={styles.tenantBadgeText}>{room.preferredTenant}</Text>
        </View>
      )}
    </View>
    <View style={styles.cardBody}>
      <Text style={styles.cardTitle} numberOfLines={1}>{room.title}</Text>
      <View style={styles.cardMeta}>
        <Icon name="location-outline" size={12} color={colors.muted} />
        <Text style={styles.cardMetaText} numberOfLines={1}>{room.location}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardRent}>₹{room.rent.toLocaleString()}<Text style={styles.cardRentSub}>/mo</Text></Text>
        {room.deposit && (
          <Text style={styles.cardDeposit}>Dep: ₹{room.deposit.toLocaleString()}</Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

// ── PG card ──────────────────────────────────────────────────
const PGCard = ({ pg, onPress }: { pg: PG; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.cardImg}>
      {pg.images?.[0] ? (
        <Image source={{ uri: pg.images[0] }} style={styles.cardImgFull} resizeMode="cover" />
      ) : (
        <Icon name="business-outline" size={32} color={colors.gray300} />
      )}
      {pg.gender && pg.gender !== 'unisex' && (
        <View style={[styles.tenantBadge, { backgroundColor: pg.gender === 'female' ? colors.primarySubtle : colors.infoLight }]}>
          <Text style={[styles.tenantBadgeText, { color: pg.gender === 'female' ? colors.primary : colors.info }]}>
            {pg.gender}
          </Text>
        </View>
      )}
    </View>
    <View style={styles.cardBody}>
      <Text style={styles.cardTitle} numberOfLines={1}>{pg.title}</Text>
      <View style={styles.cardMeta}>
        <Icon name="location-outline" size={12} color={colors.muted} />
        <Text style={styles.cardMetaText} numberOfLines={1}>{pg.location}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardRent}>₹{pg.rent.toLocaleString()}<Text style={styles.cardRentSub}>/mo</Text></Text>
        {pg.meals && (
          <View style={styles.mealsBadge}>
            <Icon name="restaurant-outline" size={11} color={colors.success} />
            <Text style={styles.mealsBadgeText}>Meals</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

// ── Requirement card ─────────────────────────────────────────
const RequirementCard = ({ req, onPress }: { req: Requirement; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
    <View style={[styles.cardImg, styles.reqCardImg]}>
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
    <View style={styles.cardBody}>
      <Text style={styles.cardTitle} numberOfLines={1}>{req.title}</Text>
      <View style={styles.cardMeta}>
        <Icon name="location-outline" size={12} color={colors.muted} />
        <Text style={styles.cardMetaText} numberOfLines={1}>{req.location}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardRent}>
          ₹{req.budget.min.toLocaleString()}
          <Text style={styles.cardRentSub}> – ₹{req.budget.max.toLocaleString()}</Text>
        </Text>
      </View>
      {req.createdBy?.name && (
        <Text style={styles.reqPostedBy}>by {req.createdBy.name}</Text>
      )}
    </View>
  </TouchableOpacity>
);

// ── Main screen ──────────────────────────────────────────────
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
      <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing[4] }} />
    ) : null;

  const Empty = () =>
    isLoading ? null : (
      <View style={styles.empty}>
        <Icon name="search-outline" size={48} color={colors.gray300} />
        <Text style={styles.emptyTitle}>No listings found</Text>
        <Text style={styles.emptySub}>Try adjusting your search or pull to refresh</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* ── Header ──────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="chevron-back" size={22} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* ── Search bar ──────────────────────────── */}
      <View style={styles.searchWrap}>
        <Icon name="search-outline" size={18} color={colors.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or location…"
          placeholderTextColor={colors.subtle}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => { pageRef.current[activeTab] = 1; loadTab(activeTab, 1); }}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="close-circle" size={18} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Tab bar ─────────────────────────────── */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.75}
          >
            <Icon
              name={tab.icon}
              size={16}
              color={activeTab === tab.key ? colors.primary : colors.muted}
            />
            <Text
              style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List ────────────────────────────────── */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => (item as any)._id}
          renderItem={renderItem}
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
          ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
        />
      )}
    </SafeAreaView>
  );
};

export default ListingsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[3],
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...textPresets.h5, color: colors.dark },

  // ── Search ───────────────────────────────────────────────
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: layout.screenPaddingH,
    marginBottom: spacing[3],
    backgroundColor: colors.surfaceInput,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2.5],
    gap: spacing[2],
  },
  searchIcon: { flexShrink: 0 },
  searchInput: {
    flex: 1,
    ...textPresets.body,
    color: colors.dark,
    paddingVertical: 0,
  },

  // ── Tab bar ──────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: layout.screenPaddingH,
    marginBottom: spacing[3],
    backgroundColor: colors.gray100,
    borderRadius: radius.lg,
    padding: spacing[1],
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1.5],
    paddingVertical: spacing[2.5],
    borderRadius: radius.md,
  },
  tabItemActive: {
    backgroundColor: colors.surfaceCard,
    ...shadows.xs,
  },
  tabLabel: { ...textPresets.labelSm, color: colors.muted },
  tabLabelActive: { color: colors.primary },

  // ── List ─────────────────────────────────────────────────
  listContent: { paddingHorizontal: layout.screenPaddingH, paddingBottom: spacing[8] },
  listEmpty: { flex: 1, justifyContent: 'center' },

  // ── Card (shared) ────────────────────────────────────────
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardImg: {
    width: 110,
    minHeight: 110,
    backgroundColor: colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardImgFull: { width: '100%', height: '100%' },
  tenantBadge: {
    position: 'absolute',
    bottom: spacing[1.5],
    left: spacing[1.5],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.primarySubtle,
  },
  tenantBadgeText: { fontSize: 10, fontWeight: '700', color: colors.primary, textTransform: 'capitalize' },
  cardBody: { flex: 1, padding: spacing[3], justifyContent: 'center', gap: spacing[1.5] },
  cardTitle: { ...textPresets.label, color: colors.dark },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  cardMetaText: { ...textPresets.caption, color: colors.muted, flex: 1 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  cardRent: { ...textPresets.labelLg, color: colors.primary },
  cardRentSub: { ...textPresets.caption, color: colors.muted, fontFamily: undefined },
  cardDeposit: { ...textPresets.caption, color: colors.muted },

  // ── PG extras ────────────────────────────────────────────
  mealsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.successLight,
  },
  mealsBadgeText: { fontSize: 10, fontWeight: '600', color: colors.success },

  // ── Requirement extras ───────────────────────────────────
  reqCardImg: { backgroundColor: colors.surfaceDark },
  reqAvatar: { width: 70, height: 70, borderRadius: radius.full, borderWidth: 2, borderColor: colors.border },
  reqAvatarFallback: { width: 70, height: 70, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  reqAvatarInitial: { fontSize: 28, fontWeight: '800', color: colors.white },
  reqPostedBy: { ...textPresets.caption, color: colors.muted },

  // ── Loading / empty ──────────────────────────────────────
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: {
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: layout.screenPaddingH,
  },
  emptyTitle: { ...textPresets.h5, color: colors.dark },
  emptySub: { ...textPresets.body, color: colors.muted, textAlign: 'center' },
});
