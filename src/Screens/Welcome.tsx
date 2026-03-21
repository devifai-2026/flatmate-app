import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  PhoneLoginScreen: undefined;
  [key: string]: any;
};

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

// ─── Token System ──────────────────────────────────────────────────────────────
const COLORS = {
  teal: '#00B4C6',
  tealDeep: '#007A87',
  tealGlow: 'rgba(0,180,198,0.22)',
  tealBorder: 'rgba(0,180,198,0.35)',
  white: '#FFFFFF',
  offWhite: 'rgba(255,255,255,0.92)',
  muted: 'rgba(255,255,255,0.48)',
  glass: 'rgba(255,255,255,0.07)',
  glassBorder: 'rgba(255,255,255,0.14)',
  dark: '#050A0B',
};

// ─── Animated Button ───────────────────────────────────────────────────────────
interface ButtonProps {
  title: string;
  iconName: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  delay?: number;
}

const AnimatedButton: React.FC<ButtonProps> = ({
  title,
  iconName,
  onPress,
  variant = 'ghost',
  delay = 0,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.965, useNativeDriver: true, speed: 30 }),
      Animated.timing(glowAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 10 }),
      Animated.timing(glowAnim, { toValue: 0, duration: 250, useNativeDriver: false }),
    ]).start();
  };

  const isPrimary = variant === 'primary';

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isPrimary ? COLORS.teal : COLORS.glassBorder,
      'rgba(0,180,198,0.85)',
    ],
  });

  return (
    <Animated.View
      style={{
        opacity: opacAnim,
        transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
        width: '100%',
      }}
    >
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
        <Animated.View
          style={[
            styles.button,
            isPrimary ? styles.primaryButton : styles.ghostButton,
            { borderColor },
          ]}
        >
          {isPrimary && (
            <LinearGradient
              colors={[COLORS.teal, COLORS.tealDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
              borderRadius={16}
            />
          )}

          {/* Icon pill */}
          <View style={[styles.iconPill, isPrimary ? styles.iconPillPrimary : styles.iconPillGhost]}>
            <Icon
              name={iconName}
              size={15}
              color={isPrimary ? COLORS.tealDeep : COLORS.teal}
              solid
            />
          </View>

          <Text style={[styles.buttonText, isPrimary ? styles.primaryText : styles.ghostText]}>
            {title}
          </Text>

          {/* Trailing chevron */}
          <Icon
            name="chevron-right"
            size={12}
            color={isPrimary ? 'rgba(255,255,255,0.55)' : 'rgba(0,180,198,0.5)'}
            solid
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ─── Decorative Ring ───────────────────────────────────────────────────────────
const PulseRing: React.FC<{ delay: number; size: number }> = ({ delay, size }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] });
  const opacity = anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.5, 0.25, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: COLORS.teal,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
const Welcome = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const masterFade = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const logoSlide = useRef(new Animated.Value(-20)).current;
  const tagSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Master fade
    Animated.timing(masterFade, { toValue: 1, duration: 1000, useNativeDriver: true }).start();

    // Logo slides down into view
    Animated.spring(logoSlide, { toValue: 0, delay: 300, speed: 8, bounciness: 6, useNativeDriver: true }).start();

    // Tagline slides up
    Animated.spring(tagSlide, { toValue: 0, delay: 500, speed: 8, bounciness: 4, useNativeDriver: true }).start();

    // Eternal float
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2800, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePhoneLogin = () => navigation.navigate('PhoneLoginScreen');
  const handleComingSoon = () => Alert.alert('Coming soon', 'This feature is not available yet.');

  return (
    <View style={styles.root}>
      {/* ── Video Background ── */}
      <Video
        source={{ uri: 'https://res.cloudinary.com/dk8xgexic/video/upload/welcome_ajlivh.mp4' }}
        style={StyleSheet.absoluteFill}
        muted repeat
        resizeMode="cover"
        rate={1.0}
        ignoreSilentSwitch="obey"
      />

      {/* ── Layered Overlays ── */}
      {/* Deep teal vignette at top */}
      <LinearGradient
        colors={['rgba(0,15,18,0.72)', 'transparent']}
        style={[StyleSheet.absoluteFill, { height: height * 0.55 }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {/* Rich cinematic gradient from bottom */}
      <LinearGradient
        colors={['rgba(2,8,10,0.98)', 'rgba(2,12,16,0.94)', 'rgba(0,30,36,0.55)', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0.25 }}
      />
      {/* Subtle teal side glow */}
      <LinearGradient
        colors={['rgba(0,180,198,0.06)', 'transparent', 'rgba(0,180,198,0.06)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: masterFade }]}>

          {/* ── HERO SECTION ── */}
          <View style={styles.heroSection}>
            {/* Pulse rings */}
            <View style={styles.pulseContainer}>
              <PulseRing size={120} delay={0} />
              <PulseRing size={160} delay={1000} />
              <PulseRing size={200} delay={2000} />

              {/* Logo orb */}
              <Animated.View
                style={[styles.logoOrb, { transform: [{ translateY: floatAnim }, { translateY: logoSlide }] }]}
              >
                <LinearGradient
                  colors={[COLORS.teal, COLORS.tealDeep]}
                  start={{ x: 0.1, y: 0.1 }}
                  end={{ x: 0.9, y: 0.9 }}
                  style={styles.logoGradient}
                >
                  <Icon name="house-chimney-user" size={28} color="#fff" solid />
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Brand text */}
            <Animated.View style={{ transform: [{ translateY: logoSlide }], alignItems: 'center' }}>
              {/* Eyebrow label */}
              <View style={styles.eyebrowPill}>
                <View style={styles.eyebrowDot} />
                <Text style={styles.eyebrowText}>ROOMMATE FINDER</Text>
              </View>

              <Text style={styles.brandTitle}>Meetmate</Text>

              <Animated.Text
                style={[styles.tagline, { transform: [{ translateY: tagSlide }] }]}
              >
                Find your ideal roomie{'\n'}with complete privacy
              </Animated.Text>
            </Animated.View>
          </View>

          {/* ── AUTH SECTION ── */}
          <View style={styles.authSection}>
            {/* Divider with "sign in with" */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>get started</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Glass card */}
            <View style={styles.glassCard}>
              <AnimatedButton
                title="Continue with Phone"
                iconName="phone"
                onPress={handlePhoneLogin}
                variant="primary"
                delay={600}
              />
              <AnimatedButton
                title="Continue with Google"
                iconName="google"
                onPress={handleComingSoon}
                delay={720}
              />
              <AnimatedButton
                title="Continue with Facebook"
                iconName="facebook"
                onPress={handleComingSoon}
                delay={840}
              />
              <AnimatedButton
                title="Continue with Email"
                iconName="envelope"
                onPress={handleComingSoon}
                delay={960}
              />
            </View>

            {/* Terms */}
            <Text style={styles.terms}>
              By continuing you agree to our{' '}
              <Text style={styles.termsLink}>Terms</Text>
              {' & '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: height * 0.07,
    paddingBottom: 28,
  },

  // ── Hero ──
  heroSection: {
    alignItems: 'center',
    gap: 20,
  },
  pulseContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoOrb: {
    width: 72,
    height: 72,
    borderRadius: 22,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 14,
  },
  logoGradient: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.tealGlow,
    borderWidth: 1,
    borderColor: COLORS.tealBorder,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
    marginBottom: 10,
  },
  eyebrowDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.teal,
  },
  eyebrowText: {
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  brandTitle: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1.5,
    lineHeight: 56,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 10,
    letterSpacing: 0.2,
  },

  // ── Auth ──
  authSection: {
    width: '100%',
    gap: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  glassCard: {
    width: '100%',
    backgroundColor: COLORS.glass,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: 16,
    gap: 10,
    // iOS inner glow effect via shadow
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },

  // ── Button ──
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  primaryButton: {
    borderColor: COLORS.teal,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  ghostButton: {
    backgroundColor: 'rgba(255,255,255,0.055)',
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconPillPrimary: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  iconPillGhost: {
    backgroundColor: COLORS.tealGlow,
    borderWidth: 1,
    borderColor: COLORS.tealBorder,
  },
  buttonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  primaryText: {
    color: COLORS.white,
  },
  ghostText: {
    color: COLORS.offWhite,
  },

  // ── Terms ──
  terms: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.28)',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.teal,
    fontWeight: '600',
  },
});

export default Welcome;