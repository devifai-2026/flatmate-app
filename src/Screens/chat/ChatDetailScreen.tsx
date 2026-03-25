/**
 * ChatDetailScreen — Full real-time messaging view
 *
 * Features:
 *  • Inverted FlatList — newest messages at bottom
 *  • Sent (right, rose gradient) / Received (left, white card) bubbles
 *  • System message pill (centered)
 *  • Date separators between message groups
 *  • Animated typing indicator (3-dot bounce)
 *  • Read receipt tick marks on sent messages
 *  • Socket.io: join/leave room, emit typing (debounced), emit read
 *  • REST: load messages on mount, send via API then append to Redux
 *  • Long-press own message → delete option
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { ChatService } from '../../services/chat.service';
import {
  setMessages,
  appendMessage,
  markConversationRead,
  Message,
} from '../../Redux/Slices/chatSlice';
import { ChatStackParamList } from '../../navigation/types';
import { useSocket } from '../../hooks/useSocket';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatDetail'>;

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatMsgTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateLabel = (dateStr: string): string => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / 86_400_000,
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)
    return d.toLocaleDateString([], { weekday: 'long' });
  return d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year:
      d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const isSameDay = (a: string, b: string): boolean => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

// ── Avatar ────────────────────────────────────────────────────────────────────

const SmallAvatar = ({
  name,
  image,
  size = 32,
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

// ── Read Receipt ──────────────────────────────────────────────────────────────

const ReadReceipt = ({ status }: { status: Message['status'] }) => {
  if (status === 'sent') {
    return <Icon name="checkmark" size={12} color="rgba(255,255,255,0.7)" />;
  }
  if (status === 'delivered') {
    return (
      <Icon name="checkmark-done" size={12} color="rgba(255,255,255,0.7)" />
    );
  }
  // read
  return <Icon name="checkmark-done" size={12} color="#A8F0C6" />;
};

// ── Typing Indicator ──────────────────────────────────────────────────────────

const TypingIndicator = ({ name }: { name: string }) => {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, {
            toValue: -6,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(600),
        ]),
      ),
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.typingRow}>
      <View style={styles.typingBubble}>
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>
      <Text style={styles.typingLabel}>{name} is typing…</Text>
    </View>
  );
};

// ── Date Separator ────────────────────────────────────────────────────────────

const DateSeparator = ({ label }: { label: string }) => (
  <View style={styles.dateSepWrap}>
    <View style={styles.dateSepLine} />
    <Text style={styles.dateSepText}>{label}</Text>
    <View style={styles.dateSepLine} />
  </View>
);

// ── Message Bubble ────────────────────────────────────────────────────────────

const MessageBubble = ({
  message,
  isMine,
  showAvatar,
  participantName,
  participantImage,
  onLongPress,
}: {
  message: Message;
  isMine: boolean;
  showAvatar: boolean;
  participantName: string;
  participantImage?: string;
  onLongPress: () => void;
}) => {
  if (message.messageType === 'system') {
    return (
      <View style={styles.systemMsgWrap}>
        <Text style={styles.systemMsgText}>{message.text}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onLongPress={onLongPress}
      style={[
        styles.bubbleRow,
        isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs,
      ]}>
      {/* Received — avatar on left */}
      {!isMine && (
        <View style={styles.bubbleAvatarWrap}>
          {showAvatar ? (
            <SmallAvatar name={participantName} image={participantImage} />
          ) : (
            <View style={{ width: 32 }} />
          )}
        </View>
      )}

      <View
        style={[
          styles.bubbleOuter,
          isMine ? styles.bubbleOuterMine : styles.bubbleOuterTheirs,
        ]}>
        {isMine ? (
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bubbleGradient}>
            {message.mediaType === 'image' && message.mediaUrl ? (
              <Image
                source={{ uri: message.mediaUrl }}
                style={styles.mediaImage}
                resizeMode="cover"
              />
            ) : null}
            {message.text ? (
              <Text style={styles.bubbleTextMine}>{message.text}</Text>
            ) : null}
            <View style={styles.bubbleMeta}>
              <Text style={styles.bubbleTimeMine}>
                {formatMsgTime(message.createdAt)}
              </Text>
              <ReadReceipt status={message.status} />
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.bubbleCard}>
            {message.mediaType === 'image' && message.mediaUrl ? (
              <Image
                source={{ uri: message.mediaUrl }}
                style={styles.mediaImage}
                resizeMode="cover"
              />
            ) : null}
            {message.text ? (
              <Text style={styles.bubbleTextTheirs}>{message.text}</Text>
            ) : null}
            <Text style={styles.bubbleTimeTheirs}>
              {formatMsgTime(message.createdAt)}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

