/**
 * ChatListScreen — All conversations
 * Shows conversation rows with avatar, last message, unread badge, and timestamp.
 * Connects the Socket.io singleton on mount so messages stay live.
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, textPresets, radius, layout } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { ChatService } from '../../services/chat.service';
import { setConversations } from '../../Redux/Slices/chatSlice';
import { Conversation } from '../../Redux/Slices/chatSlice';
import { ChatStackParamList } from '../../navigation/types';
import { useSocket } from '../../hooks/useSocket';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatList'>;

// ── Helpers ────────────────────────────────────────────────────────────────

const formatTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// ── Sub-components ─────────────────────────────────────────────────────────

const Avatar = ({
  name,
  image,
  size = 52,
}: {
  name: string;
  image?: string;
  size?: number;
}) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return (
    <View
      style={[
        styles.avatarFallback,
        { width: size, height: size, borderRadius: size / 2 },
      ]}>
      <Text style={styles.avatarInitials}>{initials}</Text>
    </View>
  );
};

const ConversationRow = ({
  item,
  myId,
  onPress,
}: {
  item: Conversation;
  myId: string;
  onPress: () => void;
}) => {
  const other =
    item.participants.find(p => p._id !== myId) ?? item.participants[0];
  const hasUnread = (item.unreadCount ?? 0) > 0;
  const badgeCount = item.unreadCount ?? 0;
  const lastMsgTime = item.lastMessage?.sentAt ?? item.updatedAt;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.72}>
      <View style={styles.rowAvatarWrap}>
        <Avatar name={other?.name ?? '?'} image={other?.profileImage} />
      </View>

      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text
            style={[styles.rowName, hasUnread && styles.rowNameUnread]}
            numberOfLines={1}>
            {other?.name ?? 'Unknown'}
          </Text>
          <Text style={styles.rowTime}>{formatTime(lastMsgTime)}</Text>
        </View>

        <View style={styles.rowBottom}>
          <Text
            style={[styles.rowLastMsg, hasUnread && styles.rowLastMsgUnread]}
            numberOfLines={1}>
            {item.lastMessage?.text ?? 'Start a conversation'}
          </Text>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {badgeCount > 99 ? '99+' : badgeCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Screen ─────────────────────────────────────────────────────────────────

const ChatListScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const myId = useAppSelector(s => s.auth.user?._id ?? '');
  const conversations = useAppSelector(s => s.chat.conversations);
  const [isLoading, setIsLoading] = useState(conversations.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { connect } = useSocket();

  const loadConversations = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      try {
        const data = await ChatService.getConversations();
        // Sort newest first
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        dispatch(setConversations(sorted));
      } catch {
        // Show stale cached data on error
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    connect();
    loadConversations();
  }, [connect, loadConversations]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadConversations(true);
  };

  const goToChat = (item: Conversation) => {
    const other =
      item.participants.find(p => p._id !== myId) ?? item.participants[0];
    navigation.navigate('ChatDetail', {
      conversationId: item._id,
      participantName: other?.name ?? 'Chat',
      participantImage: other?.profileImage,
      participantId: other?._id ?? '',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.composeBtn} activeOpacity={0.7}>
          <Icon name="create-outline" size={24} color={colors.dark} />
        </TouchableOpacity>
      </View>

      {/* Conversation list */}
      <FlatList
        data={conversations}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <ConversationRow
            item={item}
            myId={myId}
            onPress={() => goToChat(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="chatbubbles-outline" size={60} color={colors.border} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySub}>
              Connect with a flatmate to start chatting
            </Text>
          </View>
        }
        contentContainerStyle={
          conversations.length === 0 ? styles.emptyContainer : undefined
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default ChatListScreen;

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[3],
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    ...textPresets.h4,
    color: colors.dark,
  },
  composeBtn: {
    padding: spacing[1],
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[4],
    backgroundColor: colors.surfaceCard,
  },
  rowAvatarWrap: {
    marginRight: spacing[3],
  },
  avatarFallback: {
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...textPresets.labelSm,
    color: colors.primary,
  },
  rowBody: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[0.5],
  },
  rowName: {
    ...textPresets.label,
    color: colors.dark,
    flex: 1,
    marginRight: spacing[2],
  },
  rowNameUnread: {
    ...textPresets.labelLg,
    color: colors.dark,
  },
  rowTime: {
    ...textPresets.caption,
    color: colors.muted,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLastMsg: {
    ...textPresets.bodySm,
    color: colors.muted,
    flex: 1,
    marginRight: spacing[2],
  },
  rowLastMsgUnread: {
    ...textPresets.labelSm,
    color: colors.dark,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    ...textPresets.overline,
    color: colors.white,
    fontSize: 10,
    lineHeight: 12,
  },

  // Divider — indented to align with text
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: layout.screenPaddingH + 52 + spacing[3],
  },

  // Empty state
  emptyContainer: { flex: 1 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingH * 2,
    paddingTop: 80,
  },
  emptyTitle: {
    ...textPresets.h5,
    color: colors.dark,
    marginTop: spacing[5],
    marginBottom: spacing[2],
  },
  emptySub: {
    ...textPresets.body,
    color: colors.muted,
    textAlign: 'center',
  },
});
