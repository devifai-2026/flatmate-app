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
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ROOMS = [
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

const CATEGORIES = ['All categories', 'New', 'Near me', 'Best room'];

const RoomCard = ({ item, index }: { item: typeof ROOMS[0]; index: number }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isFavorite, setIsFavorite] = useState(false);
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
  }, []);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.3, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => navigation.navigate('RoomDetailScreen', { room: item })}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.roomImage} />
          <TouchableOpacity 
            style={styles.heartButton} 
            onPress={toggleFavorite}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Icon 
                name={isFavorite ? 'heart' : 'heart-outline'} 
                size={18} 
                color={isFavorite ? '#038C98' : '#888'} 
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardInfo}>
          <Text style={styles.roomName}>{item.name}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{item.price}</Text>
            <Text style={styles.divider}>|</Text>
            <Text style={styles.infoText}>{item.availability}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{item.type}</Text>
            <Text style={styles.divider}>|</Text>
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ListingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [activeTab, setActiveTab] = useState(0);
  const headerSlide = useRef(new Animated.Value(-60)).current;
  const tabUnderlineX = useRef(new Animated.Value(0)).current;
  const searchPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(headerSlide, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    Animated.spring(tabUnderlineX, {
      toValue: index * 100, // Approximate width for smooth sliding
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  };

  const onSearchFocus = () => {
    Animated.sequence([
      Animated.timing(searchPulse, { toValue: 1.02, duration: 150, useNativeDriver: true }),
      Animated.timing(searchPulse, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#038C98" />
      
      {/* Teal Header Section */}
      <Animated.View style={[styles.header, { transform: [{ translateY: headerSlide }] }]}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="options-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.welcomeText}>Welcome, Charul</Text>
        <Text style={styles.headerSubtitle}>I am looking for room somewhere at</Text>
        
        <Animated.View style={[styles.searchContainer, { transform: [{ scale: searchPulse }] }]}>
          <TextInput 
            placeholder="Search for location" 
            placeholderTextColor="#999"
            style={styles.searchInput}
            onFocus={onSearchFocus}
          />
          <Icon name="search" size={18} color="#038C98" />
        </Animated.View>
      </Animated.View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              onPress={() => handleTabPress(index)}
              style={styles.tabItem}
            >
              <Text style={[
                styles.tabText, 
                activeTab === index && styles.activeTabText
              ]}>
                {item}
              </Text>
              {activeTab === index && (
                <Animated.View style={styles.activeTabBorder} />
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Room Listing */}
      <FlatList
        data={ROOMS}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <RoomCard item={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDF5F5',
  },
  header: {
    backgroundColor: '#038C98',
    paddingHorizontal: 20,
    paddingTop: 16, // SafeAreaView edges top handles 52px total
    paddingBottom: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerIcon: {
    padding: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  searchContainer: {
    marginTop: 18,
    backgroundColor: '#FFF',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#18181B',
    paddingVertical: 0,
  },
  tabsContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    height: 52,
  },
  tabItem: {
    paddingVertical: 14,
    marginRight: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#038C98',
    fontWeight: '700',
  },
  activeTabBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#038C98',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInfo: {
    padding: 16,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181B',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  divider: {
    fontSize: 12,
    color: '#E5E7EB',
  },
});

export default ListingsScreen;
