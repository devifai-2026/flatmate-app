/**
 * TeamsScreen — Flatmate teams hub
 *
 * Shows the user's teams as cards, with a passkey display,
 * member avatars, and quick actions. FAB opens CreateTeamScreen.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { setTeams, removeTeam, setSelectedTeam } from '../../Redux/Slices/teamsSlice';
import { TeamsService } from '../../services/teams.service';
import { ProfileStackParamList } from '../../navigation/types';
import { Team } from '../../Redux/Slices/teamsSlice';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Teams'>;

// ── Screen ─────────────────────────────────────────────────────────────────────

const TeamsScreen = ({ navigation }: Props) => {
  const dispatch  = useAppDispatch();
  const teams     = useAppSelector(s => s.teams.list);
  const myId      = useAppSelector(s => s.auth.user?._id);

  const [loading,   setLoading]   = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await TeamsService.getMyTeams();
      dispatch(setTeams(data));
    } catch {
      // silent
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const handleTeamPress = useCallback((team: Team) => {
    dispatch(setSelectedTeam(team));
    navigation.navigate('TeamDetail', { teamId: team._id });
  }, [dispatch, navigation]);

  const handleLeave = useCallback((team: Team) => {
    const isOwner = team.createdBy === myId;
    Alert.alert(
      isOwner ? 'Delete Team' : 'Leave Team',
      isOwner
        ? `Delete "${team.name}"? This cannot be undone.`
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
            } catch {
              Alert.alert('Error', 'Something went wrong. Please try again.');
            }
          },
        },
      ],
    );
  }, [dispatch, myId]);

  const renderTeam = ({ item }: { item: Team }) => {
    const isOwner = item.createdBy === myId;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleTeamPress(item)}
        activeOpacity={0.85}>

        {/* Header strip */}
        <LinearGradient
          colors={colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            {item.location ? (
              <View style={styles.cardMeta}>
                <Icon name="location-outline" size={11} color="rgba(255,255,255,0.8)" />
                <Text style={styles.cardMetaText}>{item.location}</Text>
              </View>
            ) : null}
          </View>

          {isOwner && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>Owner</Text>
            </View>
          )}
        </LinearGradient>

        {/* Body */}
        <View style={styles.cardBody}>
          {/* Passkey */}
          <View style={styles.passkeyRow}>
            <Icon name="key-outline" size={13} color={colors.muted} />
            <Text style={styles.passkeyLabel}>Passkey</Text>
            <Text style={styles.passkeyValue}>{item.passkey}</Text>
          </View>

          {/* Members */}
          <View style={styles.membersRow}>
            <View style={styles.avatarStack}>
              {item.members.slice(0, 4).map((m, i) => (
                <View
                  key={m._id}
                  style={[styles.memberAvatar, { marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }]}>
                  {m.profileImage ? (
                    <Image source={{ uri: m.profileImage }} style={styles.memberAvatarImg} />
                  ) : (
                    <View style={styles.memberAvatarFallback}>
                      <Text style={styles.memberAvatarInitial}>
                        {m.name?.[0]?.toUpperCase() ?? '?'}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
              {item.members.length > 4 && (
                <View style={[styles.memberAvatar, styles.memberAvatarMore, { marginLeft: -8 }]}>
                  <Text style={styles.memberAvatarMoreText}>+{item.members.length - 4}</Text>
                </View>
              )}
            </View>
            <Text style={styles.memberCount}>
              {item.members.length}/{item.maxMembers} members
            </Text>
          </View>

          {/* Budget */}
          {item.budget && (
            <View style={styles.budgetRow}>
              <Icon name="cash-outline" size={13} color={colors.muted} />
              <Text style={styles.budgetText}>
                ₹{item.budget.min.toLocaleString()} – ₹{item.budget.max.toLocaleString()} / mo
              </Text>
            </View>
          )}
        </View>

        {/* Footer actions */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.footerAction}
            onPress={() => handleTeamPress(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="eye-outline" size={16} color={colors.primary} />
            <Text style={styles.footerActionText}>View</Text>
          </TouchableOpacity>

          <View style={styles.footerDivider} />

          <TouchableOpacity
            style={styles.footerAction}
            onPress={() => handleLeave(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon
              name={isOwner ? 'trash-outline' : 'exit-outline'}
              size={16}
              color={isOwner ? colors.error : colors.muted}
            />
            <Text style={[styles.footerActionText, { color: isOwner ? colors.error : colors.muted }]}>
              {isOwner ? 'Delete' : 'Leave'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Teams</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={t => t._id}
          renderItem={renderTeam}
          contentContainerStyle={[
            styles.list,
            teams.length === 0 && styles.listEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Icon name="people-outline" size={40} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No teams yet</Text>
              <Text style={styles.emptySub}>
                Create a team with friends or join one with a passkey.
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTeam')}
        activeOpacity={0.85}>
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.fabGrad}>
          <Icon name="add" size={26} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Create / Join sheet trigger */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={() => navigation.navigate('CreateTeam')}
          activeOpacity={0.85}>
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bottomBtnGrad}>
            <Icon name="add-circle-outline" size={18} color={colors.white} />
            <Text style={styles.bottomBtnText}>Create or Join Team</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TeamsScreen;

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...textPresets.h5, color: colors.dark },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  list: { padding: layout.screenPaddingH, paddingBottom: spacing[24] },
  listEmpty: { flex: 1 },

  // Team card
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    marginBottom: spacing[4],
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  cardHeaderLeft: { flex: 1 },
  cardName: { ...textPresets.h6, color: colors.white, marginBottom: spacing[1] },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardMetaText: { ...textPresets.caption, color: 'rgba(255,255,255,0.8)' },
  ownerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    marginLeft: spacing[3],
  },
  ownerBadgeText: { ...textPresets.caption, color: colors.white },

  cardBody: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    gap: spacing[3],
  },

  passkeyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  passkeyLabel: { ...textPresets.caption, color: colors.muted },
  passkeyValue: {
    ...textPresets.labelSm,
    color: colors.primary,
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    overflow: 'hidden',
  },

  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.surfaceCard,
    overflow: 'hidden',
  },
  memberAvatarImg: { width: '100%', height: '100%' },
  memberAvatarFallback: {
    flex: 1,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarInitial: { ...textPresets.caption, color: colors.primary },
  memberAvatarMore: {
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarMoreText: { ...textPresets.caption, color: colors.muted, fontSize: 9 },
  memberCount: { ...textPresets.caption, color: colors.muted },

  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  budgetText: { ...textPresets.caption, color: colors.muted },

  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
  },
  footerDivider: { width: 1, backgroundColor: colors.borderLight },
  footerActionText: { ...textPresets.buttonSm, color: colors.primary },

  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[8] },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
  },
  emptyTitle: { ...textPresets.h5, color: colors.dark, marginBottom: spacing[2], textAlign: 'center' },
  emptySub: { ...textPresets.body, color: colors.muted, textAlign: 'center', lineHeight: 22 },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  bottomBtn: { borderRadius: radius.xl, overflow: 'hidden', ...shadows.primarySm },
  bottomBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
  },
  bottomBtnText: { ...textPresets.button, color: colors.white },

  // FAB (hidden behind bottom bar, kept for layout reference)
  fab: { position: 'absolute', bottom: 100, right: layout.screenPaddingH, display: 'none' },
  fabGrad: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primaryMd,
  },
});
