/**
 * useSocket — Socket.io singleton hook
 *
 * Uses a module-level socket instance so the connection persists across
 * screen re-renders and navigations.  All incoming events are dispatched
 * directly to the Redux store so any screen can read real-time state.
 *
 * Install socket.io-client before using:
 *   yarn add socket.io-client
 */
import { useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../services/api.environments';
import { store } from '../Redux/store';
import {
  appendMessage,
  setSocketConnected,
  setTyping,
  updateConversation,
} from '../Redux/Slices/chatSlice';
import { Message, Conversation } from '../Redux/Slices/chatSlice';

// Strip "/api" suffix to get the socket server root
const SOCKET_URL = BASE_URL.replace(/\/api$/, '');

// ── Module-level singleton ─────────────────────────────────────────────────
let _socket: Socket | null = null;

const getSocket = (): Socket | null => _socket;

const initSocket = (token: string): Socket => {
  // Re-use if already connected
  if (_socket?.connected) return _socket;

  // Disconnect stale socket before creating a new one
  if (_socket) {
    _socket.removeAllListeners();
    _socket.disconnect();
  }

  _socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  // ── Connection lifecycle ───────────────────────────────────────────────
  _socket.on('connect', () => {
    store.dispatch(setSocketConnected(true));
  });

  _socket.on('disconnect', () => {
    store.dispatch(setSocketConnected(false));
  });

  // ── Incoming events → Redux ────────────────────────────────────────────
  _socket.on(
    'receive_message',
    ({ conversationId, message }: { conversationId: string; message: Message }) => {
      store.dispatch(appendMessage({ conversationId, message }));
    },
  );

  _socket.on(
    'typing_status',
    ({
      conversationId,
      userId,
      isTyping,
    }: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      store.dispatch(setTyping({ conversationId, userId, isTyping }));
    },
  );

  _socket.on('conversation_updated', (conversation: Conversation) => {
    store.dispatch(updateConversation(conversation));
  });

  return _socket;
};

const disconnectSocket = (): void => {
  if (_socket) {
    _socket.removeAllListeners();
    _socket.disconnect();
    _socket = null;
  }
  store.dispatch(setSocketConnected(false));
};

// ── Hook ──────────────────────────────────────────────────────────────────
export const useSocket = () => {
  /** Connect (or re-use) the socket for the authenticated user. */
  const connect = useCallback(() => {
    const state = store.getState();
    const token = state.auth?.token;
    if (!token) return;
    initSocket(token);
  }, []);

  /** Fully disconnect and clean up the socket. */
  const disconnect = useCallback(() => {
    disconnectSocket();
  }, []);

  /** Join a conversation room to receive its messages. */
  const joinConversation = useCallback((conversationId: string) => {
    getSocket()?.emit('join_conversation', { conversationId });
  }, []);

  /** Leave a conversation room (e.g. on screen unmount). */
  const leaveConversation = useCallback((conversationId: string) => {
    getSocket()?.emit('leave_conversation', { conversationId });
  }, []);

  /**
   * Emit a typing status event.
   * Debounce the `false` call in the consumer (stop after inactivity).
   */
  const emitTyping = useCallback((conversationId: string, isTyping: boolean) => {
    getSocket()?.emit('typing', { conversationId, isTyping });
  }, []);

  /** Notify the server that the current user has read all messages. */
  const emitMessageRead = useCallback((conversationId: string) => {
    getSocket()?.emit('message_read', { conversationId });
  }, []);

  return {
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    emitTyping,
    emitMessageRead,
  };
};
