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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 320;

const InterestPill = ({ label, index }: { label: string; index: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 600 + index * 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.interestPill, { opacity: fadeAnim }]}>
      <Text style={styles.interestText}>{label}</Text>
    </Animated.View>
  );
};

const FlatmateProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const scrollY = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(60)).current;
  const backButtonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(contentSlide, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(backButtonFade, {
        toValue: 1,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const parallaxTranslateY = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
    outputRange: [HERO_HEIGHT / 2, 0, HERO_HEIGHT * 0.5],
  });

  const INTERESTS = ['Alcohol', 'Vegan', 'New in town', 'Party lover', 'Activism', 'Night owl'];

  const COMPATIBILITY = [
    'Non-smoker',
    'Vegan',
    'Party animal',
    'pets or no pets',
    'Professional or non-professional',
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Hero Photo Section */}
      <Animated.View style={[styles.heroContainer, { transform: [{ translateY: parallaxTranslateY }] }]}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800' }} 
          style={styles.heroImage} 
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.heroGradient}
        />
        <View style={styles.heroInfoSection}>
          <Text style={styles.heroName}>Aliya, 23</Text>
          <Text style={styles.heroSubtitle}>Student, Female</Text>
        </View>
      </Animated.View>

      {/* Back Button */}
      <Animated.View style={[styles.headerActions, { opacity: backButtonFade }]}>
        <TouchableOpacity style={styles.backButtonCircle} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#038C98" />
        </TouchableOpacity>
      </Animated.View>

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
        
        <Animated.View style={[styles.contentCard, { transform: [{ translateY: contentSlide }] }]}>
          <Text style={styles.bioText}>
            I would like to rent an apartment of double rooms with who like to socialise but also respect personal space. I am very social and enjoy all the usual social stuff.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>About me</Text>
          
          <Text style={styles.subLabel}>Interests</Text>
          <View style={styles.interestsGrid}>
            {INTERESTS.map((item, index) => (
              <InterestPill key={item} label={item} index={index} />
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.subLabel}>Compatible with</Text>
          <View style={styles.compatibilityList}>
            {COMPATIBILITY.map((item) => (
              <View key={item} style={styles.compatibilityRow}>
                <View style={styles.tealDot} />
                <Text style={styles.compatibilityText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.subLabel}>Room posted</Text>
          <Text style={styles.roomPostedValue}>1</Text>

          {/* Action Buttons Row */}
          <View style={styles.footerActions}>
            <TouchableOpacity style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.filledButton}
              onPress={() => navigation.navigate('RoomDetailScreen')}
            >
              <Text style={styles.filledButtonText}>View Room</Text>
            </TouchableOpacity>
          </View>
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
    height: '60%',
  },
  heroInfoSection: {
    position: 'absolute',
    bottom: 48,
    left: 20,
    right: 20,
  },
  heroName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerActions: {
    position: 'absolute',
    top: 52,
    left: 20,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  spacer: {
    height: HERO_HEIGHT - 28,
  },
  contentCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    minHeight: 600,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 18,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 16,
  },
  subLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181B',
    marginBottom: 10,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestPill: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  interestText: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },
  compatibilityList: {
    gap: 4,
  },
  compatibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  tealDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#038C98',
  },
  compatibilityText: {
    fontSize: 14,
    color: '#666',
  },
  roomPostedValue: {
    fontSize: 14,
    color: '#666',
    marginTop: -4,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  outlineButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#038C98',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: '#038C98',
    fontSize: 15,
    fontWeight: '700',
  },
  filledButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#038C98',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default FlatmateProfileScreen;
