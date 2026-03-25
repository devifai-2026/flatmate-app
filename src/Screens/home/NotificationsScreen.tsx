/**
 * NotificationsScreen — Home stack
 * Full notification list with mark-read, mark-all-read, and delete support.
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, textPresets, radius, layout } from '../../theme';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import {
  setNotifications,
  markRead,
  markAllRead,
  removeNotification,
  AppNotification,
} from '../../Redux/Slices/notificationsSlice';
import { NotificationsService } from '../../services/listings.service';

const TYPE_META: Record<
  AppNotification['type'],
  { icon: string; bg: string; color: string }
> = {
  message: { icon: 'chatbubble-ellipses', bg: colors.infoLight, color: colors.info },
  match: { icon: 'heart', bg: colors.primarySubtle, color: colors.primary },
  inquiry: { icon: 'cash', bg: colors.successLight, color: colors.success },
  system: { icon: 'information-circle', bg: colors.warningLight, color: colors.warning },
};

const formatTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(s => s.notifications.list);
  const unreadCount = useAppSelector(s => s.notifications.unreadCount);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await NotificationsService.getNotifications();
      dispatch(setNotifications(data));
    } catch { /* fail silently */ } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleMarkRead = async (id: string) => {
    dispatch(markRead(id));
    try { await NotificationsService.markRead(id); } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    dispatch(markAllRead());
    try { await NotificationsService.markAllRead(); } catch { /* ignore */ }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete notification?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          dispatch(removeNotification(id));
          try { await NotificationsService.deleteNotification(id); } catch { /* ignore */ }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    const meta = TYPE_META[item.type] ?? TYPE_META.system;
    return (
      <TouchableOpacity
        style={[styles.item, !item.read && styles.itemUnread]}
        onPress={() => !item.read && handleMarkRead(item._id)}
        onLongPress={() => handleDelete(item._id)}
        activeOpacity={0.75}
      >
        <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
          {item.fromUser?.profileImage ? (
            <Image source={{ uri: item.fromUser.profileImage }} style={styles.fromImg} />
          ) : (
            <Icon name={meta.icon} size={18} color={meta.color} />
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
        </View>
        {!item.read && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  const Empty = () => (
    <View style={styles.empty}>
      <Icon name="notifications-off-outline" size={52} color={colors.gray300} />
      <Text style={styles.emptyTitle}>All caught up!</Text>
      <Text style={styles.emptySub}>No notifications right now</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
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
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {/* ── Unread strip ────────────────────────── */}
      {unreadCount > 0 && (
        <View style={styles.strip}>
          <View style={styles.stripDot} />
          <Text style={styles.stripText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        ListEmptyComponent={isLoading ? null : <Empty />}
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
          notifications.length === 0 && styles.listEmpty,
        ]}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  markAll: { ...textPresets.labelSm, color: colors.primary },

  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[2],
    backgroundColor: colors.primarySubtle,
  },
  stripDot: { width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.primary },
  stripText: { ...textPresets.caption, color: colors.primary, fontWeight: '600' },

  listContent: { paddingVertical: spacing[2] },
  listEmpty: { flex: 1, justifyContent: 'center' },

  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    gap: spacing[3],
  },
  itemUnread: { backgroundColor: colors.white },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fromImg: { width: 44, height: 44, borderRadius: radius.full },
  content: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  title: { ...textPresets.label, color: colors.dark, flex: 1, marginRight: spacing[2] },
  time: { ...textPresets.caption, color: colors.muted },
  body: { ...textPresets.bodySm, color: colors.muted, lineHeight: 18 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    marginTop: spacing[1.5],
    flexShrink: 0,
  },
  sep: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: layout.screenPaddingH + 44 + spacing[3],
  },

  empty: {
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: layout.screenPaddingH,
  },
  emptyTitle: { ...textPresets.h5, color: colors.dark },
  emptySub: { ...textPresets.body, color: colors.muted, textAlign: 'center' },
});
