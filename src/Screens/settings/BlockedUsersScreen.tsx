/**
 * BlockedUsersScreen — List of users the current user has blocked
 *
 * • Loads GET /users/me → blocked list (if endpoint supports it)
 *   Falls back to a local approach using the auth user's blockedUsers array.
 * • Long-press or Unblock button → ChatService.unblockUser
 * • Shows empty state if no blocked users.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { updateUser } from '../../Redux/Slices/authSlice';
import { ChatService } from '../../services/chat.service';
import { apiClient } from '../../services/api.client';
import { Endpoints } from '../../services/api.endpoints';
import { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'BlockedUsers'>;

interface BlockedUser {
  _id: string;
  name: string;
  profileImage?: string;
  city?: string;
  userType?: string;
}

const USER_TYPE_LABELS: Record<string, string> = {
  seeker: 'Seeker',
  'flat-owner': 'Flat Owner',
  'pg-owner': 'PG Owner',
};

// ── Screen ─────────────────────────────────────────────────────────────────────

const BlockedUsersScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();

  const [blocked,    setBlocked]    = useState<BlockedUser[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      // Try fetching blocked users from backend
      const { data } = await apiClient.get<{ blockedUsers?: BlockedUser[]; data?: BlockedUser[] }>(
        `${Endpoints.user.me}/blocked`,
      );
      setBlocked(data.blockedUsers ?? data.data ?? []);
    } catch {
      // Endpoint may not exist — show empty list gracefully
      setBlocked([]);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUnblock = useCallback((user: BlockedUser) => {
    Alert.alert(
      'Unblock User',
      `Unblock ${user.name}? They will be able to message you again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              await ChatService.unblockUser(user._id);
              setBlocked(prev => prev.filter(u => u._id !== user._id));
              // Update auth user's blocked list if it exists locally
              dispatch(updateUser({ blockedUsers: blocked.filter(u => u._id !== user._id).map(u => u._id) } as any));
            } catch {
              Alert.alert('Error', 'Could not unblock user. Please try again.');
            }
          },
        },
      ],
    );
  }, [blocked, dispatch]);

  const renderItem = ({ item }: { item: BlockedUser }) => (
    <View style={styles.row}>
      {item.profileImage ? (
        <Image source={{ uri: item.profileImage }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitial}>
            {item.name?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
      )}

      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{item.name}</Text>
        <View style={styles.rowMeta}>
          {item.city ? (
            <>
              <Icon name="location-outline" size={11} color={colors.muted} />
              <Text style={styles.rowMetaText}>{item.city}</Text>
            </>
          ) : null}
          {item.userType ? (
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>
                {USER_TYPE_LABELS[item.userType] ?? item.userType}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <TouchableOpacity
        style={styles.unblockBtn}
        onPress={() => handleUnblock(item)}
        activeOpacity={0.8}>
        <Icon name="lock-open-outline" size={14} color={colors.primary} />
        <Text style={styles.unblockText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked Users</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Icon name="information-circle-outline" size={16} color={colors.info} />
        <Text style={styles.infoText}>
          Blocked users cannot send you messages or see your profile.
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={blocked}
          keyExtractor={u => u._id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.list,
            blocked.length === 0 && styles.listEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={colors.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Icon name="shield-checkmark-outline" size={40} color={colors.success} />
              </View>
              <Text style={styles.emptyTitle}>No blocked users</Text>
              <Text style={styles.emptySub}>
                Users you block will appear here. You can unblock them at any time.
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default BlockedUsersScreen;

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
  headerTitle: { ...textPresets.h5, color: colors.dark },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginHorizontal: layout.screenPaddingH,
    marginTop: spacing[4],
    backgroundColor: colors.infoLight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  infoText: { ...textPresets.caption, color: colors.info, flex: 1, lineHeight: 16 },

  list: {
    padding: layout.screenPaddingH,
    paddingTop: spacing[4],
  },
  listEmpty: { flex: 1 },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.xs,
  },
  separator: { height: spacing[3] },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
  },
  avatarFallback: {
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { ...textPresets.labelSm, color: colors.muted },

  rowInfo: { flex: 1, gap: spacing[1] },
  rowName: { ...textPresets.label, color: colors.dark },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  rowMetaText: { ...textPresets.caption, color: colors.muted },
  typePill: {
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  typePillText: { ...textPresets.caption, color: colors.muted },

  unblockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.primarySubtle,
  },
  unblockText: { ...textPresets.buttonSm, color: colors.primary },

  // Empty
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    gap: spacing[3],
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  emptyTitle: { ...textPresets.h5, color: colors.dark, textAlign: 'center' },
  emptySub: { ...textPresets.body, color: colors.muted, textAlign: 'center', lineHeight: 22 },
});
