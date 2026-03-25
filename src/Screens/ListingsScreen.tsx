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
  Modal,
  ScrollView,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ROOMS = [
  {
    id: '1',
    name: 'Amazing AC room near civil lines',
    price: '₹8,000 / month',
    availability: 'Available now',
    type: 'Single room',
    location: 'Civil lines',
    image: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Stunning Mansion Block-Luxury living',
    price: '₹18,000 / month',
    availability: 'Available from 1 May',
    type: 'Double room',
    location: 'Vaishali nagar',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Cozy Studio near Metro',
    price: '₹12,000 / month',
    availability: 'Available now',
    type: 'Studio',
    location: 'Sector 18',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: '4',
    name: 'Premium Modern Suite',
    price: '₹15,000 / month',
    availability: 'Available now',
    type: '1BHK',
    location: 'Malviya nagar',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=500&auto=format&fit=crop',
  },
];

const CATEGORIES = ['All rooms', 'Newest', 'Near me', 'Top rated'];

const FilterModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const [selectedType, setSelectedType] = useState('Any');
  const [priceRange, setPriceRange] = useState([5000, 25000]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Rooms</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <Text style={styles.filterLabel}>Room Type</Text>
            <View style={styles.filterOptions}>
              {['Any', 'Single', 'Double', 'Studio', '1BHK'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[styles.filterChipText, selectedType === type && styles.filterChipTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Price Range (Monthly)</Text>
            <View style={styles.priceInputs}>
              <View style={styles.priceBox}>
                <Text style={styles.priceBoxLabel}>Min</Text>
                <Text style={styles.priceBoxValue}>₹{priceRange[0]}</Text>
              </View>
              <View style={styles.priceBox}>
                <Text style={styles.priceBoxLabel}>Max</Text>
                <Text style={styles.priceBoxValue}>₹{priceRange[1]}</Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const RoomCard = ({ item, index }: { item: typeof ROOMS[0]; index: number }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isFavorite, setIsFavorite] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, friction: 3 }),
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
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent']}
            style={styles.imageOverlay}
          />
          <TouchableOpacity
            style={styles.heartButton}
            onPress={toggleFavorite}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Icon
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? '#EE4B2B' : '#038C98'}
              />
            </Animated.View>
          </TouchableOpacity>
          <View style={styles.locationTag}>
            <Icon name="location" size={12} color="#FFF" />
            <Text style={styles.locationTagText}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.roomName}>{item.name}</Text>
            <Text style={styles.roomPriceSmall}>{item.price.split(' ')[0]}</Text>
          </View>
          <View style={styles.featuresRow}>
            <View style={styles.featurePill}>
              <Icon name="bed-outline" size={12} color="#666" />
              <Text style={styles.featureText}>{item.type}</Text>
            </View>
            <View style={styles.featurePill}>
              <Icon name="calendar-outline" size={12} color="#666" />
              <Text style={styles.featureText}>{item.availability}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ListingsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [activeTab, setActiveTab] = useState(0);
  const [isFilterVisible, setFilterVisible] = useState(false);

  const headerSlide = useRef(new Animated.Value(-100)).current;
  const searchPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(headerSlide, {
      toValue: 0,
      duration: 600,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  }, []);

  const onSearchFocus = () => {
    Animated.sequence([
      Animated.timing(searchPulse, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(searchPulse, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Teal Header Section */}
      <Animated.View style={[
        styles.header,
        {
          paddingTop: insets.top + 20,
          transform: [{ translateY: headerSlide }]
        }
      ]}>
        <LinearGradient
          colors={['#038C98', '#025F68']}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Icon name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.headerBtn} onPress={() => setFilterVisible(true)}>
            <Icon name="options-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.welcomeText}>Welcome, Sayan</Text>
        <Text style={styles.headerSubtitle}>I am looking for room somewhere at</Text>

        <Animated.View style={[styles.searchContainer, { transform: [{ scale: searchPulse }] }]}>
          <Icon name="location-outline" size={20} color="#038C98" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search for location"
            placeholderTextColor="#999"
            style={styles.searchInput}
            onFocus={onSearchFocus}
          />
          <TouchableOpacity style={styles.searchGoBtn}>
            <Icon name="search" size={18} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {CATEGORIES.map((item, index) => (
            <TouchableOpacity
              key={item}
              onPress={() => setActiveTab(index)}
              style={[styles.tabItem, activeTab === index && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Room Listing */}
      <FlatList
        data={ROOMS}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <RoomCard item={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <FilterModal visible={isFilterVisible} onClose={() => setFilterVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F7F8',
  },
  header: {
    paddingHorizontal: 22,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: '#038C98',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 15,
    overflow: 'hidden',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  searchContainer: {
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  searchGoBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#038C98',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tabs
  tabsContainer: {
    backgroundColor: '#F2F7F8',
    paddingVertical: 14,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tabItem: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0EFEE',
    elevation: 2,
    shadowColor: '#038C98',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  activeTab: {
    backgroundColor: '#038C98',
    borderColor: '#038C98',
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },

  // Listing
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#038C98',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  imageContainer: {
    height: 200,
    width: '100%',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heartButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  locationTag: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  locationTagText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardInfo: {
    padding: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roomName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 10,
  },
  roomPriceSmall: {
    fontSize: 16,
    fontWeight: '800',
    color: '#038C98',
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  featureText: {
    fontSize: 12,
    color: '#444',
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
  },
  modalScroll: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  filterChipActive: {
    borderColor: '#038C98',
    backgroundColor: '#F0F8F9',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#038C98',
  },
  priceInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  priceBox: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
  },
  priceBoxLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  priceBoxValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#038C98',
    marginTop: 4,
  },
  applyButton: {
    backgroundColor: '#038C98',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#038C98',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ListingsScreen;
