import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FAVORITE_ROOMS = [
  {
    id: '1',
    name: 'Amazing AC room near civil lines',
    price: '8000Rs / month',
    availability: 'Available now',
    type: 'Single room',
    location: 'Civil lines',
    image: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Stunning Mansion Block-Luxury living',
    price: '18000Rs / month',
    availability: 'Available from 1 May',
    type: 'Double room',
    location: 'Vaishali nagar',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Cozy Studio near Metro',
    price: '12000Rs / month',
    availability: 'Available now',
    type: 'Studio',
    location: 'Sector 18',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=500&auto=format&fit=crop',
  },
];

const FAVORITE_FLATMATES = [
  {
    id: '1',
    name: 'Aliya, 23',
    subtitle: 'Student, Female',
    interests: ['Vegan', 'Night owl', 'Travel'],
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
  },
  {
    id: '2',
    name: 'Sana, 24',
    subtitle: 'Professional, Female',
    interests: ['Fitness', 'Coffee', 'Music'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
  },
];

const RoomCard = ({ item, index }: { item: typeof FAVORITE_ROOMS[0]; index: number }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handleHeartPress = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.3, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={[styles.roomCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('RoomDetailScreen', { room: item })}
      >
        <Image source={{ uri: item.image }} style={styles.roomImage} />
        <TouchableOpacity style={styles.heartButton} onPress={handleHeartPress}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Icon name="heart" size={18} color="#038C98" />
          </Animated.View>
        </TouchableOpacity>
        <View style={styles.roomInfo}>
          <Text style={styles.roomTitle}>{item.name}</Text>
          <Text style={styles.roomDetails}>{item.price} | {item.availability}</Text>
          <Text style={styles.roomDetails}>{item.type} | {item.location}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const FlatmateCard = ({ item, index }: { item: typeof FAVORITE_FLATMATES[0]; index: number }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View style={[styles.flatmateCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Image source={{ uri: item.image }} style={styles.flatmatePhoto} />
      <View style={styles.flatmateContent}>
        <Text style={styles.flatmateName}>{item.name}</Text>
        <Text style={styles.flatmateSubtitle}>{item.subtitle}</Text>
        <View style={styles.interestsRow}>
          {item.interests.map((interest) => (
            <View key={interest} style={styles.interestChip}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity 
          style={styles.viewProfileButton}
          onPress={() => navigation.navigate('FlatmateProfileScreen', { owner: item.name })}
        >
          <Text style={styles.viewProfileText}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const FavoritesScreen = () => {
  const [activeTab, setActiveTab] = useState<'Rooms' | 'Flatmates'>('Rooms');
  const headerFade = useRef(new Animated.Value(0)).current;
  const tabTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const switchTab = (tab: 'Rooms' | 'Flatmates') => {
    setActiveTab(tab);
    Animated.spring(tabTranslateX, {
      toValue: tab === 'Rooms' ? 0 : 88, // Approximate width of one tab
      useNativeDriver: true,
      friction: 8,
      tension: 45,
    }).start();
  };

  const renderContent = () => {
    const data = activeTab === 'Rooms' ? FAVORITE_ROOMS : FAVORITE_FLATMATES;
    
    if (data.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="heart-outline" size={48} color="#038C98" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>Rooms you like will appear here</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'Rooms' 
          ? FAVORITE_ROOMS.map((room, index) => <RoomCard key={room.id} item={room} index={index} />)
          : FAVORITE_FLATMATES.map((mate, index) => <FlatmateCard key={mate.id} item={mate} index={index} />)
        }
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF5F5" />
      
      {/* Top Header */}
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <Text style={styles.title}>Favorites</Text>
        
        {/* Tab Switcher */}
        <View style={styles.tabSwitcherContainer}>
          <View style={styles.tabSwitcher}>
            <Animated.View style={[styles.tabIndicator, { transform: [{ translateX: tabTranslateX }] }]} />
            <TouchableOpacity 
              style={styles.tabButton} 
              onPress={() => switchTab('Rooms')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'Rooms' && styles.activeTabText]}>Rooms</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tabButton} 
              onPress={() => switchTab('Flatmates')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'Flatmates' && styles.activeTabText]}>Flatmates</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDF5F5',
  },
  header: {
    paddingTop: 16, // SafeAreaView top adds 52px total
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#18181B',
  },
  tabSwitcherContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  tabSwitcher: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 4,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: 88, // Sync with switchTab translate value
    bottom: 4,
    backgroundColor: '#038C98',
    borderRadius: 26,
  },
  tabButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 26,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  roomImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  roomInfo: {
    padding: 14,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181B',
  },
  roomDetails: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  flatmateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
    marginBottom: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  flatmatePhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#038C98',
  },
  flatmateContent: {
    flex: 1,
  },
  flatmateName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181B',
  },
  flatmateSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  interestChip: {
    backgroundColor: '#F0F8F9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  interestText: {
    color: '#038C98',
    fontSize: 12,
    fontWeight: '500',
  },
  viewProfileButton: {
    marginTop: 10,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#038C98',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
  },
  viewProfileText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
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
  },
});

export default FavoritesScreen;
