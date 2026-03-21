import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BannerCard = ({ 
  title, 
  icon, 
  onPress, 
  bgImage, 
  animValue 
}: { 
  title: string; 
  icon: string; 
  onPress: () => void; 
  bgImage: any;
  animValue: Animated.Value;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ opacity: animValue, transform: [{ translateY: animValue.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }, { scale }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.bannerCard}
      >
        <ImageBackground source={bgImage} style={styles.bannerBg} resizeMode="cover">
          <LinearGradient
            colors={['rgba(3,140,152,0.85)', 'rgba(3,140,152,0.5)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerLeft}>
                <Icon name={icon} size={18} color="#FFF" />
                <Text style={styles.bannerTitle}>{title}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#FFF" />
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

const PostAdCard = ({ title, subtitle, onPress, animValue }: { title: string; subtitle: string; onPress: () => void; animValue: Animated.Value }) => (
  <Animated.View style={{ opacity: animValue, transform: [{ translateY: animValue.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
    <TouchableOpacity style={styles.postAdCard} onPress={onPress}>
      <View style={styles.postAdLeft}>
        <Text style={styles.postAdTitle}>{title}</Text>
        <Text style={styles.postAdSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#AAAAAA" />
    </TouchableOpacity>
  </Animated.View>
);

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
  // Animation values
  const greetingFade = useRef(new Animated.Value(0)).current;
  const welcomeFade = useRef(new Animated.Value(0)).current;
  const nameFade = useRef(new Animated.Value(0)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const banner1Fade = useRef(new Animated.Value(0)).current;
  const banner2Fade = useRef(new Animated.Value(0)).current;
  const postAdLabelFade = useRef(new Animated.Value(0)).current;
  const postAd1Fade = useRef(new Animated.Value(0)).current;
  const postAd2Fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(greetingFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(welcomeFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(nameFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(subtitleFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(banner1Fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(banner2Fade, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    // Delay post ad section
    setTimeout(() => {
      Animated.stagger(100, [
        Animated.timing(postAdLabelFade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(postAd1Fade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(postAd2Fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start();
    }, 200);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF5F5" />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Section */}
        <View style={styles.topSection}>
          <Animated.Text style={[styles.greeting, { opacity: greetingFade }]}>
            Good evening!
          </Animated.Text>
          <Animated.Text style={[styles.welcomeHeading, { opacity: welcomeFade }]}>
            Welcome to{'\n'}meetmate
          </Animated.Text>
          <Animated.Text style={[styles.userName, { opacity: nameFade }]}>
            Charul B.
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: subtitleFade }]}>
            Here you can rent your room or find your mate with our safe platform
          </Animated.Text>
        </View>

        {/* Banner Action Cards */}
        <View style={styles.bannerContainer}>
          <BannerCard 
            title="Search for rooms and properties" 
            icon="search-outline" 
            onPress={() => navigation.navigate('ListingsScreen')}
            bgImage={{ uri: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=500&auto=format&fit=crop' }}
            animValue={banner1Fade}
          />
          <BannerCard 
            title="Search for Flatmates" 
            icon="people-outline" 
            onPress={() => navigation.navigate('FlatmateProfileScreen')}
            bgImage={{ uri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=500&auto=format&fit=crop' }}
            animValue={banner2Fade}
          />
        </View>

        {/* Post Ad Section */}
        <View style={styles.postAdSection}>
          <Animated.Text style={[styles.postAdLabel, { opacity: postAdLabelFade }]}>
            Post ad
          </Animated.Text>
          <View style={styles.postAdContainer}>
            <PostAdCard 
              title="Room ad" 
              subtitle="Advertise your one or more rooms here!" 
              onPress={() => console.log('Room Ad')}
              animValue={postAd1Fade}
            />
            <PostAdCard 
              title="Room wanted ad" 
              subtitle="Want a room? advertise here!" 
              onPress={() => console.log('Room Wanted Ad')}
              animValue={postAd2Fade}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDF5F5',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  topSection: {
    paddingTop: 32, // Adjusted since SafeAreaView handles most of it, total ~52px
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  welcomeHeading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#038C98',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181B',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
    maxWidth: 280,
    marginTop: 8,
  },
  bannerContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
    gap: 12,
  },
  bannerCard: {
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#038C98',
    elevation: 4,
    shadowColor: '#038C98',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  bannerBg: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    lineHeight: 20,
  },
  postAdSection: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  postAdLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 10,
  },
  postAdContainer: {
    gap: 10,
  },
  postAdCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  postAdLeft: {
    flex: 1,
    gap: 4,
  },
  postAdTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181B',
  },
  postAdSubtitle: {
    fontSize: 13,
    color: '#888',
  },
});

export default HomeScreen;
