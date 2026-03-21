import React, { useEffect, useRef, useState } from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 260;

const OverviewRow = ({ label, value, index }: { label: string; value: string; index: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 500 + index * 30,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: 500 + index * 30,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.overviewRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.overviewLabel}>{label}</Text>
      <Text style={styles.overviewValue}>{value}</Text>
    </Animated.View>
  );
};

const RoomDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const scrollY = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        delay: 400,
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

  const parallaxTranslateY = scrollY.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, HERO_HEIGHT],
    outputRange: [SCREEN_WIDTH / 2, 0, HERO_HEIGHT * 0.5],
  });

  const OVERVIEW_DATA = [
    { label: 'Availability', value: 'Now' },
    { label: 'Length of stay', value: '1 year' },
    { label: 'Flatmates', value: '0' },
    { label: 'Preferred roommates', value: 'Male or female' },
    { label: 'Size', value: 'Room 400 ft2' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Parallax Hero Photo */}
      <Animated.View style={[styles.heroContainer, { transform: [{ translateY: parallaxTranslateY }] }]}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=800' }} 
          style={styles.heroImage} 
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.heroGradient}
        />
      </Animated.View>

      {/* Hero Header Controls */}
      <View style={styles.heroHeader}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#038C98" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconCircle} onPress={toggleFavorite}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Icon name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? '#038C98' : '#888'} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.spacer} />
        
        <Animated.View style={[styles.content, { opacity: contentFade, transform: [{ translateY: contentSlide }] }]}>
          {/* Tag */}
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>Private room, 1 Flatmate</Text>
          </View>

          {/* Title and Price */}
          <Text style={styles.title}>LARGE ROOM WITH ADJACENT BATHROOM</Text>
          <Text style={styles.price}>9,900 Rs / month</Text>
          
          <View style={styles.locationRow}>
            <Icon name="location" size={16} color="#038C98" />
            <Text style={styles.locationText}>Vaishali nagar</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="call" size={22} color="#FFF" />
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="chatbubble-ellipses" size={22} color="#FFF" />
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.divider} />

          {/* Owner Row */}
          <TouchableOpacity 
            style={styles.ownerRow} 
            onPress={() => navigation.navigate('FlatmateProfileScreen', { owner: 'Aliya' })}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100' }} 
              style={styles.ownerPhoto} 
            />
            <View>
              <Text style={styles.ownerName}>Aliya, 23</Text>
              <Text style={styles.ownerSubtitle}>Student, Female</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Icon name="chevron-forward" size={18} color="#038C98" />
          </TouchableOpacity>

          <Text style={styles.bioText}>
            I would like to rent an apartment of single room with who like to socialise but also respect personal space. I'm very clean and organized.
          </Text>

          <View style={styles.divider} />

          {/* Overview */}
          <Text style={styles.sectionTitle}>Overview</Text>
          {OVERVIEW_DATA.map((item, index) => (
            <OverviewRow key={item.label} label={item.label} value={item.value} index={index} />
          ))}

          {/* Amenities */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Amenities</Text>
          <View style={styles.amenitiesContainer}>
            {['Internet', 'Parking', 'Furnished', 'Balcony', 'TV'].map((item) => (
              <View key={item} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Suitable for */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Suitable for</Text>
          {[
            'Males & Females',
            'Between 20-30 yrs old',
            'Professionals and non professionals',
            'Non-smokers',
            'No-pets',
          ].map((item) => (
            <View key={item} style={styles.suitableRow}>
              <Icon name="checkmark-circle" size={18} color="#038C98" />
              <Text style={styles.suitableText}>{item}</Text>
            </View>
          ))}
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  heroContainer: {
    height: HERO_HEIGHT,
    position: 'absolute',
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  heroHeader: {
    position: 'absolute',
    top: 52,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  spacer: {
    height: HERO_HEIGHT - 24,
  },
  content: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 800,
  },
  tagContainer: {
    backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18181B',
    marginTop: 12,
    lineHeight: 26,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#038C98',
    marginTop: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#888',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: -10,
    gap: 12,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#038C98',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#038C98',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ownerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#038C98',
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181B',
  },
  ownerSubtitle: {
    fontSize: 13,
    color: '#888',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 14,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
  },
  overviewLabel: {
    fontSize: 14,
    color: '#888',
  },
  overviewValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#18181B',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    backgroundColor: '#F0F8F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  amenityText: {
    color: '#038C98',
    fontSize: 13,
    fontWeight: '500',
  },
  suitableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  suitableText: {
    fontSize: 14,
    color: '#666',
  },
});

export default RoomDetailScreen;
