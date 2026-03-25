import React, { useEffect, useRef } from 'react';
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

const SettingRow = ({ icon, label, bg, color, index, isLogout }: {
  icon?: string;
  label: string;
  bg?: string;
  color?: string;
  index: number;
  isLogout?: boolean;
}) => {
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      delay: 400 + index * 40,
      useNativeDriver: true,
    }).start();
  }, [index]);

  return (
    <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
      <TouchableOpacity style={styles.settingsRow}>
        {!isLogout && (
          <View style={[styles.settingsIconBg, { backgroundColor: bg }]}>
            <Icon name={icon || 'settings-outline'} size={16} color={color || '#FFF'} />
          </View>
        )}
        <Text style={[styles.settingsLabel, isLogout && styles.logoutText]}>{label}</Text>
        {!isLogout && <Icon name="chevron-forward" size={14} color="#AAA" />}
      </TouchableOpacity>
    </Animated.View>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const avatarScale = useRef(new Animated.Value(0.5)).current;
  const sectionFade = useRef(new Animated.Value(0)).current;
  const sectionSlide = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial Animations
    Animated.parallel([
      Animated.spring(avatarScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(sectionFade, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sectionSlide, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse Animation for Edit Button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const MY_LISTINGS = [
    { id: '1', name: 'Amazing AC room', price: '8000Rs', image: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=300' },
    { id: '2', name: 'Luxury Mansion', price: '18000Rs', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=300' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF5F5" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <Animated.View style={[styles.profileCard, { opacity: sectionFade, transform: [{ translateY: sectionSlide }] }]}>
          <View style={styles.avatarContainer}>
            <Animated.Image
              source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200' }}
              style={[styles.avatar, { transform: [{ scale: avatarScale }] }]}
            />
            <TouchableOpacity style={styles.editCameraBtn}>
              <Icon name="camera" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>Sayan.</Text>
          <Text style={styles.subtitle}>Student, Female</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={[styles.statCol, { borderRightWidth: 0 }]}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Chats</Text>
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* My Listings Section */}
        <Animated.View style={[styles.section, { opacity: sectionFade, transform: [{ translateY: sectionSlide }] }]}>
          <Text style={styles.sectionHeading}>My Listings</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listingsScroll}
          >
            {MY_LISTINGS.map((item) => (
              <TouchableOpacity key={item.id} style={styles.listingCard}>
                <Image source={{ uri: item.image }} style={styles.listingImage} />
                <View style={styles.listingInfo}>
                  <Text style={styles.listingTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.listingPrice}>{item.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* About Me Section */}
        <Animated.View style={[styles.aboutCard, { opacity: sectionFade, transform: [{ translateY: sectionSlide }] }]}>
          <Text style={styles.sectionHeadingSmall}>About Me</Text>

          <Text style={styles.aboutLabel}>Interests</Text>
          <View style={styles.interestsRow}>
            {['Vegan', 'Night owl', 'Travel', 'Music', 'Dancing'].map((item) => (
              <View key={item} style={styles.interestChip}>
                <Text style={styles.interestText}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.aboutLabel}>Compatible with</Text>
          <Text style={styles.compatibleText}>Non-smoker • Vegan • Party animal</Text>
        </Animated.View>

        {/* Settings Section */}
        <Animated.View style={[styles.settingsCard, { opacity: sectionFade, transform: [{ translateY: sectionSlide }] }]}>
          <Text style={styles.settingsHeader}>Settings</Text>

          <SettingRow index={0} label="Notifications" icon="notifications" bg="rgba(255, 165, 0, 0.1)" color="#FFA500" />
          <SettingRow index={1} label="Privacy" icon="lock-closed" bg="rgba(0, 122, 255, 0.1)" color="#007AFF" />
          <SettingRow index={2} label="Help & Support" icon="help-circle" bg="rgba(3, 140, 152, 0.1)" color="#038C98" />
          <SettingRow index={3} label="Logout" isLogout />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF5F5',
  },
  scrollContent: {
    paddingBottom: 100, // Room for tab bar
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 52,
    borderRadius: 20,
    elevation: 3,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#038C98',
  },
  editCameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#038C98',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18181B',
    marginTop: 14,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
    paddingTop: 16,
    width: '100%',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#F0F0F0',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#038C98',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  editBtn: {
    marginTop: 16,
    height: 40,
    width: 140,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#038C98',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    color: '#038C98',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 12,
  },
  listingsScroll: {
    paddingRight: 16,
  },
  listingCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  listingImage: {
    width: '100%',
    height: 100,
  },
  listingInfo: {
    padding: 10,
  },
  listingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18181B',
  },
  listingPrice: {
    fontSize: 12,
    color: '#038C98',
    fontWeight: '600',
    marginTop: 2,
  },
  aboutCard: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  sectionHeadingSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 12,
  },
  aboutLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  interestChip: {
    backgroundColor: '#F0F8F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#038C98',
    fontSize: 12,
    fontWeight: '500',
  },
  compatibleText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  settingsCard: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  settingsHeader: {
    fontSize: 16,
    fontWeight: '700',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
    color: '#18181B',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
  },
  settingsIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
    color: '#18181B',
  },
  logoutText: {
    color: '#FF4444',
  },
});

export default ProfileScreen;
