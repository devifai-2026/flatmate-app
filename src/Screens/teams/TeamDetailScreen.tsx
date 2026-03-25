/**
 * TeamDetailScreen — Full team view
 *
 * Sections:
 *  • Gradient header: name, passkey, location/budget pills
 *  • Members list: avatar, name, owner badge
 *  • Shared Wishlist: item cards (room/pg/requirement)
 *  • Footer: Leave / Delete button
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';

import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { setSelectedTeam, removeTeam } from '../../Redux/Slices/teamsSlice';
import { TeamsService } from '../../services/teams.service';
import { ProfileStackParamList } from '../../navigation/types';
import { Team, SharedWishlistItem } from '../../Redux/Slices/teamsSlice';

type Props = NativeStackScreenProps<ProfileStackParamList, 'TeamDetail'>;

// ── Wishlist item type labels ──────────────────────────────────────────────────

const TYPE_ICON: Record<string, string> = {
  room:        'home-outline',
  pg:          'business-outline',
  requirement: 'person-outline',
};

const TYPE_LABEL: Record<string, string> = {
  room:        'Room',
  pg:          'PG',
  requirement: 'Flatmate',
};

// ── Screen ─────────────────────────────────────────────────────────────────────

const TeamDetailScreen = ({ route, navigation }: Props) => {
  const { teamId } = route.params;
  const dispatch   = useAppDispatch();
  const myId       = useAppSelector(s => s.auth.user?._id);
  const cached     = useAppSelector(s => s.teams.selected);

  const [team,      setTeam]      = useState<Team | null>(cached);
  const [wishlist,  setWishlist]  = useState<SharedWishlistItem[]>([]);
  const [loading,   setLoading]   = useState(!cached);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [t, w] = await Promise.all([
        TeamsService.getTeamById(teamId),
        TeamsService.getSharedWishlist(teamId),
      ]);
      setTeam(t);
      setWishlist(w);
      dispatch(setSelectedTeam(t));
    } catch {
      // silent
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, [teamId, dispatch]);

  useEffect(() => { load(); }, [load]);

  const isOwner = team?.createdBy === myId;

  const handleCopyPasskey = useCallback(() => {
    if (!team) { return; }
    try {
      Clipboard.setString(team.passkey);
      Alert.alert('Copied!', `Passkey "${team.passkey}" copied to clipboard.`);
    } catch {
      Alert.alert('Passkey', team.passkey);
    }
  }, [team]);

  const handleLeaveOrDelete = useCallback(() => {
    if (!team) { return; }
    Alert.alert(
      isOwner ? 'Delete Team' : 'Leave Team',
      isOwner
        ? `Delete "${team.name}"? All members will be removed.`
        : `Leave "${team.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isOwner ? 'Delete' : 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isOwner) {
                await TeamsService.deleteTeam(team._id);
              } else {
                await TeamsService.leaveTeam(team._id);
              }
              dispatch(removeTeam(team._id));
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Something went wrong.');
            }
          },
        },
      ],
    );
  }, [team, isOwner, dispatch, navigation]);

  if (loading || !team) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Team Detail</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{team.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />
        }>

        {/* ── Gradient hero ── */}
        <LinearGradient
          colors={colors.gradients.primaryDeep}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>

          <View style={styles.heroIcon}>
            <Icon name="people" size={32} color={colors.white} />
          </View>

          <Text style={styles.heroName}>{team.name}</Text>

          {team.description ? (
            <Text style={styles.heroDesc}>{team.description}</Text>
          ) : null}

          {/* Pills row */}
          <View style={styles.pillsRow}>
            {team.location ? (
              <View style={styles.heroPill}>
                <Icon name="location-outline" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroPillText}>{team.location}</Text>
              </View>
            ) : null}
            {team.budget ? (
              <View style={styles.heroPill}>
                <Icon name="cash-outline" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroPillText}>
                  ₹{team.budget.min.toLocaleString()}–{team.budget.max.toLocaleString()}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Passkey row */}
          <TouchableOpacity style={styles.passkeyCard} onPress={handleCopyPasskey} activeOpacity={0.8}>
            <Icon name="key-outline" size={14} color={colors.primary} />
            <Text style={styles.passkeyCardText}>{team.passkey}</Text>
            <Icon name="copy-outline" size={14} color={colors.muted} />
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Members ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Members ({team.members.length}/{team.maxMembers})
          </Text>
          {team.members.map(member => (
            <View key={member._id} style={styles.memberRow}>
              {member.profileImage ? (
                <Image source={{ uri: member.profileImage }} style={styles.memberAvatar} />
              ) : (
                <View style={[styles.memberAvatar, styles.memberAvatarFallback]}>
                  <Text style={styles.memberInitial}>
                    {member.name?.[0]?.toUpperCase() ?? '?'}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{member.name}</Text>
                {member._id === myId && (
                  <Text style={styles.memberYou}>You</Text>
                )}
              </View>
              {member._id === team.createdBy && (
                <View style={styles.ownerBadge}>
                  <Icon name="star" size={10} color={colors.primary} />
                  <Text style={styles.ownerBadgeText}>Owner</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* ── Shared Wishlist ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Shared Wishlist ({wishlist.length})
          </Text>
          {wishlist.length === 0 ? (
            <View style={styles.emptyWishlist}>
              <Icon name="bookmark-outline" size={28} color={colors.subtle} />
              <Text style={styles.emptyWishlistText}>
                No saved items yet. Save rooms, PGs, or flatmates to share with your team.
              </Text>
            </View>
          ) : (
            wishlist.map((item, i) => (
              <View key={`${item.itemType}-${item.itemId}-${i}`} style={styles.wishlistItem}>
                <View style={styles.wishlistIcon}>
                  <Icon
                    name={TYPE_ICON[item.itemType] ?? 'bookmark-outline'}
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.wishlistType}>{TYPE_LABEL[item.itemType] ?? item.itemType}</Text>
                  <Text style={styles.wishlistId} numberOfLines={1}>ID: {item.itemId}</Text>
                </View>
                <Text style={styles.wishlistDate}>
                  {item.addedAt ? new Date(item.addedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: spacing[8] }} />
      </ScrollView>

      {/* Leave / Delete footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerBtn, isOwner ? styles.footerBtnDelete : styles.footerBtnLeave]}
          onPress={handleLeaveOrDelete}
          activeOpacity={0.8}>
          <Icon
            name={isOwner ? 'trash-outline' : 'exit-outline'}
            size={18}
            color={isOwner ? colors.error : colors.muted}
          />
          <Text style={[styles.footerBtnText, { color: isOwner ? colors.error : colors.muted }]}>
            {isOwner ? 'Delete Team' : 'Leave Team'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TeamDetailScreen;

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...textPresets.h5, color: colors.dark, flex: 1, textAlign: 'center' },

  // Hero
  hero: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    paddingHorizontal: layout.screenPaddingH,
    gap: spacing[3],
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  heroName: { ...textPresets.h4, color: colors.white },
  heroDesc: { ...textPresets.body, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  pillsRow: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap', justifyContent: 'center' },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  heroPillText: { ...textPresets.caption, color: 'rgba(255,255,255,0.9)' },
  passkeyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    marginTop: spacing[2],
  },
  passkeyCardText: {
    ...textPresets.h5,
    color: colors.primary,
    flex: 1,
    textAlign: 'center',
    letterSpacing: 3,
  },

  // Section
  section: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[6],
  },
  sectionTitle: {
    ...textPresets.overline,
    color: colors.muted,
    marginBottom: spacing[4],
  },

  // Members
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    padding: spacing[3],
    marginBottom: spacing[2],
    gap: spacing[3],
    ...shadows.xs,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
  },
  memberAvatarFallback: {
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: { ...textPresets.labelSm, color: colors.primary },
  memberName: { ...textPresets.label, color: colors.dark },
  memberYou: { ...textPresets.caption, color: colors.muted },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.full,
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
  },
  ownerBadgeText: { ...textPresets.caption, color: colors.primary },

  // Shared wishlist
  emptyWishlist: {
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[6],
  },
  emptyWishlistText: {
    ...textPresets.bodySm,
    color: colors.muted,
    textAlign: 'center',
  },
  wishlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    padding: spacing[3],
    marginBottom: spacing[2],
    gap: spacing[3],
    ...shadows.xs,
  },
  wishlistIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistType: { ...textPresets.label, color: colors.dark },
  wishlistId: { ...textPresets.caption, color: colors.muted },
  wishlistDate: { ...textPresets.caption, color: colors.subtle },

  // Footer
  footer: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  footerBtnDelete: {
    backgroundColor: colors.errorLight,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  footerBtnLeave: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.border,
  },
  footerBtnText: { ...textPresets.button },
});
