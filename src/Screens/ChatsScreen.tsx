import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  Image,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CHAT_DATA = [
  {
    id: '1',
    name: 'Aliya, 23',
    message: 'Hi! Is the room still available?',
    time: '2m ago',
    unread: 2,
    online: true,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
  },
  {
    id: '2',
    name: 'Rahul S.',
    message: 'Yes I am looking for a flatmate',
    time: '1h ago',
    unread: 1,
    online: false,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
  },
  {
    id: '3',
    name: 'Priya M.',
    message: 'Can we schedule a visit?',
    time: 'Yesterday',
    unread: 0,
    online: true,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
  },
  {
    id: '4',
    name: 'Amit K.',
    message: 'The room is 400 sqft, fully furnished',
    time: '2d ago',
    unread: 0,
    online: false,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
  },
];

const ChatRow = ({ item, index }: { item: typeof CHAT_DATA[0]; index: number }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance Animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing Badge Animation
    if (item.unread > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [index, item.unread]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ 
      opacity: opacityAnim, 
      transform: [{ translateX: slideAnim }, { scale: pressScale }] 
    }}>
      <TouchableOpacity 
        style={styles.chatRow} 
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => navigation.navigate('ChatDetailScreen', { chat: item })}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.image }} style={styles.avatar} />
          {item.online && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeaderRow}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.timestamp}>{item.time}</Text>
          </View>
          <Text 
            style={[styles.message, item.unread > 0 && styles.unreadMessage]} 
            numberOfLines={1}
          >
            {item.message}
          </Text>
        </View>

        {item.unread > 0 && (
          <Animated.View style={[styles.badge, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.badgeText}>{item.unread}</Text>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const ChatsScreen = () => {
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF5F5" />
      
      {/* Header Section */}
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <Text style={styles.title}>Chats</Text>
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={18} color="#AAA" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search messages"
            placeholderTextColor="#AAA"
          />
        </View>
      </Animated.View>

      {/* Chat List */}
      <View style={styles.listContainer}>
        <FlatList
          data={CHAT_DATA}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <ChatRow item={item} index={index} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="chatbubble-outline" size={48} color="#AAA" />
              <Text style={styles.emptyTitle}>No chats yet</Text>
              <Text style={styles.emptySubtitle}>Start a conversation by viewing a room</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDF5F5',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#18181B',
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#18181B',
    padding: 0,
  },
  listContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  listContent: {
    paddingBottom: 20,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ADE80',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181B',
  },
  timestamp: {
    fontSize: 12,
    color: '#AAA',
  },
  message: {
    fontSize: 13,
    color: '#888',
    marginTop: 3,
  },
  unreadMessage: {
    color: '#444',
    fontWeight: '600',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#038C98',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#888',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#AAA',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default ChatsScreen;
