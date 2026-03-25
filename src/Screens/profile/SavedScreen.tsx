/**
 * SavedScreen — Wishlist of saved rooms, PGs, and flatmate requirements
 *
 * Tabs: All / Rooms / PGs / Flatmates
 * Each card shows type-specific fields; tap opens detail screen.
 * Swipe-or-press the heart icon to unsave.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { setWishlist, removeFromWishlist } from '../../Redux/Slices/wishlistSlice';
import { WishlistItem } from '../../Redux/Slices/wishlistSlice';
import { ListingsService } from '../../services/listings.service';
import { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Saved'>;

type TabKey = 'all' | 'rooms' | 'pgs' | 'flatmates';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'rooms',     label: 'Rooms' },
  { key: 'pgs',       label: 'PGs' },
  { key: 'flatmates', label: 'Flatmates' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const getTitle  = (item: WishlistItem): string =>
  item.itemData?.title ?? item.itemData?.name ?? 'Saved Item';

const getSubtitle = (item: WishlistItem): string => {
  const d = item.itemData;
  if (!d) return item.itemType;
  if (item.itemType === 'room' || item.itemType === 'pg') {
    const loc = d.location?.area ?? d.location?.city ?? d.city ?? '';
    const rent = d.rent ?? d.price;
    return [loc, rent ? `₹${rent}/mo` : null].filter(Boolean).join(' · ');
  }
  // requirement / roommate
  const city = d.city ?? d.preferredLocation ?? '';
  const budget = d.budget?.max ?? d.maxBudget;
  return [city, budget ? `Budget ₹${budget}` : null].filter(Boolean).join(' · ');
};

const getTypeLabel = (type: WishlistItem['itemType']): string => {
  switch (type) {
    case 'room':       return 'Room';
    case 'pg':         return 'PG';
    case 'roommate':
    case 'requirement': return 'Flatmate';
    default:           return type;
  }
};

const getTypeIcon = (type: WishlistItem['itemType']): string => {
  switch (type) {
    case 'room': return 'bed-outline';
    case 'pg':   return 'business-outline';
    default:     return 'person-outline';
  }
};

// ── Screen ────────────────────────────────────────────────────────────────────

const SavedScreen = ({ navigation }: Props) => {
  const dispatch  = useAppDispatch();
  const items     = useAppSelector(s => s.wishlist.items);

  const [activeTab,    setActiveTab]    = useState<TabKey>('all');
  const [isLoading,    setIsLoading]    = useState(items.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadWishlist = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await ListingsService.getWishlist();
      dispatch(setWishlist(data));
    } catch {
      // show stale cached data
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  const onRefresh = () => { setIsRefreshing(true); loadWishlist(true); };

  const handleUnsave = useCallback((item: WishlistItem) => {
    Alert.alert(
      'Remove from Saved',
      `Remove "${getTitle(item)}" from your saved items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            dispatch(removeFromWishlist(item.itemId));
            try {
              await ListingsService.toggleWishlist(
                item.itemId,
                item.itemType === 'roommate' ? 'requirement' : item.itemType as any,
              );
            } catch {
              // Re-add on failure — reload
              loadWishlist(true);
            }
          },
        },
      ],
    );
  }, [dispatch, loadWishlist]);

  const filteredItems = activeTab === 'all'
    ? items
    : items.filter(i => {
        if (activeTab === 'rooms')     return i.itemType === 'room';
        if (activeTab === 'pgs')       return i.itemType === 'pg';
        if (activeTab === 'flatmates') return i.itemType === 'roommate' || i.itemType === 'requirement';
        return true;
      });

  const renderItem = ({ item }: { item: WishlistItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => {
        if (item.itemType === 'room') {
          (navigation as any).navigate('Browse', { initialTab: 'rooms' });
        } else if (item.itemType === 'pg') {
          (navigation as any).navigate('Browse', { initialTab: 'pgs' });
        }
      }}>
      <View style={styles.cardIconWrap}>
        <Icon name={getTypeIcon(item.itemType)} size={22} color={colors.primary} />
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{getTitle(item)}</Text>
        <Text style={styles.cardSub} numberOfLines={1}>{getSubtitle(item)}</Text>
        <View style={styles.cardTypePill}>
          <Text style={styles.cardTypePillText}>{getTypeLabel(item.itemType)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.unsaveBtn}
        onPress={() => handleUnsave(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Icon name="heart" size={20} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Items</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}>
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon name="heart-outline" size={56} color={colors.border} />
              <Text style={styles.emptyTitle}>Nothing saved yet</Text>
              <Text style={styles.emptySub}>
                Tap the heart on any room or PG to save it here
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default SavedScreen;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[3],
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: { padding: spacing[1] },
  headerTitle: { ...textPresets.h5, color: colors.dark, flex: 1, textAlign: 'center' },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[3],
    backgroundColor: colors.surfaceCard,
    gap: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...textPresets.buttonSm, color: colors.muted },
  tabTextActive: { color: colors.white },

  // List
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: layout.screenPaddingH, flexGrow: 1 },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.xs,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: spacing[1] },
  cardTitle: { ...textPresets.label, color: colors.dark },
  cardSub:   { ...textPresets.bodySm, color: colors.muted },
  cardTypePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  cardTypePillText: { ...textPresets.caption, color: colors.muted },
  unsaveBtn: { padding: spacing[2] },

  // Empty
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: spacing[3],
  },
  emptyTitle: { ...textPresets.h5, color: colors.dark },
  emptySub: {
    ...textPresets.body,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing[8],
  },
});
