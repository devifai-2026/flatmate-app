import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  Image,
  ImageBackground,
  Easing,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Colors ---
const TEAL = '#038C98';
const BLACK = '#1A1A1A';
const WHITE = '#FFFFFF';
const GRAY_SOFT = '#F8F9FA';
const TEXT_GRAY = '#777';

// --- Data ---
const PROMO_DATA = [
  {
    id: '1',
    heading: "Find roommate\nor shared flat",
    subtitle: "List your flat for roommate or\nfind sharing space in one.",
    btnLabel: "Create listing",
    img1: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=200',
    img2: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    type: 'overlap',
  },
  {
    id: '2',
    heading: "Safe & Verified\nProfiles only",
    subtitle: "Our AI-powered verification\nensures 100% security.",
    btnLabel: "Verify Now",
    img1: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200',
    img2: 'https://images.unsplash.com/photo-1554126807-6b10f6f6692a?w=200',
    type: 'overlap',
  },
  {
    id: '3',
    heading: "Need Expert\nAssistance?",
    subtitle: "Get a dedicated manager to\nfind your perfect match.",
    btnLabel: "Contact Elite",
    img1: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200',
    img2: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200',
    type: 'overlap',
  }
];

// --- Helper Components ---

const CountUpStat = ({ target, label, delay = 0 }: { target: number; label: string; delay?: number }) => {
  const count = useRef(new Animated.Value(0)).current;
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    count.addListener(({ value }) => {
      setDisplayCount(Math.floor(value));
    });

    Animated.timing(count, {
      toValue: target,
      duration: 1500,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => count.removeAllListeners();
  }, []);

  return (
    <View style={styles.statCol}>
      <Text style={styles.statNumber}>{displayCount}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

const CategoryItem = ({ emoji, label, index, onPress }: { emoji: string; label: string; index: number; onPress: () => void }) => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      delay: 500 + index * 100,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.categoryItem, { transform: [{ scale }] }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ alignItems: 'center' }}>
        <View style={styles.emojiContainer}>
          <Text style={{ fontSize: 36 }}>{emoji}</Text>
        </View>
        <Text style={styles.categoryLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const RoomCard = ({ title, location, price, img, index }: { title: string; location: string; price: string; img: string; index: number }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 800 + index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay: 800 + index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.roomCard, { opacity, transform: [{ translateX: slideAnim }] }]}>
      <Image source={{ uri: img }} style={styles.roomImg} />
      <Text style={styles.roomTitle}>{title}</Text>
      <Text style={styles.roomLocation}>{location}</Text>
      <Text style={styles.roomPrice}>{price}</Text>
    </Animated.View>
  );
};

const PersonCard = ({ name, age, gender, budget, img }: { name: string; age: number; gender: string; budget: string; img: string }) => (
  <View style={styles.personCard}>
    <Image source={{ uri: img }} style={styles.profilePhoto} />
    <Text style={styles.personName}>{name}</Text>
    <Text style={styles.personDetails}>{gender} • {age} yrs</Text>
    <View style={styles.budgetPill}>
      <Text style={styles.budgetText}>{budget}</Text>
    </View>
  </View>
);

