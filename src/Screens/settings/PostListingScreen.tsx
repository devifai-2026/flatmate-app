/**
 * PostListingScreen — Multi-step form to create a listing
 *
 * Step 1 — Choose type: Room | PG | Requirement (flatmate seeker)
 * Step 2 — Fill in type-specific fields
 *
 * Room fields:    title, rent, city, address, bedrooms, bathrooms, furnishing, amenities
 * PG fields:      name, rent, city, address, gender, totalRooms, amenities, meals
 * Requirement:    title, budget, city, gender, bio, lifestyle tags
 *
 * Calls POST /rooms | /pgs | /requirements on submit.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { apiClient } from '../../services/api.client';
import { Endpoints } from '../../services/api.endpoints';
import { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PostListing'>;

type ListingType = 'room' | 'pg' | 'requirement';

// ── Static options ─────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: ListingType; label: string; icon: string; desc: string }[] = [
  { value: 'room',        label: 'Room',            icon: 'home-outline',     desc: 'Rent out a room in your flat' },
  { value: 'pg',          label: 'PG / Hostel',     icon: 'business-outline', desc: 'List a paying-guest property' },
  { value: 'requirement', label: 'Looking For…',    icon: 'person-outline',   desc: 'Find a flatmate or room' },
];

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'];

const FURNISHING_OPTS = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

const AMENITIES_OPTS = [
  'WiFi', 'AC', 'Parking', 'Gym', 'Swimming Pool',
  'CCTV', 'Security', 'Power Backup', 'Laundry', 'Kitchen',
];

const LIFESTYLE_TAGS = [
  '🚭 Non-Smoker', '🍺 Drinker', '🐾 Pet-Friendly',
  '🌅 Early Bird', '🦉 Night Owl', '🏃 Fitness Freak',
  '🌱 Vegetarian', '🎮 Gamer', '🎵 Music Lover', '📚 Studious',
];

// ── Screen ─────────────────────────────────────────────────────────────────────

const PostListingScreen = ({ route, navigation }: Props) => {
  const initialType = route.params?.type;

  const [step, setStep]   = useState<1 | 2>(initialType ? 2 : 1);
  const [type, setType]   = useState<ListingType | undefined>(initialType);
  const [saving, setSaving] = useState(false);

  // ── Shared fields ─────────────────────────────────────────────────────────
  const [title,   setTitle]   = useState('');
  const [city,    setCity]    = useState('');
  const [address, setAddress] = useState('');
  const [rent,    setRent]    = useState('');

  // ── Room-specific ─────────────────────────────────────────────────────────
  const [bedrooms,    setBedrooms]    = useState('1');
  const [bathrooms,   setBathrooms]   = useState('1');
  const [furnishing,  setFurnishing]  = useState('');
  const [amenities,   setAmenities]   = useState<string[]>([]);

  // ── PG-specific ───────────────────────────────────────────────────────────
  const [pgGender,    setPgGender]    = useState<'male' | 'female' | 'co-ed'>('co-ed');
  const [totalRooms,  setTotalRooms]  = useState('');
  const [meals,       setMeals]       = useState(false);

  // ── Requirement-specific ──────────────────────────────────────────────────
  const [budgetMin,   setBudgetMin]   = useState('');
  const [budgetMax,   setBudgetMax]   = useState('');
  const [reqGender,   setReqGender]   = useState<'male' | 'female' | 'other'>('other');
  const [bio,         setBio]         = useState('');
  const [tags,        setTags]        = useState<string[]>([]);

  const toggleAmenity = useCallback((a: string) => {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }, []);

  const toggleTag = useCallback((t: string) => {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!type) { return; }
    if (!title.trim()) { Alert.alert('Required', 'Please enter a title.'); return; }
    if (!city) { Alert.alert('Required', 'Please select a city.'); return; }
    if (!rent && type !== 'requirement') { Alert.alert('Required', 'Please enter the rent amount.'); return; }

    setSaving(true);
    try {
      if (type === 'room') {
        const payload = {
          title: title.trim(),
          city,
          address: address.trim(),
          rent: parseInt(rent, 10),
          bedrooms: parseInt(bedrooms, 10),
          bathrooms: parseInt(bathrooms, 10),
          furnishing,
          amenities,
        };
        await apiClient.post(Endpoints.rooms.create, payload);
      } else if (type === 'pg') {
        const payload = {
          name: title.trim(),
          city,
          address: address.trim(),
          rent: parseInt(rent, 10),
          gender: pgGender,
          totalRooms: parseInt(totalRooms, 10) || undefined,
          amenities,
          meals,
        };
        await apiClient.post(Endpoints.pgs.create, payload);
      } else {
        const payload = {
          title: title.trim(),
          city,
          budgetMin: budgetMin ? parseInt(budgetMin, 10) : undefined,
          budgetMax: budgetMax ? parseInt(budgetMax, 10) : undefined,
          gender: reqGender,
          bio: bio.trim() || undefined,
          lifestyleTags: tags,
        };
        await apiClient.post(Endpoints.requirements.create, payload);
      }

      Alert.alert(
        'Posted!',
        'Your listing is live. Other users can now discover it.',
        [{ text: 'Done', onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not post listing. Try again.');
    } finally {
      setSaving(false);
    }
  }, [
    type, title, city, address, rent,
    bedrooms, bathrooms, furnishing, amenities,
    pgGender, totalRooms, meals,
    budgetMin, budgetMax, reqGender, bio, tags,
    navigation,
  ]);

  // ── Step 1 — type selection ────────────────────────────────────────────────

  const renderStep1 = () => (
    <View style={styles.typeGrid}>
      {TYPE_OPTIONS.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.typeCard, type === opt.value && styles.typeCardActive]}
          onPress={() => { setType(opt.value); setStep(2); }}
          activeOpacity={0.85}>

          <View style={[styles.typeIconWrap, type === opt.value && styles.typeIconWrapActive]}>
            <Icon name={opt.icon} size={28} color={type === opt.value ? colors.white : colors.primary} />
          </View>
          <Text style={[styles.typeLabel, type === opt.value && styles.typeLabelActive]}>
            {opt.label}
          </Text>
          <Text style={[styles.typeDesc, type === opt.value && styles.typeDescActive]}>
            {opt.desc}
          </Text>
          {type === opt.value && (
            <View style={styles.typeCheck}>
              <Icon name="checkmark-circle" size={18} color={colors.white} />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  // ── Step 2 — form fields ───────────────────────────────────────────────────

  const renderStep2 = () => (
    <>
      {/* Title */}
      <FormField label={type === 'pg' ? 'PG / Property Name *' : 'Listing Title *'} icon="create-outline">
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={type === 'room' ? 'e.g. Spacious room in Koramangala' : type === 'pg' ? 'e.g. Green PG for Girls' : 'e.g. Looking for flatmate in Bandra'}
          placeholderTextColor={colors.subtle}
          maxLength={80}
        />
      </FormField>

      {/* City */}
      <Text style={styles.fieldLabel}>City *</Text>
      <View style={styles.chipRow}>
        {CITIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, city === c && styles.chipActive]}
            onPress={() => setCity(c)}
            activeOpacity={0.8}>
            <Text style={[styles.chipText, city === c && styles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Address */}
      {type !== 'requirement' && (
        <FormField label="Address / Locality" icon="location-outline">
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. 12 MG Road, Near Metro"
            placeholderTextColor={colors.subtle}
          />
        </FormField>
      )}

      {/* Rent */}
      {type !== 'requirement' && (
        <FormField label="Monthly Rent (₹) *" icon="cash-outline">
          <TextInput
            style={styles.input}
            value={rent}
            onChangeText={setRent}
            placeholder="e.g. 12000"
            placeholderTextColor={colors.subtle}
            keyboardType="number-pad"
          />
        </FormField>
      )}

      {/* ── Room-specific ── */}
      {type === 'room' && (
        <>
          <View style={styles.twoColRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Bedrooms</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={bedrooms}
                  onChangeText={setBedrooms}
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Bathrooms</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={bathrooms}
                  onChangeText={setBathrooms}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Furnishing</Text>
          <View style={styles.chipRow}>
            {FURNISHING_OPTS.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.chip, furnishing === f && styles.chipActive]}
                onPress={() => setFurnishing(f)}
                activeOpacity={0.8}>
                <Text style={[styles.chipText, furnishing === f && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* ── PG-specific ── */}
      {type === 'pg' && (
        <>
          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.chipRow}>
            {(['male', 'female', 'co-ed'] as const).map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, pgGender === g && styles.chipActive]}
                onPress={() => setPgGender(g)}
                activeOpacity={0.8}>
                <Text style={[styles.chipText, pgGender === g && styles.chipTextActive]}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FormField label="Total Rooms" icon="bed-outline">
            <TextInput
              style={styles.input}
              value={totalRooms}
              onChangeText={setTotalRooms}
              keyboardType="number-pad"
              placeholder="e.g. 10"
              placeholderTextColor={colors.subtle}
            />
          </FormField>

          <View style={styles.mealsRow}>
            <Text style={styles.fieldLabel}>Meals Included</Text>
            <TouchableOpacity
              style={[styles.mealsToggle, meals && styles.mealsToggleActive]}
              onPress={() => setMeals(m => !m)}>
              <Text style={[styles.mealsToggleText, meals && styles.mealsToggleTextActive]}>
                {meals ? 'Yes' : 'No'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── Requirement-specific ── */}
      {type === 'requirement' && (
        <>
          <View style={styles.twoColRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Budget Min (₹)</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={budgetMin}
                  onChangeText={setBudgetMin}
                  keyboardType="number-pad"
                  placeholder="5000"
                  placeholderTextColor={colors.subtle}
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Budget Max (₹)</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                  keyboardType="number-pad"
                  placeholder="15000"
                  placeholderTextColor={colors.subtle}
                />
              </View>
            </View>
          </View>

          <Text style={styles.fieldLabel}>I am</Text>
          <View style={styles.chipRow}>
            {(['male', 'female', 'other'] as const).map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, reqGender === g && styles.chipActive]}
                onPress={() => setReqGender(g)}
                activeOpacity={0.8}>
                <Text style={[styles.chipText, reqGender === g && styles.chipTextActive]}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FormField label="About Me" icon="document-text-outline">
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell potential flatmates about yourself..."
              placeholderTextColor={colors.subtle}
              multiline
              numberOfLines={3}
              maxLength={300}
            />
          </FormField>

          <Text style={styles.fieldLabel}>Lifestyle Tags</Text>
          <View style={styles.chipRow}>
            {LIFESTYLE_TAGS.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, tags.includes(t) && styles.chipActive]}
                onPress={() => toggleTag(t)}
                activeOpacity={0.8}>
                <Text style={[styles.chipText, tags.includes(t) && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* ── Amenities (room + pg) ── */}
      {type !== 'requirement' && (
        <>
          <Text style={styles.fieldLabel}>Amenities</Text>
          <View style={styles.chipRow}>
            {AMENITIES_OPTS.map(a => (
              <TouchableOpacity
                key={a}
                style={[styles.chip, amenities.includes(a) && styles.chipActive]}
                onPress={() => toggleAmenity(a)}
                activeOpacity={0.8}>
                <Text style={[styles.chipText, amenities.includes(a) && styles.chipTextActive]}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={saving}
        activeOpacity={0.85}>
        <LinearGradient
          colors={colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitGrad}>
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Icon name="cloud-upload-outline" size={18} color={colors.white} />
              <Text style={styles.submitText}>Post Listing</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={step === 2 && !initialType ? () => setStep(1) : () => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="arrow-back" size={24} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post a Listing</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Step indicator */}
        <View style={styles.stepBar}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
        </View>

        {step === 1 && (
          <View style={styles.stepLabelRow}>
            <Text style={styles.stepLabel}>Choose listing type</Text>
          </View>
        )}
        {step === 2 && type && (
          <View style={styles.selectedTypeRow}>
            <Icon name={TYPE_OPTIONS.find(o => o.value === type)?.icon ?? 'home-outline'} size={16} color={colors.primary} />
            <Text style={styles.selectedTypeText}>
              {TYPE_OPTIONS.find(o => o.value === type)?.label}
            </Text>
            {!initialType && (
              <TouchableOpacity onPress={() => setStep(1)}>
                <Text style={styles.changeTypeText}>Change</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {step === 1 ? renderStep1() : renderStep2()}
          <View style={{ height: spacing[12] }} />
        </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostListingScreen;

// ── Field helper ──────────────────────────────────────────────────────────────

const FormField = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.inputWrap}>
      <Icon name={icon} size={16} color={colors.muted} style={styles.inputIcon} />
      {children}
    </View>
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

  // Step bar
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[4],
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.gray300,
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.gray200, marginHorizontal: spacing[2] },
  stepLineActive: { backgroundColor: colors.primary },
  stepLabelRow: { paddingHorizontal: layout.screenPaddingH, marginBottom: spacing[4] },
  stepLabel: { ...textPresets.h5, color: colors.dark },
  selectedTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: layout.screenPaddingH,
    marginBottom: spacing[2],
  },
  selectedTypeText: { ...textPresets.label, color: colors.primary, flex: 1 },
  changeTypeText: { ...textPresets.buttonSm, color: colors.muted },

  scroll: { padding: layout.screenPaddingH },

  // Type selection cards
  typeGrid: { gap: spacing[3] },
  typeCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    padding: spacing[5],
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.xs,
    position: 'relative',
  },
  typeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  typeIconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  typeIconWrapActive: { backgroundColor: colors.primary },
  typeLabel: { ...textPresets.h6, color: colors.dark, marginBottom: spacing[1] },
  typeLabelActive: { color: colors.primary },
  typeDesc: { ...textPresets.bodySm, color: colors.muted },
  typeDescActive: { color: colors.primary },
  typeCheck: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
  },

  // Fields
  fieldGroup: { marginBottom: spacing[4] },
  fieldLabel: { ...textPresets.labelSm, color: colors.muted, marginBottom: spacing[2], marginTop: spacing[4] },
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
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: spacing[3],
  },

  // Two-column row
  twoColRow: { flexDirection: 'row', gap: spacing[3] },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[2] },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...textPresets.caption, color: colors.muted },
  chipTextActive: { color: colors.white },

  // Meals toggle
  mealsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing[4] },
  mealsToggle: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealsToggleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  mealsToggleText: { ...textPresets.labelSm, color: colors.muted },
  mealsToggleTextActive: { color: colors.white },

  // Submit
  submitBtn: { marginTop: spacing[8], borderRadius: radius.xl, overflow: 'hidden', ...shadows.primarySm },
  submitGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
  },
  submitText: { ...textPresets.button, color: colors.white },
});
