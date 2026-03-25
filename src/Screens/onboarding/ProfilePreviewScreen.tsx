/**
 * ProfilePreviewScreen — Step 4 of 4
 * Shows a summary of the user's profile before submission.
 * On "Let's Go!" → calls step1 + step2 APIs → dispatches setOnboardingComplete
 * → RootNavigator auto-redirects to Main.
 */
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { OnboardingStackParamList } from '../../navigation/types';
import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { Button } from '../../Components/Button';
import { UserService } from '../../services/user.service';
import { useAppDispatch } from '../../hooks/useRedux';
import { updateUser, setOnboardingComplete } from '../../Redux/Slices/authSlice';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ProfilePreview'>;

const USER_TYPE_LABELS = {
  seeker: { emoji: '🔍', label: 'Looking for a flat/PG' },
  'flat-owner': { emoji: '🏠', label: 'Flat / Room Owner' },
  'pg-owner': { emoji: '🏢', label: 'PG / Hostel Owner' },
};

const ProfilePreviewScreen = ({ navigation, route }: Props) => {
  const { name, userType, gender, city, profileImage, lifestyleTags } = route.params;
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
  const cardAnim = useRef(new Animated.Value(0.94)).current;
  const progressAnim = useRef(new Animated.Value(3 / 4)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 65, useNativeDriver: true }),
      Animated.spring(cardAnim, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Checkmark pop-in after card settles
      Animated.spring(checkAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
    });
  }, []);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      // Call step1: name + userType + gender + city + profileImage
      await UserService.updateOnboardingStep1({
        name,
        userType,
        gender,
        city,
        profileImage,
      });
      // Call step2: lifestyleTags → sets onboardingComplete:true on server
      const updatedUser = await UserService.updateOnboardingStep2({ lifestyleTags });
      // Sync Redux
      dispatch(updateUser(updatedUser));
      dispatch(setOnboardingComplete());
      // RootNavigator auto-switches to Main
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      Alert.alert('Oops', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const typeInfo = USER_TYPE_LABELS[userType];
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* ── Progress bar (full) ──────────────────────── */}
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
            disabled={isLoading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="chevron-back" size={22} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.stepLabel}>STEP 4 OF 4</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* ── Heading ──────────────────────────────── */}
        <Text style={styles.title}>Looking good,{'\n'}{name.split(' ')[0]}! 🎉</Text>
        <Text style={styles.subtitle}>Review your profile before we get started</Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Profile card ─────────────────────── */}
          <Animated.View
            style={[styles.card, { transform: [{ scale: cardAnim }] }]}
          >
            {/* Header gradient */}
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardHeader}
            >
              {/* Check badge */}
              <Animated.View
                style={[
                  styles.checkBadge,
                  { transform: [{ scale: checkAnim }] },
                ]}
              >
                <Icon name="checkmark" size={14} color={colors.white} />
              </Animated.View>

              {/* Avatar */}
              <View style={styles.avatarContainer}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.avatarImg}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.cardName}>{name}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.cardMetaText}>
                  {typeInfo.emoji} {typeInfo.label}
                </Text>
                <View style={styles.metaDot} />
                <Text style={styles.cardMetaText}>
                  {gender === 'male' ? '👨 Male' : '👩 Female'}
                </Text>
                <View style={styles.metaDot} />
                <Text style={styles.cardMetaText}>📍 {city}</Text>
              </View>
            </LinearGradient>

            {/* Lifestyle tags */}
            <View style={styles.cardBody}>
              <Text style={styles.tagsHeading}>Lifestyle</Text>
              <View style={styles.tagsRow}>
                {lifestyleTags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>{tag.replace(/-/g, ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* ── Edit hint ────────────────────────────── */}
          <TouchableOpacity
            style={styles.editHint}
            onPress={() => navigation.navigate('OnboardingWho')}
            disabled={isLoading}
          >
            <Icon name="pencil-outline" size={14} color={colors.muted} />
            <Text style={styles.editHintText}>Something wrong? Go back and edit</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── CTA ──────────────────────────────────── */}
        <Button
          label="Let's Go!"
          onPress={handleSubmit}
          loading={isLoading}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default ProfilePreviewScreen;

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

  title: { ...textPresets.h2, color: colors.dark, marginBottom: spacing[2] },
  subtitle: { ...textPresets.body, color: colors.muted, marginBottom: spacing[6], lineHeight: 22 },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing[4] },

  // ── Profile card ──────────────────────────
  card: {
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    backgroundColor: colors.surfaceCard,
    ...shadows.lg,
  },
  cardHeader: {
    alignItems: 'center',
    paddingTop: spacing[8],
    paddingBottom: spacing[6],
    paddingHorizontal: spacing[6],
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarContainer: {
    width: 84,
    height: 84,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
    marginBottom: spacing[3],
    ...shadows.lg,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarFallback: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -1,
  },
  cardName: {
    ...textPresets.h4,
    color: colors.white,
    marginBottom: spacing[2],
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[2],
  },
  cardMetaText: {
    ...textPresets.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  cardBody: {
    padding: spacing[5],
  },
  tagsHeading: {
    ...textPresets.labelSm,
    color: colors.muted,
    marginBottom: spacing[3],
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  tagChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: 'rgba(255, 19, 81, 0.15)',
  },
  tagChipText: {
    ...textPresets.caption,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Edit hint
  editHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1.5],
    marginTop: spacing[4],
    paddingVertical: spacing[2],
  },
  editHintText: {
    ...textPresets.caption,
    color: colors.muted,
  },
});
