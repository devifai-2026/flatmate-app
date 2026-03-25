/**
 * OnboardingProfileScreen — Step 2 of 4
 * Collects: gender + city + avatar (profileImage)
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { OnboardingStackParamList } from '../../navigation/types';
import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { Button } from '../../Components/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingProfile'>;

const TOTAL_STEPS = 4;

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune',
  'Kolkata', 'Chennai', 'Jaipur', 'Gurgaon', 'Noida',
];

// DiceBear PNG avatars (PNG works natively in React Native Image)
const AVATARS = [
  'https://api.dicebear.com/9.x/avataaars/png?seed=Aneka&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/avataaars/png?seed=Nala&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/avataaars/png?seed=Felix&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/avataaars/png?seed=Max&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/avataaars/png?seed=Abby&backgroundColor=d1f4d1',
  'https://api.dicebear.com/9.x/avataaars/png?seed=Tiger&backgroundColor=ffe0b2',
];

const OnboardingProfileScreen = ({ navigation, route }: Props) => {
  const { name, userType } = route.params;

  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [city, setCity] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [showCityList, setShowCityList] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const progressAnim = useRef(new Animated.Value(1 / TOTAL_STEPS)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 80, useNativeDriver: true }),
      Animated.timing(progressAnim, {
        toValue: 2 / TOTAL_STEPS,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const canContinue = gender !== null && city.length > 0;

  const handleContinue = () => {
    if (!canContinue || !gender) return;
    navigation.navigate('OnboardingLifestyle', {
      name,
      userType,
      gender,
      city,
      profileImage: avatar,
    });
  };

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
          <Text style={styles.stepLabel}>STEP 2 OF 4</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* ── Heading ──────────────────────────────── */}
        <Text style={styles.title}>Complete your{'\n'}profile</Text>
        <Text style={styles.subtitle}>A few more details to personalise your matches</Text>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Avatar picker ─────────────────────── */}
          <Text style={styles.fieldLabel}>Choose your avatar</Text>
          <View style={styles.avatarRow}>
            {AVATARS.map((url) => (
              <TouchableOpacity
                key={url}
                activeOpacity={0.8}
                onPress={() => setAvatar(url)}
                style={[
                  styles.avatarWrap,
                  avatar === url && styles.avatarWrapSelected,
                ]}
              >
                <Image
                  source={{ uri: url }}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
                {avatar === url && (
                  <View style={styles.avatarCheckBadge}>
                    <Icon name="checkmark" size={10} color={colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Gender ───────────────────────────── */}
          <Text style={[styles.fieldLabel, { marginTop: spacing[6] }]}>Gender</Text>
          <View style={styles.genderRow}>
            {(['male', 'female'] as const).map((g) => (
              <TouchableOpacity
                key={g}
                activeOpacity={0.75}
                onPress={() => setGender(g)}
                style={[
                  styles.genderBtn,
                  gender === g && styles.genderBtnSelected,
                ]}
              >
                <Text style={styles.genderEmoji}>
                  {g === 'male' ? '👨' : '👩'}
                </Text>
                <Text
                  style={[
                    styles.genderLabel,
                    gender === g && styles.genderLabelSelected,
                  ]}
                >
                  {g === 'male' ? 'Male' : 'Female'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── City picker ───────────────────────── */}
          <Text style={[styles.fieldLabel, { marginTop: spacing[6] }]}>Your city</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowCityList((s) => !s)}
            style={[
              styles.citySelector,
              city && styles.citySelectorFilled,
            ]}
          >
            <Icon
              name="location-outline"
              size={18}
              color={city ? colors.primary : colors.muted}
            />
            <Text
              style={[
                styles.citySelectorText,
                city && styles.citySelectorTextFilled,
              ]}
            >
              {city || 'Select your city'}
            </Text>
            <Icon
              name={showCityList ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.muted}
            />
          </TouchableOpacity>

          {showCityList && (
            <View style={styles.cityDropdown}>
              {CITIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  activeOpacity={0.7}
                  onPress={() => {
                    setCity(c);
                    setShowCityList(false);
                  }}
                  style={[
                    styles.cityOption,
                    city === c && styles.cityOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.cityOptionText,
                      city === c && styles.cityOptionTextSelected,
                    ]}
                  >
                    {c}
                  </Text>
                  {city === c && (
                    <Icon name="checkmark" size={14} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* ── CTA ──────────────────────────────────── */}
        <Button
          label="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default OnboardingProfileScreen;

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
    marginBottom: spacing[6],
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

  title: { ...textPresets.h2, color: colors.dark, marginBottom: spacing[2] },
  subtitle: { ...textPresets.body, color: colors.muted, marginBottom: spacing[6], lineHeight: 22 },

  scrollArea: { flex: 1 },
  scrollContent: { paddingBottom: spacing[4] },

  fieldLabel: { ...textPresets.labelSm, color: colors.muted, marginBottom: spacing[3] },

  // Avatar
  avatarRow: {
    flexDirection: 'row',
    gap: spacing[3],
    flexWrap: 'wrap',
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    borderWidth: 2.5,
    borderColor: 'transparent',
    overflow: 'visible',
    position: 'relative',
  },
  avatarWrapSelected: {
    borderColor: colors.primary,
    ...shadows.primarySm,
  },
  avatarImg: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.gray100,
  },
  avatarCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },

  // Gender
  genderRow: { flexDirection: 'row', gap: spacing[3] },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
    ...shadows.xs,
  },
  genderBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
    ...shadows.primarySm,
  },
  genderEmoji: { fontSize: 22 },
  genderLabel: { ...textPresets.label, color: colors.muted },
  genderLabelSelected: { color: colors.primary, fontWeight: '700' },

  // City
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    ...shadows.xs,
  },
  citySelectorFilled: { borderColor: colors.primary },
  citySelectorText: { flex: 1, ...textPresets.label, color: colors.subtle },
  citySelectorTextFilled: { color: colors.dark },
  cityDropdown: {
    marginTop: spacing[2],
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cityOptionSelected: { backgroundColor: colors.primarySubtle },
  cityOptionText: { ...textPresets.label, color: colors.dark },
  cityOptionTextSelected: { color: colors.primary, fontWeight: '600' },
});
