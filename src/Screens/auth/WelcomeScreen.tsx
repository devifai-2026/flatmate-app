import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, textPresets, radius, shadows } from '../../theme';
import { Button } from '../../Components/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const WelcomeScreen = ({ navigation }: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true }),
    ]).start();

    // Floating blobs
    const loopFloat = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true, easing: (t) => t }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true, easing: (t) => t }),
        ]),
      ).start();

    loopFloat(float1, 4000);
    loopFloat(float2, 5500);
  }, []);

  const float1Y = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const float2Y = float2.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* ── Background decorative blobs ─────────────────── */}
      <Animated.View style={[styles.blob1, { transform: [{ translateY: float1Y }] }]}>
        <LinearGradient
          colors={['rgba(255,19,81,0.12)', 'transparent']}
          style={styles.blobGrad}
        />
      </Animated.View>
      <Animated.View style={[styles.blob2, { transform: [{ translateY: float2Y }] }]}>
        <LinearGradient
          colors={['rgba(255,77,122,0.08)', 'transparent']}
          style={styles.blobGrad}
        />
      </Animated.View>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* ── Hero ──────────────────────────────────────── */}
          <View style={styles.hero}>
            {/* Logo mark */}
            <View style={styles.logoWrap}>
              <LinearGradient
                colors={colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGrad}
              >
                <Text style={styles.logoLetter}>F</Text>
              </LinearGradient>
            </View>

            <Text style={styles.appName}>flatmate</Text>
            <Text style={styles.tagline}>Find your perfect flatmate{'\n'}in minutes, not months.</Text>

            {/* Trust strip */}
            <View style={styles.trustRow}>
              {['10k+ Users', '500+ Cities', 'AI Matching'].map((label) => (
                <View key={label} style={styles.trustChip}>
                  <Text style={styles.trustText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Bottom card ──────────────────────────────── */}
          <View style={styles.card}>
            <Button
              label="Get Started"
              onPress={() => navigation.navigate('Login')}
            />
            <Button
              label="I already have an account"
              variant="ghost"
              onPress={() => navigation.navigate('Login')}
              style={styles.ghostBtn}
            />
            <Text style={styles.terms}>
              By continuing you agree to our{' '}
              <Text style={styles.link}>Terms of Service</Text> &{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  safe: { flex: 1 },
  content: { flex: 1, justifyContent: 'space-between' },

  // Blobs
  blob1: {
    position: 'absolute',
    top: -60,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: 'hidden',
  },
  blob2: {
    position: 'absolute',
    bottom: 120,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  blobGrad: { flex: 1 },

  // Hero
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[10],
  },
  logoWrap: {
    marginBottom: spacing[5],
    ...shadows.primaryMd,
  },
  logoGrad: {
    width: 72,
    height: 72,
    borderRadius: radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.white,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.dark,
    letterSpacing: -1.5,
    marginBottom: spacing[4],
  },
  tagline: {
    ...textPresets.bodyLg,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing[8],
  },
  trustRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  trustChip: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.xs,
  },
  trustText: {
    ...textPresets.labelSm,
    color: colors.dark,
  },

  // Bottom card
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[4],
    ...shadows.lg,
  },
  ghostBtn: {
    marginTop: spacing[3],
  },
  terms: {
    ...textPresets.caption,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing[5],
    lineHeight: 16,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
});
