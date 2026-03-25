/**
 * OnboardingLifestyleScreen — Step 3 of 4
 * Collects: lifestyleTags (pick at least 5 from 16 options)
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { OnboardingStackParamList } from '../../navigation/types';
import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { Button } from '../../Components/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingLifestyle'>;

const TOTAL_STEPS = 4;
const MIN_TAGS = 5;

const LIFESTYLE_TAGS = [
  { id: 'night-owl', label: 'Night Owl', emoji: '🦉' },
  { id: 'early-bird', label: 'Early Bird', emoji: '🐦' },
  { id: 'studious', label: 'Studious', emoji: '📚' },
  { id: 'fitness-freak', label: 'Fitness Freak', emoji: '🏋️' },
  { id: 'sporty', label: 'Sporty', emoji: '⚽' },
  { id: 'wanderer', label: 'Wanderer', emoji: '🚐' },
  { id: 'party-lover', label: 'Party Lover', emoji: '🎉' },
  { id: 'pet-lover', label: 'Pet Lover', emoji: '🐾' },
  { id: 'vegan', label: 'Vegan', emoji: '🌿' },
  { id: 'non-alcoholic', label: 'Non Alcoholic', emoji: '🚫' },
  { id: 'music-lover', label: 'Music Lover', emoji: '🎸' },
  { id: 'non-smoker', label: 'Non Smoker', emoji: '🚭' },
  { id: 'foodie', label: 'Foodie', emoji: '🍕' },
  { id: 'gamer', label: 'Gamer', emoji: '🎮' },
  { id: 'workaholic', label: 'Workaholic', emoji: '💻' },
  { id: 'spiritual', label: 'Spiritual', emoji: '🧘' },
];

const OnboardingLifestyleScreen = ({ navigation, route }: Props) => {
  const { name, userType, gender, city, profileImage } = route.params;

  const [selected, setSelected] = useState<string[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const progressAnim = useRef(new Animated.Value(2 / TOTAL_STEPS)).current;
  const counterAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 80, useNativeDriver: true }),
      Animated.timing(progressAnim, {
        toValue: 3 / TOTAL_STEPS,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const toggleTag = (id: string) => {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id];
      Animated.sequence([
        Animated.timing(counterAnim, { toValue: 1.25, duration: 120, useNativeDriver: true }),
        Animated.spring(counterAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start();
      return next;
    });
  };

  const canContinue = selected.length >= MIN_TAGS;

  const handleContinue = () => {
    if (!canContinue) return;
    navigation.navigate('ProfilePreview', {
      name,
      userType,
      gender,
      city,
      profileImage,
      lifestyleTags: selected,
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const counterBg = canContinue ? colors.primary : colors.gray200;
  const counterColor = canContinue ? colors.white : colors.muted;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* ── Progress bar ─────────────────────────────── */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* ── Top bar ──────────────────────────────── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="chevron-back" size={22} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.stepLabel}>STEP 3 OF 4</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* ── Heading + counter ────────────────────── */}
        <View style={styles.headingRow}>
          <View style={styles.headingText}>
            <Text style={styles.title}>Your lifestyle</Text>
            <Text style={styles.subtitle}>Pick at least 5 that describe you</Text>
          </View>
          <Animated.View
            style={[
              styles.counter,
              { backgroundColor: counterBg, transform: [{ scale: counterAnim }] },
            ]}
          >
            <Text style={[styles.counterText, { color: counterColor }]}>
              {selected.length}
              <Text style={[styles.counterMin, { color: counterColor, opacity: 0.7 }]}>
                /{MIN_TAGS}
              </Text>
            </Text>
            {canContinue && (
              <Icon name="checkmark" size={13} color={colors.white} />
            )}
          </Animated.View>
        </View>

        {/* ── Tag grid ─────────────────────────────── */}
        <ScrollView
          style={styles.grid}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tagsWrap}>
            {LIFESTYLE_TAGS.map((tag) => {
              const on = selected.includes(tag.id);
              return (
                <TouchableOpacity
                  key={tag.id}
                  activeOpacity={0.75}
                  onPress={() => toggleTag(tag.id)}
                  style={[styles.tag, on && styles.tagSelected]}
                >
                  <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                  <Text style={[styles.tagLabel, on && styles.tagLabelSelected]}>
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* ── CTA ──────────────────────────────────── */}
        <Button
          label={canContinue ? 'Continue' : `Pick ${MIN_TAGS - selected.length} more`}
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default OnboardingLifestyleScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },

  progressTrack: { height: 3, backgroundColor: colors.gray200 },
  progressFill: { height: 3, backgroundColor: colors.primary, borderRadius: radius.full },

  container: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[5],
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: { ...textPresets.overline, color: colors.primary },

  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing[5],
    gap: spacing[3],
  },
  headingText: { flex: 1 },
  title: { ...textPresets.h3, color: colors.dark, marginBottom: spacing[1] },
  subtitle: { ...textPresets.bodySm, color: colors.muted, lineHeight: 19 },

  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    minWidth: 52,
    justifyContent: 'center',
  },
  counterText: { ...textPresets.labelSm, fontWeight: '800', letterSpacing: 0 },
  counterMin: { fontWeight: '500', fontSize: 11 },

  grid: { flex: 1 },
  gridContent: { paddingBottom: spacing[4] },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },

  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2.5],
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
    ...shadows.xs,
  },
  tagSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
    ...shadows.primarySm,
  },
  tagEmoji: { fontSize: 16 },
  tagLabel: { ...textPresets.labelSm, color: colors.muted, letterSpacing: 0 },
  tagLabelSelected: { color: colors.primary, fontWeight: '700' },
});