const SectionHeader = ({ title, showSeeAll = true }: { title: string; showSeeAll?: boolean }) => (
  <View style={styles.sectionHeaderRow}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {showSeeAll && (
      <TouchableOpacity>
        <Text style={styles.seeAllText}>See all</Text>
      </TouchableOpacity>
    )}
  </View>
);

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const scrollY = useRef(new Animated.Value(0)).current;
  const promoScrollX = useRef(new Animated.Value(0)).current;

  // Entrance Animations
  const heroFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroFade, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Parallax for Hero
  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 380],
    outputRange: [0, -40],
    extrapolate: 'clamp',
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* SECTION 1: HERO BANNER (Fixed Background) */}
      <Animated.View style={[
        styles.heroBlock, 
        { 
          opacity: Animated.multiply(heroFade, heroOpacity), 
          transform: [{ translateY: heroTranslateY }] 
        }
      ]}>
        <View style={styles.heroTealPart}>
          <View style={styles.heroBadgeRow}>
            <Text style={styles.heroBadgeContent}>✦ trusted by 20,000+ tenants ✦</Text>
          </View>
          <Text style={styles.heroHeading}>
            {"meet your ideal roommate"}
          </Text>
        </View>
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800' }} 
          style={styles.heroImgPart}
        >
          <LinearGradient 
            colors={[TEAL, 'transparent']} 
            style={StyleSheet.absoluteFill} 
          />
        </ImageBackground>
      </Animated.View>

      {/* SCROLLABLE WHITE SHEET */}
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false} 
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 348 }}
      >
        <View style={styles.pullUpCard}>
          <Text style={styles.pullUpHeading}>what are you looking for?</Text>
          <View style={styles.categoryRow}>
            <CategoryItem 
              emoji="🏠" 
              label={"Search From room\nand properties"} 
              index={0} 
              onPress={() => navigation.navigate('ListingsScreen')}
            />
            <CategoryItem 
              emoji="🤝" 
              label={"Search from\nflatmates"} 
              index={1} 
              onPress={() => navigation.navigate('FlatmateProfileScreen')}
            />
          </View>
          <View style={styles.divider} />

          {/* SECTION 3: PROMO CARD SLIDER */}
          <View style={{ marginTop: 20 }}>
            <Animated.ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: promoScrollX } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
              snapToInterval={SCREEN_WIDTH}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 0 }}
            >
              {PROMO_DATA.map((item) => (
                <View key={item.id} style={styles.promoSlide}>
                  <View style={styles.promoCard}>
                    <View style={styles.promoLeft}>
                      <Text style={styles.promoHeading}>{item.heading}</Text>
                      <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
                      <TouchableOpacity style={styles.pillButton}>
                        <Text style={styles.pillButtonText}>{item.btnLabel}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.promoRight}>
                      <Image 
                        source={{ uri: item.img1 }} 
                        style={[styles.overlapPhoto, styles.photo1]} 
                      />
                      <Image 
                        source={{ uri: item.img2 }} 
                        style={[styles.overlapPhoto, styles.photo2]} 
                      />
                    </View>
                  </View>
                </View>
              ))}
            </Animated.ScrollView>
            
            {/* Pagination Dots */}
            <View style={styles.paginationRow}>
              {PROMO_DATA.map((_, i) => {
                const width = promoScrollX.interpolate({
                  inputRange: [SCREEN_WIDTH * (i - 1), SCREEN_WIDTH * i, SCREEN_WIDTH * (i + 1)],
                  outputRange: [8, 20, 8],
                  extrapolate: 'clamp',
                });
                const opacity = promoScrollX.interpolate({
                  inputRange: [SCREEN_WIDTH * (i - 1), SCREEN_WIDTH * i, SCREEN_WIDTH * (i + 1)],
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: 'clamp',
                });
                return <Animated.View key={i} style={[styles.dot, { width, opacity }]} />;
              })}
            </View>
          </View>

          {/* SECTION 4: PERFECT FLAT BANNER */}
          <View style={[styles.promoCard, { marginTop: 14, marginHorizontal: 16 }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.horizontalOverlap}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=200' }} 
                  style={[styles.rectPhoto, { transform: [{ rotate: '-4deg' }] }]} 
                />
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200' }} 
                  style={[styles.rectPhoto, { transform: [{ rotate: '3deg' }], marginLeft: -20 }]} 
                />
              </View>
              <Text style={styles.promoHeading}>{"Looking for the\nperfect flat?"}</Text>
              <Text style={styles.promoSubtitle}>{"Share your requirement.\nWe'll handle the rest."}</Text>
              <TouchableOpacity style={styles.pillButton}>
                <Text style={styles.pillButtonText}>Share requirement</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SECTION 5: TRUST STATS */}
          <View style={styles.trustStatsContainer}>
            <View style={styles.verifiedBadge}>
              <Text style={{ fontSize: 24, color: '#FFF' }}>🏅</Text>
            </View>
            <Text style={styles.trustQuote}>
              {"Experience renting the way it should be —"}
              {"\n"}<Text style={{ fontWeight: '800', fontStyle: 'normal' }}>{"simple, secure and seamless!"}</Text>
            </Text>
            <View style={styles.trustShortLine} />
            
            <View style={styles.statsLayout}>
              <CountUpStat target={1200} label="Rental flats" />
              <View style={styles.statDivider} />
              <CountUpStat target={11500} label="Sharing flats" delay={200} />
              <View style={styles.statDivider} />
              <CountUpStat target={13000} label="Room-mates" delay={400} />
            </View>
          </View>

          {/* SECTION 6: FLATS NEAR YOU */}
          <View style={styles.listSection}>
            <SectionHeader title="Flats on rent near you" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <RoomCard 
                index={0}
                title="1 BHK Un-furnished" 
                location="Koregaon Park" 
                price="₹ 25000 /month" 
                img="https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=500" 
              />
              <RoomCard 
                index={1}
                title="1 BHK Fully-furnished" 
                location="Hadapsar" 
                price="₹ 21000 /month" 
                img="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500" 
              />
              <RoomCard 
                index={2}
                title="2 BHK Semi-furnished" 
                location="Baner" 
                price="₹ 18000 /month" 
                img="https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500" 
              />
            </ScrollView>
          </View>

          {/* SECTION 7: SHARING FLATS NEAR YOU */}
          <View style={styles.listSection}>
            <SectionHeader title="Sharing flats near you" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <RoomCard 
                index={0}
                title="Need 1 roommate" 
                location="Pune" 
                price="₹ 2500 /head" 
                img="https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500" 
              />
              <RoomCard 
                index={1}
                title="Need 1 roommate" 
                location="Ganga Dham" 
                price="₹ 7000 /head" 
                img="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500" 
              />
              <RoomCard 
                index={2}
                title="Need 2 roommates" 
                location="Kothrud" 
                price="₹ 4500 /head" 
                img="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500" 
              />
            </ScrollView>
          </View>

          {/* SECTION 8: PEOPLE LOOKING FOR FLAT */}
          <View style={[styles.listSection, { marginBottom: 100 }]}>
            <SectionHeader title="People looking for flat" showSeeAll={false} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <PersonCard 
                name="Sayan" 
                age={24} 
                gender="Male" 
                budget="₹8000/mo" 
                img="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" 
              />
              <PersonCard 
                name="Amit" 
                age={22} 
                gender="Male" 
                budget="₹12000/mo" 
                img="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200" 
              />
              <PersonCard 
                name="Rahul" 
                age={25} 
                gender="Male" 
                budget="₹6000/mo" 
                img="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200" 
              />
              <PersonCard 
                name="Vivek" 
                age={23} 
                gender="Male" 
                budget="₹9000/mo" 
                img="https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200" 
              />
            </ScrollView>
          </View>
        </View>
      </Animated.ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  // Section 1: Hero (Fixed Background)
  heroBlock: {
    height: 380,
    backgroundColor: TEAL,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  heroTealPart: {
    height: '55%',
    paddingTop: 56,
    alignItems: 'center',
    zIndex: 1,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroBadgeContent: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  heroHeading: {
    fontSize: 28,
    fontWeight: '900',
    color: WHITE,
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
    paddingHorizontal: 30,
    marginTop: 24,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  heroImgPart: {
    height: '45%',
    width: '100%',
  },

  // Section 2: Pull-up Card (Scrolling over Hero)
  pullUpCard: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -10 },
    elevation: 20,
    minHeight: Dimensions.get('window').height,
  },
  pullUpHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: BLACK,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    width: 130,
  },
  emojiContainer: {
    width: 64,
    height: 64,
    backgroundColor: GRAY_SOFT,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 13,
    color: '#555',
    marginTop: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 24,
    marginTop: 24,
  },

  // Promo Slide Layout
  promoSlide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 16,
  },
  promoCard: {
    borderRadius: 24,
    backgroundColor: WHITE,
    padding: 22,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    minHeight: 160,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  promoLeft: {
    flex: 1,
    zIndex: 1,
  },
  promoHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: BLACK,
    lineHeight: 28,
  },
  promoSubtitle: {
    fontSize: 13,
    color: TEXT_GRAY,
    marginTop: 10,
    lineHeight: 20,
    fontWeight: '500',
  },
  pillButton: {
    backgroundColor: BLACK,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  pillButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '800',
  },
  promoRight: {
    width: 100,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  overlapPhoto: {
    borderRadius: 12,
    position: 'absolute',
    borderWidth: 2,
    borderColor: WHITE,
  },
  photo1: {
    width: 80,
    height: 100,
    right: -10,
    bottom: 20,
    transform: [{ rotate: '-8deg' }],
  },
  photo2: {
    width: 70,
    height: 90,
    right: 15,
    bottom: -10,
    transform: [{ rotate: '6deg' }],
  },
  horizontalOverlap: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  rectPhoto: {
    width: 100,
    height: 75,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: WHITE,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: TEAL,
  },

  // Trust Stats
  trustStatsContainer: {
    marginTop: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  verifiedBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BLACK,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  trustQuote: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  trustShortLine: {
    width: 50,
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginVertical: 24,
  },
  statsLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: BLACK,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F3F4F6',
    alignSelf: 'center',
  },

  // List Sections
  listSection: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: BLACK,
  },
  seeAllText: {
    fontSize: 13,
    color: TEAL,
    fontWeight: '700',
  },
  roomCard: {
    width: 165,
    marginRight: 16,
  },
  roomImg: {
    width: 165,
    height: 130,
    borderRadius: 20,
    backgroundColor: GRAY_SOFT,
  },
  roomTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: BLACK,
    marginTop: 12,
  },
  roomLocation: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontWeight: '500',
  },
  roomPrice: {
    fontSize: 13,
    color: TEAL,
    fontWeight: '800',
    marginTop: 4,
  },

  // Person Cards
  personCard: {
    width: 130,
    marginRight: 16,
    alignItems: 'center',
    paddingVertical: 10,
  },
  profilePhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: TEAL,
    backgroundColor: GRAY_SOFT,
  },
  personName: {
    fontSize: 13,
    fontWeight: '800',
    color: BLACK,
    marginTop: 10,
    textAlign: 'center',
  },
  personDetails: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
  },
  budgetPill: {
    backgroundColor: '#F0F9FA',
    borderRadius: 20,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  budgetText: {
    color: TEAL,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default HomeScreen;
