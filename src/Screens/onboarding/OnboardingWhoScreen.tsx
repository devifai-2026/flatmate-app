/**
 * OnboardingWhoScreen — Step 1 of 4
 * Collects: full name + userType (seeker / flat-owner / pg-owner)
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { OnboardingStackParamList } from '../../navigation/types';
import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { Button } from '../../Components/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingWho'>;

const TOTAL_STEPS = 4;

const USER_TYPES = [
  {
    id: 'seeker' as const,
    emoji: '🔍',
    label: 'Looking for a flat / flatmate / PG',
    sublabel: 'Find your perfect living situation',
  },
  {
    id: 'flat-owner' as const,
    emoji: '🏠',
    label: 'I have a flat / room to rent',
    sublabel: 'List your space and find tenants',
  },
  {
    id: 'pg-owner' as const,
    emoji: '🏢',
    label: 'I own a PG / hostel',
    sublabel: 'Manage your PG and fill vacancies',
  },
];

const OnboardingWhoScreen = ({ navigation }: Props) => {
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'seeker' | 'flat-owner' | 'pg-owner' | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 70, useNativeDriver: true }),
      Animated.timing(progressAnim, {
        toValue: 1 / TOTAL_STEPS,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const canContinue = name.trim().length >= 2 && userType !== null;

  const handleContinue = () => {
    if (!canContinue || !userType) return;
    navigation.navigate('OnboardingProfile', {
      name: name.trim(),
      userType,
    });
  };

  const inputBorderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* ── Progress bar ─────────────────────────────── */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* ── Step label ───────────────────────────── */}
          <Text style={styles.stepLabel}>STEP 1 OF 4</Text>

          {/* ── Heading ──────────────────────────────── */}
          <Text style={styles.title}>Tell us about{'\n'}yourself</Text>
          <Text style={styles.subtitle}>
            This helps us personalise your experience
          </Text>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Name input ───────────────────────── */}
            <Text style={styles.fieldLabel}>Your full name</Text>
            <Animated.View
              style={[styles.inputWrap, { borderColor: inputBorderColor }]}
            >
              <Icon
                name="person-outline"
                size={18}
                color={isFocused ? colors.primary : colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={colors.subtle}
                value={name}
                onChangeText={setName}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCapitalize="words"
                returnKeyType="done"
                maxLength={60}
              />
              {name.length >= 2 && (
                <Icon name="checkmark-circle" size={18} color={colors.success} />
              )}
            </Animated.View>

            {/* ── User type cards ───────────────────── */}
            <Text style={[styles.fieldLabel, { marginTop: spacing[6] }]}>
              I am a…
            </Text>
            <View style={styles.typeList}>
              {USER_TYPES.map((t) => {
                const selected = userType === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    activeOpacity={0.75}
                    onPress={() => setUserType(t.id)}
                    style={[
                      styles.typeCard,
                      selected && styles.typeCardSelected,
                    ]}
                  >
                    <Text style={styles.typeEmoji}>{t.emoji}</Text>
                    <View style={styles.typeTextWrap}>
                      <Text
                        style={[
                          styles.typeLabel,
                          selected && styles.typeLabelSelected,
                        ]}
                      >
                        {t.label}
                      </Text>
                      <Text style={styles.typeSub}>{t.sublabel}</Text>
                    </View>
                    <View
                      style={[
                        styles.radioOuter,
                        selected && styles.radioOuterSelected,
                      ]}
                    >
                      {selected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* ── CTA ──────────────────────────────────── */}
          <Button
            label="Continue"
            onPress={handleContinue}
            disabled={!canContinue}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OnboardingWhoScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },

  progressTrack: {
    height: 3,
    backgroundColor: colors.gray200,
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },

  container: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[6],
    paddingBottom: spacing[6],
  },

  stepLabel: {
    ...textPresets.overline,
    color: colors.primary,
    marginBottom: spacing[3],
  },
  title: {
    ...textPresets.h2,
    color: colors.dark,
    marginBottom: spacing[2],
  },
  subtitle: {
    ...textPresets.body,
    color: colors.muted,
    marginBottom: spacing[6],
    lineHeight: 22,
  },

  scrollArea: { flex: 1 },
  scrollContent: { paddingBottom: spacing[4] },

  fieldLabel: {
    ...textPresets.labelSm,
    color: colors.muted,
    marginBottom: spacing[2],
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
    ...shadows.xs,
  },
  inputIcon: { flexShrink: 0 },
  input: {
    flex: 1,
    ...textPresets.labelLg,
    color: colors.dark,
    paddingVertical: 0,
  },

  typeList: { gap: spacing[3] },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.xs,
  },
  typeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
    ...shadows.primarySm,
  },
  typeEmoji: { fontSize: 26 },
  typeTextWrap: { flex: 1 },
  typeLabel: {
    ...textPresets.label,
    color: colors.dark,
    marginBottom: 2,
  },
  typeLabelSelected: { color: colors.primary, fontWeight: '700' },
  typeSub: {
    ...textPresets.caption,
    color: colors.muted,
    lineHeight: 15,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: colors.primary },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});
