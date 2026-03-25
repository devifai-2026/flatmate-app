/**
 * EditProfileScreen — Edit name, avatar, city, gender, lifestyle tags
 *
 * Uses the same onboarding endpoints:
 *   PUT /onboarding/step1  — name, gender, city, profileImage
 *   PUT /onboarding/step2  — lifestyleTags (min 5)
 * Dispatches updateUser on success.
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { updateUser } from '../../Redux/Slices/authSlice';
import { UserService } from '../../services/user.service';
import { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

// ── Static data ────────────────────────────────────────────────────────────

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/png?seed=Alex',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Jordan',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Taylor',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Morgan',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Casey',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Riley',
];

const CITIES = [
  'Mumbai','Delhi','Bangalore','Pune','Chennai',
  'Hyderabad','Kolkata','Ahmedabad','Jaipur','Surat',
];

const LIFESTYLE_TAGS = [
  { key: 'early_bird',     label: 'Early Bird',   emoji: '🌅' },
  { key: 'night_owl',      label: 'Night Owl',     emoji: '🦉' },
  { key: 'vegetarian',     label: 'Vegetarian',    emoji: '🥗' },
  { key: 'non_vegetarian', label: 'Non-Veg OK',    emoji: '🍖' },
  { key: 'no_smoking',     label: 'No Smoking',    emoji: '🚭' },
  { key: 'smoking_ok',     label: 'Smoking OK',    emoji: '🚬' },
  { key: 'no_drinking',    label: 'No Drinking',   emoji: '🚫' },
  { key: 'drinking_ok',    label: 'Drinking OK',   emoji: '🍺' },
  { key: 'fitness',        label: 'Fitness',       emoji: '💪' },
  { key: 'introvert',      label: 'Introvert',     emoji: '📚' },
  { key: 'extrovert',      label: 'Extrovert',     emoji: '🎉' },
  { key: 'work_from_home', label: 'WFH',           emoji: '💻' },
  { key: 'student',        label: 'Student',       emoji: '🎓' },
  { key: 'pets_ok',        label: 'Pets OK',       emoji: '🐾' },
  { key: 'no_pets',        label: 'No Pets',       emoji: '🙅' },
  { key: 'clean_freak',    label: 'Clean Freak',   emoji: '🧹' },
];

// ── Screen ────────────────────────────────────────────────────────────────────

const EditProfileScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);

  const [name,         setName]         = useState(user?.name ?? '');
  const [city,         setCity]         = useState(user?.city ?? '');
  const [gender,       setGender]       = useState<'male' | 'female'>(
    (user?.gender as 'male' | 'female') ?? 'male',
  );
  const [profileImage, setProfileImage] = useState(user?.profileImage ?? AVATARS[0]);
  const [tags,         setTags]         = useState<string[]>(user?.lifestyleTags ?? []);
  const [isSaving,     setIsSaving]     = useState(false);
  const [showCities,   setShowCities]   = useState(false);

  const toggleTag = useCallback((key: string) => {
    setTags(prev =>
      prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key],
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    if (tags.length < 5) {
      Alert.alert('Lifestyle tags', 'Please select at least 5 lifestyle tags.');
      return;
    }
    setIsSaving(true);
    try {
      const step1User = await UserService.updateOnboardingStep1({
        name:         name.trim(),
        userType:     user?.userType ?? 'seeker',
        gender,
        city:         city || (user?.city ?? ''),
        profileImage,
      });
      await UserService.updateOnboardingStep2({ lifestyleTags: tags });
      dispatch(updateUser({ ...step1User, lifestyleTags: tags }));
      navigation.goBack();
    } catch {
      Alert.alert('Save failed', 'Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  }, [name, city, gender, profileImage, tags, user, dispatch, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">

        {/* ── Avatar picker ── */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Avatar</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.avatarRow}>
            {AVATARS.map(uri => (
              <TouchableOpacity
                key={uri}
                onPress={() => setProfileImage(uri)}
                activeOpacity={0.8}>
                <Image
                  source={{ uri }}
                  style={[
                    styles.avatarOption,
                    profileImage === uri && styles.avatarSelected,
                  ]}
                />
                {profileImage === uri && (
                  <View style={styles.avatarCheck}>
                    <Icon name="checkmark" size={12} color={colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Name ── */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Name</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.muted}
              returnKeyType="done"
            />
          </View>
        </View>

        {/* ── Gender ── */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.toggleRow}>
            {(['male', 'female'] as const).map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.toggleBtn, gender === g && styles.toggleBtnActive]}
                onPress={() => setGender(g)}
                activeOpacity={0.8}>
                <Text style={[styles.toggleBtnText, gender === g && styles.toggleBtnTextActive]}>
                  {g === 'male' ? '♂ Male' : '♀ Female'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── City ── */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>City</Text>
          <TouchableOpacity
            style={styles.inputWrap}
            onPress={() => setShowCities(v => !v)}
            activeOpacity={0.9}>
            <Text style={[styles.input, !city && { color: colors.muted }]}>
              {city || 'Select city'}
            </Text>
            <Icon
              name={showCities ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.muted}
            />
          </TouchableOpacity>
          {showCities && (
            <View style={styles.cityDropdown}>
              {CITIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.cityOption, city === c && styles.cityOptionActive]}
                  onPress={() => { setCity(c); setShowCities(false); }}>
                  <Text style={[styles.cityOptionText, city === c && styles.cityOptionTextActive]}>
                    {c}
                  </Text>
                  {city === c && <Icon name="checkmark" size={14} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── Lifestyle tags ── */}
        <View style={styles.section}>
          <View style={styles.tagsHeader}>
            <Text style={styles.fieldLabel}>Lifestyle Tags</Text>
            <View style={[
              styles.tagCountBadge,
              tags.length >= 5 && styles.tagCountBadgeOk,
            ]}>
              <Text style={[
                styles.tagCountText,
                tags.length >= 5 && styles.tagCountTextOk,
              ]}>
                {tags.length}/5 min
              </Text>
            </View>
          </View>
          <View style={styles.tagsGrid}>
            {LIFESTYLE_TAGS.map(t => {
              const selected = tags.includes(t.key);
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.tagChip, selected && styles.tagChipActive]}
                  onPress={() => toggleTag(t.key)}
                  activeOpacity={0.8}>
                  <Text style={styles.tagEmoji}>{t.emoji}</Text>
                  <Text style={[styles.tagLabel, selected && styles.tagLabelActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingBottom: spacing[4] },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[3],
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: { padding: spacing[1], marginRight: spacing[2] },
  headerTitle: { ...textPresets.h5, color: colors.dark, flex: 1 },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    minWidth: 68,
    alignItems: 'center',
    ...shadows.primarySm,
  },
  saveBtnDisabled: { backgroundColor: colors.border, ...shadows.none },
  saveBtnText: { ...textPresets.buttonSm, color: colors.white },

  // Section / field
  section: { paddingHorizontal: layout.screenPaddingH, marginTop: spacing[6] },
  fieldLabel: {
    ...textPresets.labelSm,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[3],
  },

  // Avatar picker
  avatarRow: { gap: spacing[3], paddingBottom: spacing[1] },
  avatarOption: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarSelected: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  avatarCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Text input
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...shadows.xs,
  },
  input: {
    ...textPresets.body,
    color: colors.dark,
    flex: 1,
    padding: 0,
  },

  // Gender toggle
  toggleRow: { flexDirection: 'row', gap: spacing[3] },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
  },
  toggleBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  toggleBtnText: { ...textPresets.label, color: colors.muted },
  toggleBtnTextActive: { color: colors.primary },

  // City dropdown
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
  cityOptionActive: { backgroundColor: colors.primarySubtle },
  cityOptionText: { ...textPresets.body, color: colors.dark },
  cityOptionTextActive: { color: colors.primary, fontWeight: '600' },

  // Lifestyle tags
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  tagCountBadge: {
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[0.5],
  },
  tagCountBadgeOk: { backgroundColor: colors.successLight },
  tagCountText: { ...textPresets.caption, color: colors.muted },
  tagCountTextOk: { color: colors.success },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
  },
  tagChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  tagEmoji: { fontSize: 14 },
  tagLabel: { ...textPresets.bodySm, color: colors.muted },
  tagLabelActive: { color: colors.primary, fontWeight: '600' },
});
