/**
 * PreferencesScreen — User search preferences
 *
 * Sections:
 *  • Looking For    — room / flatmate / pg (toggle chips)
 *  • Budget Range   — min / max text inputs
 *  • Preferred Location — text input
 *  • Lifestyle      — smoking / drinking / pets / sleep-schedule toggles
 *  • Roommate Prefs — age range, gender preference
 *
 * Saves via UserService.updatePreferences → dispatches updateUser
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { updateUser } from '../../Redux/Slices/authSlice';
import { UserService } from '../../services/user.service';
import { ProfileStackParamList } from '../../navigation/types';
import { User } from '../../Redux/Slices/authSlice';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Preferences'>;

type LookingFor = 'room' | 'flatmate' | 'pg';
type SleepSchedule = 'early_bird' | 'night_owl' | 'flexible';
type GenderPref = 'any' | 'male' | 'female';

const LOOKING_FOR_OPTIONS: { value: LookingFor; label: string; icon: string }[] = [
  { value: 'room',     label: 'A Room',    icon: 'home-outline' },
  { value: 'flatmate', label: 'Flatmate',  icon: 'person-outline' },
  { value: 'pg',       label: 'A PG',      icon: 'business-outline' },
];

const SLEEP_OPTIONS: { value: SleepSchedule; label: string; emoji: string }[] = [
  { value: 'early_bird', label: 'Early Bird', emoji: '🌅' },
  { value: 'flexible',   label: 'Flexible',   emoji: '😴' },
  { value: 'night_owl',  label: 'Night Owl',  emoji: '🦉' },
];

const GENDER_PREFS: { value: GenderPref; label: string }[] = [
  { value: 'any',    label: 'Any' },
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
];

// ── Screen ─────────────────────────────────────────────────────────────────────

const PreferencesScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const user     = useAppSelector(s => s.auth.user);
  const prefs    = user?.preferences;

  const [saving, setSaving] = useState(false);

  // ── State ─────────────────────────────────────────────────────────────────
  const [lookingFor,   setLookingFor]   = useState<LookingFor | undefined>(
    prefs?.lookingFor as LookingFor | undefined,
  );
  const [budgetMin,    setBudgetMin]    = useState(prefs?.budgetMin?.toString() ?? '');
  const [budgetMax,    setBudgetMax]    = useState(prefs?.budgetMax?.toString() ?? '');
  const [location,     setLocation]     = useState(prefs?.preferredLocation ?? '');
  const [smoking,      setSmoking]      = useState(prefs?.lifestyle?.smoking ?? false);
  const [drinking,     setDrinking]     = useState(prefs?.lifestyle?.drinking ?? false);
  const [pets,         setPets]         = useState(prefs?.lifestyle?.pets ?? false);
  const [sleepSched,   setSleepSched]   = useState<SleepSchedule>(
    (prefs?.lifestyle?.sleepSchedule as SleepSchedule) ?? 'flexible',
  );
  const [ageMin,       setAgeMin]       = useState(prefs?.roommatePreferences?.ageMin?.toString() ?? '');
  const [ageMax,       setAgeMax]       = useState(prefs?.roommatePreferences?.ageMax?.toString() ?? '');
  const [genderPref,   setGenderPref]   = useState<GenderPref>(
    (prefs?.roommatePreferences?.gender as GenderPref) ?? 'any',
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload: User['preferences'] = {
        lookingFor: lookingFor as 'room' | 'flatmate' | 'pg' | undefined,
        budgetMin: budgetMin ? parseInt(budgetMin, 10) : undefined,
        budgetMax: budgetMax ? parseInt(budgetMax, 10) : undefined,
        preferredLocation: location.trim() || undefined,
        lifestyle: {
          smoking,
          drinking,
          pets,
          sleepSchedule: sleepSched,
        },
        roommatePreferences: {
          ageMin: ageMin ? parseInt(ageMin, 10) : undefined,
          ageMax: ageMax ? parseInt(ageMax, 10) : undefined,
          gender: genderPref === 'any' ? undefined : genderPref,
        },
      };
      const updated = await UserService.updatePreferences(payload);
      dispatch(updateUser(updated));
      Alert.alert('Saved', 'Your preferences have been updated.');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not save preferences.');
    } finally {
      setSaving(false);
    }
  }, [
    lookingFor, budgetMin, budgetMax, location,
    smoking, drinking, pets, sleepSched,
    ageMin, ageMax, genderPref, dispatch,
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="arrow-back" size={24} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Preferences</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color={colors.primary} size="small" />
              : <Text style={styles.saveBtn}>Save</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">

          {/* ── Looking For ── */}
          <SectionHeader title="Looking For" icon="search-outline" />
          <View style={styles.chipRow}>
            {LOOKING_FOR_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, lookingFor === opt.value && styles.chipActive]}
                onPress={() => setLookingFor(lookingFor === opt.value ? undefined : opt.value)}
                activeOpacity={0.8}>
                <Icon
                  name={opt.icon}
                  size={16}
                  color={lookingFor === opt.value ? colors.white : colors.muted}
                />
                <Text style={[styles.chipText, lookingFor === opt.value && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Budget ── */}
          <SectionHeader title="Budget Range (₹/mo)" icon="cash-outline" />
          <View style={styles.budgetRow}>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <TextInput
                style={styles.input}
                value={budgetMin}
                onChangeText={setBudgetMin}
                placeholder="Min"
                placeholderTextColor={colors.subtle}
                keyboardType="number-pad"
              />
            </View>
            <Text style={styles.budgetDash}>–</Text>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <TextInput
                style={styles.input}
                value={budgetMax}
                onChangeText={setBudgetMax}
                placeholder="Max"
                placeholderTextColor={colors.subtle}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* ── Preferred Location ── */}
          <SectionHeader title="Preferred Location" icon="location-outline" />
          <View style={styles.inputWrap}>
            <Icon name="location-outline" size={16} color={colors.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Koramangala, Bangalore"
              placeholderTextColor={colors.subtle}
            />
          </View>

          {/* ── Lifestyle ── */}
          <SectionHeader title="My Lifestyle" icon="leaf-outline" />
          <View style={styles.card}>
            <ToggleRow
              label="I smoke"
              icon="flame-outline"
              value={smoking}
              onToggle={setSmoking}
            />
            <View style={styles.rowDivider} />
            <ToggleRow
              label="I drink"
              icon="wine-outline"
              value={drinking}
              onToggle={setDrinking}
            />
            <View style={styles.rowDivider} />
            <ToggleRow
              label="I have pets"
              icon="paw-outline"
              value={pets}
              onToggle={setPets}
            />
          </View>

          <Text style={styles.subSectionLabel}>Sleep Schedule</Text>
          <View style={styles.chipRow}>
            {SLEEP_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, sleepSched === opt.value && styles.chipActive]}
                onPress={() => setSleepSched(opt.value)}
                activeOpacity={0.8}>
                <Text style={styles.chipEmoji}>{opt.emoji}</Text>
                <Text style={[styles.chipText, sleepSched === opt.value && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Roommate Prefs ── */}
          <SectionHeader title="Roommate Preferences" icon="people-outline" />

          <Text style={styles.subSectionLabel}>Age Range</Text>
          <View style={styles.budgetRow}>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <TextInput
                style={styles.input}
                value={ageMin}
                onChangeText={setAgeMin}
                placeholder="Min age"
                placeholderTextColor={colors.subtle}
                keyboardType="number-pad"
              />
            </View>
            <Text style={styles.budgetDash}>–</Text>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <TextInput
                style={styles.input}
                value={ageMax}
                onChangeText={setAgeMax}
                placeholder="Max age"
                placeholderTextColor={colors.subtle}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <Text style={styles.subSectionLabel}>Gender</Text>
          <View style={styles.chipRow}>
            {GENDER_PREFS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, genderPref === opt.value && styles.chipActive]}
                onPress={() => setGenderPref(opt.value)}
                activeOpacity={0.8}>
                <Text style={[styles.chipText, genderPref === opt.value && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={styles.saveFullBtn}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}>
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveFullGrad}>
              {saving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Icon name="checkmark-circle-outline" size={18} color={colors.white} />
                  <Text style={styles.saveFullText}>Save Preferences</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: spacing[10] }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PreferencesScreen;

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIconWrap}>
      <Icon name={icon} size={14} color={colors.primary} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const ToggleRow = ({
  label,
  icon,
  value,
  onToggle,
}: {
  label: string;
  icon: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) => (
  <View style={styles.toggleRow}>
    <Icon name={icon} size={18} color={colors.muted} />
    <Text style={styles.toggleLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: colors.gray200, true: colors.primaryLight }}
      thumbColor={value ? colors.primary : colors.white}
      ios_backgroundColor={colors.gray200}
    />
  </View>
);

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...textPresets.h5, color: colors.dark },
  saveBtn: { ...textPresets.button, color: colors.primary },

  scroll: { padding: layout.screenPaddingH },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[6],
    marginBottom: spacing[3],
  },
  sectionIconWrap: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { ...textPresets.labelSm, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1 },
  subSectionLabel: { ...textPresets.caption, color: colors.muted, marginBottom: spacing[2], marginTop: spacing[4] },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2.5],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: { ...textPresets.labelSm, color: colors.muted },
  chipTextActive: { color: colors.white },
  chipEmoji: { fontSize: 14 },

  // Budget row
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  budgetDash: { ...textPresets.h5, color: colors.muted },

  // Inputs
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[4],
    minHeight: 48,
  },
  inputIcon: { marginRight: spacing[2] },
  input: {
    flex: 1,
    ...textPresets.body,
    color: colors.dark,
    paddingVertical: spacing[3],
  },

  // Toggle card
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3.5],
  },
  toggleLabel: { ...textPresets.label, color: colors.dark, flex: 1 },
  rowDivider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: spacing[5] },

  // Save button
  saveFullBtn: { marginTop: spacing[8], borderRadius: radius.xl, overflow: 'hidden', ...shadows.primarySm },
  saveFullGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
  },
  saveFullText: { ...textPresets.button, color: colors.white },
});
