/**
 * CreateTeamScreen — Create a new team OR join an existing one with passkey
 *
 * Two-tab UI:
 *  • Create — name, description, location, budget (min/max), maxMembers
 *  • Join   — FM-XXXXX passkey input
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
import { useAppDispatch } from '../../hooks/useRedux';
import { addTeam } from '../../Redux/Slices/teamsSlice';
import { TeamsService } from '../../services/teams.service';
import { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CreateTeam'>;

type Tab = 'create' | 'join';

// ── Screen ─────────────────────────────────────────────────────────────────────

const CreateTeamScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<Tab>('create');
  const [loading, setLoading] = useState(false);

  // Create form
  const [teamName,     setTeamName]     = useState('');
  const [description,  setDescription]  = useState('');
  const [location,     setLocation]     = useState('');
  const [budgetMin,    setBudgetMin]    = useState('');
  const [budgetMax,    setBudgetMax]    = useState('');
  const [maxMembers,   setMaxMembers]   = useState('5');

  // Join form
  const [passkey, setPasskey] = useState('');

  // ── Create ─────────────────────────────────────────────────────────────────

  const handleCreate = useCallback(async () => {
    if (!teamName.trim()) {
      Alert.alert('Required', 'Please enter a team name.');
      return;
    }
    setLoading(true);
    try {
      const payload: Parameters<typeof TeamsService.createTeam>[0] = {
        name: teamName.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        maxMembers: parseInt(maxMembers, 10) || 5,
      };
      if (budgetMin && budgetMax) {
        payload.budget = {
          min: parseInt(budgetMin, 10),
          max: parseInt(budgetMax, 10),
        };
      }
      const team = await TeamsService.createTeam(payload);
      dispatch(addTeam(team));
      Alert.alert(
        'Team Created!',
        `Your passkey is ${team.passkey}. Share it with friends to invite them.`,
        [{ text: 'View Team', onPress: () => navigation.navigate('TeamDetail', { teamId: team._id }) }],
      );
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not create team.');
    } finally {
      setLoading(false);
    }
  }, [teamName, description, location, budgetMin, budgetMax, maxMembers, dispatch, navigation]);

  // ── Join ───────────────────────────────────────────────────────────────────

  const handleJoin = useCallback(async () => {
    const key = passkey.trim().toUpperCase();
    if (!key || !key.startsWith('FM-')) {
      Alert.alert('Invalid passkey', 'Passkey should look like FM-XXXXX.');
      return;
    }
    setLoading(true);
    try {
      const team = await TeamsService.joinTeam(key);
      dispatch(addTeam(team));
      Alert.alert('Joined!', `You've joined "${team.name}".`, [
        { text: 'View Team', onPress: () => navigation.navigate('TeamDetail', { teamId: team._id }) },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not join team. Check the passkey.');
    } finally {
      setLoading(false);
    }
  }, [passkey, dispatch, navigation]);

  // ── Render ─────────────────────────────────────────────────────────────────

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
          <Text style={styles.headerTitle}>Teams</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tab toggle */}
        <View style={styles.tabBar}>
          {(['create', 'join'] as Tab[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
              activeOpacity={0.8}>
              <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
                {t === 'create' ? 'Create Team' : 'Join with Passkey'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {tab === 'create' ? (
            <>
              <Text style={styles.sectionTitle}>Team Details</Text>

              <Field label="Team Name *" icon="people-outline">
                <TextInput
                  style={styles.input}
                  value={teamName}
                  onChangeText={setTeamName}
                  placeholder="e.g. BFF Flatmates"
                  placeholderTextColor={colors.subtle}
                  maxLength={40}
                />
              </Field>

              <Field label="Description" icon="document-text-outline">
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What is this team about?"
                  placeholderTextColor={colors.subtle}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
              </Field>

              <Field label="Preferred Location" icon="location-outline">
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g. Bandra, Mumbai"
                  placeholderTextColor={colors.subtle}
                />
              </Field>

              <Text style={styles.sectionTitle}>Budget (optional)</Text>

              <View style={styles.budgetRow}>
                <View style={[styles.fieldWrap, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Min (₹/mo)</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      value={budgetMin}
                      onChangeText={setBudgetMin}
                      placeholder="5,000"
                      placeholderTextColor={colors.subtle}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
                <View style={styles.budgetDash}>
                  <Text style={styles.budgetDashText}>–</Text>
                </View>
                <View style={[styles.fieldWrap, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Max (₹/mo)</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      value={budgetMax}
                      onChangeText={setBudgetMax}
                      placeholder="15,000"
                      placeholderTextColor={colors.subtle}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </View>

              <Field label="Max Members" icon="person-add-outline">
                <TextInput
                  style={styles.input}
                  value={maxMembers}
                  onChangeText={setMaxMembers}
                  keyboardType="number-pad"
                  placeholder="5"
                  placeholderTextColor={colors.subtle}
                />
              </Field>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreate}
                disabled={loading}
                activeOpacity={0.85}>
                <LinearGradient
                  colors={colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGrad}>
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Icon name="add-circle-outline" size={18} color={colors.white} />
                      <Text style={styles.submitText}>Create Team</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.joinIllustration}>
                <View style={styles.joinIcon}>
                  <Icon name="key-outline" size={40} color={colors.primary} />
                </View>
                <Text style={styles.joinTitle}>Enter Passkey</Text>
                <Text style={styles.joinSub}>
                  Ask a teammate for their FM-XXXXX passkey to join their team.
                </Text>
              </View>

              <Field label="Passkey" icon="key-outline">
                <TextInput
                  style={[styles.input, styles.passkeyInput]}
                  value={passkey}
                  onChangeText={t => setPasskey(t.toUpperCase())}
                  placeholder="FM-XXXXX"
                  placeholderTextColor={colors.subtle}
                  autoCapitalize="characters"
                  maxLength={8}
                />
              </Field>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleJoin}
                disabled={loading}
                activeOpacity={0.85}>
                <LinearGradient
                  colors={colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGrad}>
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Icon name="enter-outline" size={18} color={colors.white} />
                      <Text style={styles.submitText}>Join Team</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: spacing[10] }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateTeamScreen;

// ── Field helper ──────────────────────────────────────────────────────────────

const Field = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) => (
  <View style={styles.fieldWrap}>
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...textPresets.h5, color: colors.dark },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: layout.screenPaddingH,
    marginTop: spacing[4],
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.lg,
    padding: spacing[1],
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing[2.5],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: colors.surfaceCard,
    ...shadows.xs,
  },
  tabBtnText: { ...textPresets.labelSm, color: colors.muted },
  tabBtnTextActive: { color: colors.primary },

  scroll: { padding: layout.screenPaddingH },

  sectionTitle: {
    ...textPresets.overline,
    color: colors.muted,
    marginTop: spacing[6],
    marginBottom: spacing[3],
  },

  // Fields
  fieldWrap: { marginBottom: spacing[4] },
  fieldLabel: { ...textPresets.labelSm, color: colors.muted, marginBottom: spacing[2] },
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
  passkeyInput: {
    ...textPresets.h5,
    color: colors.primary,
    letterSpacing: 4,
    textAlign: 'center',
  },

  // Budget row
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  budgetDash: { paddingBottom: spacing[3] },
  budgetDashText: { ...textPresets.h5, color: colors.muted },

  // Submit
  submitBtn: {
    marginTop: spacing[6],
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.primarySm,
  },
  submitGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
  },
  submitText: { ...textPresets.button, color: colors.white },

  // Join illustration
  joinIllustration: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[3],
  },
  joinIcon: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinTitle: { ...textPresets.h4, color: colors.dark },
  joinSub: {
    ...textPresets.body,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
});