// ── Screen ───────────────────────────────────────────────────────────────────

const ChatDetailScreen = ({ route, navigation }: Props) => {
  const { conversationId, participantName, participantImage, participantId } =
    route.params;

  const dispatch = useAppDispatch();
  const myId = useAppSelector(s => s.auth.user?._id ?? '');
  const rawMessages = useAppSelector(
    s => s.chat.messages[conversationId] ?? [],
  );
  const typingUsers = useAppSelector(
    s => s.chat.typingUsers[conversationId] ?? [],
  );
  const isConnected = useAppSelector(s => s.chat.isConnected);

  const { joinConversation, leaveConversation, emitTyping, emitMessageRead } =
    useSocket();

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(rawMessages.length === 0);

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlatList<Message>>(null);

  // ── Load messages on mount ────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        const msgs = await ChatService.getMessages(conversationId);
        dispatch(setMessages({ conversationId, messages: msgs }));
      } catch {
        // use cached data
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [conversationId, dispatch]);

  // ── Socket room join / leave ──────────────────────────────────────────────

  useEffect(() => {
    joinConversation(conversationId);
    emitMessageRead(conversationId);
    dispatch(markConversationRead(conversationId));
    return () => {
      leaveConversation(conversationId);
    };
  }, [
    conversationId,
    joinConversation,
    leaveConversation,
    emitMessageRead,
    dispatch,
  ]);

  // ── Reverse messages for inverted FlatList ────────────────────────────────

  const messages = [...rawMessages].reverse();

  const isOtherTyping =
    typingUsers.length > 0 && typingUsers.includes(participantId);

  // ── Typing emit (debounced) ───────────────────────────────────────────────

  const handleTextChange = useCallback(
    (text: string) => {
      setInputText(text);
      emitTyping(conversationId, true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        emitTyping(conversationId, false);
      }, 2000);
    },
    [conversationId, emitTyping],
  );

  // ── Send ──────────────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isSending) return;
    setInputText('');
    setIsSending(true);
    // Stop typing indicator
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    emitTyping(conversationId, false);
    try {
      const msg = await ChatService.sendMessage(conversationId, { text });
      dispatch(appendMessage({ conversationId, message: msg }));
    } catch {
      // Restore text on failure
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  }, [inputText, isSending, conversationId, emitTyping, dispatch]);

  // ── Long-press delete ─────────────────────────────────────────────────────

  const handleLongPress = useCallback(
    (message: Message) => {
      if (message.sender._id !== myId) return;
      Alert.alert('Delete message', 'Remove this message for everyone?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ChatService.deleteMessage(message._id);
              // Refresh messages after delete
              const msgs = await ChatService.getMessages(conversationId);
              dispatch(setMessages({ conversationId, messages: msgs }));
            } catch {
              Alert.alert('Error', 'Could not delete message.');
            }
          },
        },
      ]);
    },
    [myId, conversationId, dispatch],
  );

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isMine = item.sender._id === myId;
      // Next item (older, since list is reversed) — for avatar visibility
      const olderItem = messages[index + 1];
      const newerItem = messages[index - 1];

      // Show date separator when next message is a different day
      const showDateSep =
        !olderItem || !isSameDay(item.createdAt, olderItem.createdAt);

      // Show avatar only on the last message of a received group
      const showAvatar =
        !isMine &&
        (!newerItem ||
          newerItem.sender._id !== item.sender._id ||
          newerItem.messageType === 'system');

      return (
        <>
          <MessageBubble
            message={item}
            isMine={isMine}
            showAvatar={showAvatar}
            participantName={participantName}
            participantImage={participantImage}
            onLongPress={() => handleLongPress(item)}
          />
          {showDateSep && (
            <DateSeparator label={formatDateLabel(item.createdAt)} />
          )}
        </>
      );
    },
    [myId, messages, participantName, participantImage, handleLongPress],
  );

  // ── Header ────────────────────────────────────────────────────────────────

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Icon name="chevron-back" size={24} color={colors.dark} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.headerInfo} activeOpacity={0.75}>
        <SmallAvatar
          name={participantName}
          image={participantImage}
          size={38}
        />
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerName} numberOfLines={1}>
            {participantName}
          </Text>
          <Text style={styles.headerStatus}>
            {isOtherTyping
              ? 'typing…'
              : isConnected
              ? 'online'
              : 'offline'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
        <Icon name="ellipsis-vertical" size={20} color={colors.dark} />
      </TouchableOpacity>
    </View>
  );

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        {renderHeader()}
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {renderHeader()}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          inverted
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // Typing indicator as list header (appears at bottom since inverted)
          ListHeaderComponent={
            isOtherTyping ? (
              <TypingIndicator name={participantName} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon
                name="chatbubble-outline"
                size={52}
                color={colors.border}
              />
              <Text style={styles.emptyText}>
                Say hi to {participantName}!
              </Text>
            </View>
          }
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Type a message…"
              placeholderTextColor={colors.muted}
              value={inputText}
              onChangeText={handleTextChange}
              multiline
              maxLength={2000}
              returnKeyType="default"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendBtn,
              inputText.trim().length === 0 && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={inputText.trim().length === 0 || isSending}
            activeOpacity={0.8}>
            {isSending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Icon name="send" size={18} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatDetailScreen;

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadows.xs,
  },
  backBtn: {
    marginRight: spacing[2],
    padding: spacing[1],
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  avatarFallback: {
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...textPresets.labelSm,
    color: colors.primary,
    fontSize: 11,
  },
  headerTextWrap: { flex: 1 },
  headerName: {
    ...textPresets.label,
    color: colors.dark,
  },
  headerStatus: {
    ...textPresets.caption,
    color: colors.muted,
    marginTop: 1,
  },
  headerAction: {
    padding: spacing[1],
    marginLeft: spacing[2],
  },

  // ── List
  listContent: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[4],
    flexGrow: 1,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: spacing[3],
  },
  emptyText: {
    ...textPresets.body,
    color: colors.muted,
  },

  // ── Date separator
  dateSepWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[5],
    gap: spacing[3],
  },
  dateSepLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dateSepText: {
    ...textPresets.caption,
    color: colors.subtle,
  },

  // ── Typing indicator
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: spacing[2],
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius['2xl'],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...shadows.xs,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.muted,
  },
  typingLabel: {
    ...textPresets.caption,
    color: colors.muted,
  },

  // ── Bubbles
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: spacing[1.5],
    maxWidth: '80%',
  },
  bubbleRowMine: {
    alignSelf: 'flex-end',
  },
  bubbleRowTheirs: {
    alignSelf: 'flex-start',
  },
  bubbleAvatarWrap: {
    marginRight: spacing[2],
    alignSelf: 'flex-end',
  },
  bubbleOuter: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  bubbleOuterMine: {
    borderBottomRightRadius: radius.xs,
  },
  bubbleOuterTheirs: {
    borderBottomLeftRadius: radius.xs,
  },
  bubbleGradient: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  bubbleCard: {
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...shadows.xs,
  },
  bubbleTextMine: {
    ...textPresets.body,
    color: colors.white,
    lineHeight: 22,
  },
  bubbleTextTheirs: {
    ...textPresets.body,
    color: colors.dark,
    lineHeight: 22,
  },
  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: spacing[1],
  },
  bubbleTimeMine: {
    ...textPresets.caption,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
  },
  bubbleTimeTheirs: {
    ...textPresets.caption,
    color: colors.subtle,
    fontSize: 10,
    textAlign: 'right',
    marginTop: spacing[1],
  },
  mediaImage: {
    width: 200,
    height: 150,
    borderRadius: radius.md,
    marginBottom: spacing[2],
  },

  // ── System message
  systemMsgWrap: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.full,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
    marginVertical: spacing[2],
  },
  systemMsgText: {
    ...textPresets.caption,
    color: colors.muted,
  },

  // ── Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[3],
    paddingBottom: Platform.OS === 'ios' ? spacing[3] : spacing[3],
    backgroundColor: colors.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing[2],
  },
  inputWrap: {
    flex: 1,
    backgroundColor: colors.surfaceInput,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    ...textPresets.body,
    color: colors.dark,
    maxHeight: 100,
    padding: 0,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primarySm,
  },
  sendBtnDisabled: {
    backgroundColor: colors.border,
    ...shadows.none,
  },
});
