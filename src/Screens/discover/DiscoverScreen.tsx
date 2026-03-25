/**
 * DiscoverScreen — AI Matches grid
 * 2-column grid of matched users with match score, city, and lifestyle preview.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
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
import { setMatches, Match } from '../../Redux/Slices/matchesSlice';
import { ListingsService } from '../../services/listings.service';
import { DiscoverStackParamList } from '../../navigation/types';

type DiscoverNav = NativeStackNavigationProp<DiscoverStackParamList, 'Discover'>;

const getScoreColor = (score: number) =>
  score >= 80 ? colors.success : score >= 60 ? colors.warning : colors.error;

const getScoreLabel = (score: number) =>
  score >= 80 ? 'Great match' : score >= 60 ? 'Good match' : 'Fair match';

const MatchCard = ({
  match,
  onPress,
}: {
  match: Match;
  onPress: () => void;
}) => {
  const { user, score } = match;
  const scoreColor = getScoreColor(score);
  const initials = user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Avatar */}
      <View style={styles.cardImgWrap}>
        {user.profileImage ? (
          <Image source={{ uri: user.profileImage }} style={styles.cardImg} resizeMode="cover" />
        ) : (
          <LinearGradient colors={colors.gradients.primary} style={styles.cardImgFallback}>
            <Text style={styles.cardInitials}>{initials}</Text>
          </LinearGradient>
        )}
        {/* Score badge */}
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreBadgeText}>{score}%</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{user.name}</Text>
        {user.city ? (
          <View style={styles.cityRow}>
            <Icon name="location-outline" size={11} color={colors.muted} />
            <Text style={styles.cityText} numberOfLines={1}>{user.city}</Text>
          </View>
        ) : null}
        <Text style={[styles.scoreLabel, { color: scoreColor }]}>{getScoreLabel(score)}</Text>

        {/* Lifestyle tags (up to 2) */}
        {user.lifestyleTags && user.lifestyleTags.length > 0 && (
          <View style={styles.tagsRow}>
            {user.lifestyleTags.slice(0, 2).map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText} numberOfLines={1}>
                  {tag.replace(/-/g, ' ')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* View button */}
      <TouchableOpacity style={styles.viewBtn} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.viewBtnText}>View Profile</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const DiscoverScreen = () => {
  const navigation = useNavigation<DiscoverNav>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const matches = useAppSelector(s => s.matches.list);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadMatches = useCallback(async () => {
    if (!user?._id) { setIsLoading(false); return; }
    try {
      const data = await ListingsService.getMatches(user._id);
      dispatch(setMatches(data));
    } catch { /* fail silently */ } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?._id, dispatch]);

  useEffect(() => { loadMatches(); }, [loadMatches]);

  const onRefresh = () => { setRefreshing(true); loadMatches(); };

  const renderItem = ({ item }: { item: Match }) => (
    <MatchCard
      match={item}
      onPress={() => navigation.navigate('FlatmateProfile', { userId: item.user._id })}
    />
  );

  const Empty = () => (
    <View style={styles.empty}>
      <Icon name="people-outline" size={52} color={colors.gray300} />
      <Text style={styles.emptyTitle}>No matches yet</Text>
      <Text style={styles.emptySub}>
        Complete your profile to get AI-matched with compatible flatmates
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* ── Header ──────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSub}>AI-matched flatmates for you</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.75}>
          <Icon name="options-outline" size={20} color={colors.dark} />
        </TouchableOpacity>
      </View>

      {/* ── Count strip ─────────────────────────── */}
      {matches.length > 0 && (
        <View style={styles.countStrip}>
          <Icon name="sparkles" size={13} color={colors.primary} />
          <Text style={styles.countText}>
            {matches.length} match{matches.length !== 1 ? 'es' : ''} found for you
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Finding your matches…</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={item => item.user._id}
          renderItem={renderItem}
          numColumns={2}
          ListEmptyComponent={<Empty />}
          columnWrapperStyle={styles.row}
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
            matches.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default DiscoverScreen;

const CARD_WIDTH = '48%';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  headerTitle: { ...textPresets.h4, color: colors.dark },
  headerSub: { ...textPresets.caption, color: colors.muted, marginTop: spacing[0.5] },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },

  // ── Count strip ──────────────────────────────────────────
  countStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginHorizontal: layout.screenPaddingH,
    marginBottom: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.md,
  },
  countText: { ...textPresets.caption, color: colors.primary, fontWeight: '600' },

  // ── List ─────────────────────────────────────────────────
  listContent: { paddingHorizontal: layout.screenPaddingH, paddingBottom: spacing[8] },
  listEmpty: { flex: 1, justifyContent: 'center' },
  row: { justifyContent: 'space-between', marginBottom: spacing[3] },

  // ── Match card ───────────────────────────────────────────
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardImgWrap: {
    height: 140,
    backgroundColor: colors.surfaceDark,
    position: 'relative',
  },
  cardImg: { width: '100%', height: '100%' },
  cardImgFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardInitials: { fontSize: 36, fontWeight: '800', color: colors.white },
  scoreBadge: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  scoreBadgeText: { fontSize: 11, fontWeight: '800', color: colors.white },

  cardBody: { padding: spacing[3], gap: spacing[1] },
  cardName: { ...textPresets.label, color: colors.dark },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  cityText: { ...textPresets.caption, color: colors.muted, flex: 1 },
  scoreLabel: { ...textPresets.caption, fontWeight: '600' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1], marginTop: spacing[1] },
  tag: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.primarySubtle,
  },
  tagText: { fontSize: 10, fontWeight: '600', color: colors.primary, textTransform: 'capitalize' },

  viewBtn: {
    marginHorizontal: spacing[3],
    marginBottom: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
  },
  viewBtnText: { ...textPresets.buttonSm, color: colors.primary },

  // ── Loading / empty ──────────────────────────────────────
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  loadingText: { ...textPresets.body, color: colors.muted },
  empty: {
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: layout.screenPaddingH,
  },
  emptyTitle: { ...textPresets.h5, color: colors.dark },
  emptySub: { ...textPresets.body, color: colors.muted, textAlign: 'center', lineHeight: 22 },
});
