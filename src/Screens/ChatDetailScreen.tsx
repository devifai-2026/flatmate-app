import React, { useState, useEffect, useRef } from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SAMPLE_MESSAGES = [
  { id: '1', text: "Hi! Is the room still available?", time: "10:30 AM", type: 'received' },
  { id: '2', text: "Yes it is! Are you interested?", time: "10:31 AM", type: 'sent', read: true },
  { id: '3', text: "Yes, I would love to see it. When can I visit?", time: "10:33 AM", type: 'received' },
  { id: '4', text: "You can visit this Saturday around 11 AM", time: "10:35 AM", type: 'sent', read: true },
  { id: '5', text: "That works perfectly for me!", time: "10:36 AM", type: 'received' },
  { id: '6', text: "Great! I will send you the address", time: "10:37 AM", type: 'sent', read: true },
  { id: '7', text: "Also what is included in the 9900 Rs rent?", time: "10:40 AM", type: 'received' },
  { id: '8', text: "Internet, parking and furnished room included", time: "10:41 AM", type: 'sent', read: false },
  { id: '9', text: "Perfect! See you Saturday then 😊", time: "10:42 AM", type: 'received' },
].reverse();

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: -5, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.delay(400),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={styles.receivedBubbleContainer}>
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100' }} 
        style={styles.smallAvatar} 
      />
      <View style={[styles.messageBubble, styles.receivedBubble, { paddingVertical: 14 }]}>
        <View style={styles.typingContainer}>
          <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]} />
          <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]} />
          <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]} />
        </View>
      </View>
    </View>
  );
};

const MessageItem = ({ item, index }: { item: typeof SAMPLE_MESSAGES[0]; index: number }) => {
  const isSent = item.type === 'sent';
  const entryAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(entryAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 30,
      useNativeDriver: true,
    }).start();
  }, [index]);

  return (
    <Animated.View style={{ 
      opacity: entryAnim, 
      transform: [{ translateY: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] 
    }}>
      {isSent ? (
        <View style={styles.sentBubbleContainer}>
          <View style={[styles.messageBubble, styles.sentBubble]}>
            <Text style={styles.sentText}>{item.text}</Text>
          </View>
          <View style={styles.sentFooter}>
            <Text style={styles.timestamp}>{item.time}</Text>
            <Icon 
              name="checkmark-done" 
              size={16} 
              color={item.read ? '#038C98' : '#AAA'} 
            />
          </View>
        </View>
      ) : (
        <View style={styles.receivedBubbleContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100' }} 
            style={styles.smallAvatar} 
          />
          <View>
            <View style={[styles.messageBubble, styles.receivedBubble]}>
              <Text style={styles.receivedText}>{item.text}</Text>
            </View>
            <Text style={[styles.timestamp, { marginLeft: 4, marginTop: 4 }]}>{item.time}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const ChatDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [inputText, setInputText] = useState('');
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const listFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(listFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    Animated.sequence([
      Animated.spring(sendButtonScale, { toValue: 0.9, useNativeDriver: true }),
      Animated.spring(sendButtonScale, { toValue: 1, useNativeDriver: true }),
    ]).start(() => setInputText(''));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#038C98" />
        </TouchableOpacity>
        
        <View style={styles.headerProfile}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100' }} 
              style={styles.avatar} 
            />
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.headerName}>Aliya, 23</Text>
            <Text style={styles.onlineStatus}>Online</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity>
            <Icon name="call" size={20} color="#038C98" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="ellipsis-vertical" size={20} color="#038C98" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Room Preview */}
        <View style={styles.previewBanner}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=200' }} 
            style={styles.previewImage} 
          />
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle} numberOfLines={1}>Large Room With Adjacent Bathroom</Text>
            <Text style={styles.previewSubtitle}>9,900 Rs / month • Vaishali nagar</Text>
          </View>
          <TouchableOpacity style={styles.viewPill}>
            <Text style={styles.viewText}>View</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateSeparator}>
          <View style={styles.datePill}>
            <Text style={styles.dateText}>Today</Text>
          </View>
        </View>

        {/* Message List */}
        <Animated.View style={{ flex: 1, opacity: listFade }}>
          <FlatList
            inverted
            data={SAMPLE_MESSAGES}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => <MessageItem item={item} index={index} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={<TypingIndicator />}
          />
        </Animated.View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity>
            <Icon name="attach" size={24} color="#038C98" />
          </TouchableOpacity>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#AAA"
              multiline
              value={inputText}
              onChangeText={setInputText}
            />
          </View>

          {inputText.trim().length > 0 ? (
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Icon name="send" size={18} color="#FFF" />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity>
              <Icon name="mic" size={24} color="#038C98" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    zIndex: 10,
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#038C98',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181B',
  },
  onlineStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: -2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F9',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(3,140,152,0.2)',
    gap: 12,
  },
  previewImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#038C98',
  },
  previewSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  viewPill: {
    backgroundColor: '#038C98',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  viewText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  datePill: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#AAA',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sentBubbleContainer: {
    alignSelf: 'flex-end',
    maxWidth: '75%',
    marginBottom: 12,
  },
  receivedBubbleContainer: {
    alignSelf: 'flex-start',
    maxWidth: '75%',
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  sentBubble: {
    backgroundColor: '#038C98',
    borderTopRightRadius: 4,
    shadowColor: '#038C98',
    shadowOpacity: 0.3,
    elevation: 2,
  },
  receivedBubble: {
    backgroundColor: '#F0F8F9',
    borderTopLeftRadius: 4,
  },
  sentText: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
  },
  receivedText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  sentFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#AAA',
  },
  typingContainer: {
    flexDirection: 'row',
    gap: 4,
    height: 10,
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#AAA',
  },
  inputBar: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    minHeight: 40,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    color: '#333',
    paddingTop: 8,
    paddingBottom: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#038C98',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#038C98',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});

export default ChatDetailScreen;
