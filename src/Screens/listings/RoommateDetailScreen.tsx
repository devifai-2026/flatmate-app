/**
 * RoommateDetailScreen — Requirement post detail
 * Shows budget, location, preferences, lifestyle, and creator card with contact CTA.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { useAppDispatch } from '../../hooks/useRedux';
import { toggleSaved } from '../../Redux/Slices/wishlistSlice';
import { Requirement } from '../../Redux/Slices/requirementsSlice';
import { ListingsService } from '../../services/listings.service';
import { DiscoverStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'RoommateDetail'>;

const InfoChip = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.infoChip}>
    <Icon name={icon} size={14} color={colors.muted} />
    <Text style={styles.infoChipText}>{label}</Text>
  </View>
);

const formatDate = (iso?: string) => {
  if (!iso) return 'ASAP';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatPostedAgo = (iso?: string) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 86_400_000) return 'Today';
  if (diff < 172_800_000) return 'Yesterday';
  return `${Math.floor(diff / 86_400_000)} days ago`;
};

const RoommateDetailScreen = ({ navigation, route }: Props) => {
  const { requirementId } = route.params;
  const dispatch = useAppDispatch();

  const [req, setReq] = useState<Requirement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);

  useEffect(() => {
    ListingsService.getRequirementById(requirementId)
      .then(setReq)
      .catch(() => Alert.alert('Error', 'Could not load requirement details'))
      .finally(() => setIsLoading(false));
  }, [requirementId]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setIsSaved(p => !p);
    dispatch(toggleSaved(requirementId));
    try {
      await ListingsService.toggleWishlist(requirementId, 'requirement');
    } catch {
      setIsSaved(p => !p);
      dispatch(toggleSaved(requirementId));
    } finally {
      setIsSaving(false);
    }
  };

  const handleContact = () => {
    if (req?.phoneVisibility === 'reveal' || contactRevealed) {
      setContactRevealed(true);
    } else {
      Alert.alert(
        'Unlock Contact',
        'View this person\'s contact for ₹19 from your wallet. Proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Unlock ₹19', onPress: () => setContactRevealed(true) },
        ],
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!req) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TouchableOpacity style={styles.backBtnAbs} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={22} color={colors.dark} />
        </TouchableOpacity>
        <View style={styles.loader}>
          <Icon name="people-outline" size={52} color={colors.gray300} />
          <Text style={styles.notFoundText}>Requirement not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials = req.createdBy?.name
    ?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? '?';
  const { lifestyle, preferredRoommate } = req;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero strip ───────────────────────────── */}
        <LinearGradient
          colors={colors.gradients.primaryDeep}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.heroStrip}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="chevron-back" size={22} color={colors.white} />
          </TouchableOpacity>

          {/* Creator avatar */}
          <View style={styles.creatorWrap}>
            {req.createdBy?.profileImage ? (
              <Image source={{ uri: req.createdBy.profileImage }} style={styles.creatorAvatar} />
            ) : (
              <View style={styles.creatorAvatarFallback}>
                <Text style={styles.creatorInitials}>{initials}</Text>
              </View>
            )}
          </View>

          <Text style={styles.heroName}>{req.createdBy?.name ?? 'Someone'}</Text>
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroBadge}>
              <Icon name="search-outline" size={11} color="rgba(255,255,255,0.9)" />
              <Text style={styles.heroBadgeText}>
                {req.type === 'room' ? 'Looking for a room' : 'Looking for a flatmate'}
              </Text>
            </View>
          </View>

          {/* Save */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
            <Icon
              name={isSaved ? 'heart' : 'heart-outline'}
              size={22}
              color={isSaved ? colors.primary : colors.white}
            />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.body}>
          {/* ── Title + location ─────────────────── */}
          <Text style={styles.title}>{req.title}</Text>
          <View style={styles.locationRow}>
            <Icon name="location-outline" size={16} color={colors.muted} />
            <Text style={styles.locationText}>{req.location}</Text>
          </View>

          {/* ── Key info grid ────────────────────── */}
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxLabel}>Budget</Text>
              <Text style={styles.infoBoxValue}>
                ₹{req.budget.min.toLocaleString()}
              </Text>
              <Text style={styles.infoBoxSub}>– ₹{req.budget.max.toLocaleString()}/mo</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxLabel}>Move-in</Text>
              <Text style={styles.infoBoxValue}>{formatDate(req.moveInDate)}</Text>
            </View>
          </View>

          {/* ── About ───────────────────────────── */}
          {req.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descText}>{req.description}</Text>
            </View>
          ) : null}

          {/* ── Preferred roommate ───────────────── */}
          {preferredRoommate && Object.keys(preferredRoommate).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferred Roommate</Text>
              <View style={styles.chipsWrap}>
                {preferredRoommate.gender && (
                  <InfoChip icon="person-outline" label={preferredRoommate.gender} />
                )}
                {preferredRoommate.ageMin !== undefined && (
                  <InfoChip
                    icon="calendar-outline"
                    label={`Age ${preferredRoommate.ageMin}–${preferredRoommate.ageMax ?? '+'}`}
                  />
                )}
                {preferredRoommate.occupation && (
                  <InfoChip icon="briefcase-outline" label={preferredRoommate.occupation} />
                )}
              </View>
            </View>
          )}

          {/* ── Lifestyle preferences ────────────── */}
          {lifestyle && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lifestyle</Text>
              <View style={styles.chipsWrap}>
                {lifestyle.smoking !== undefined && (
                  <InfoChip
                    icon={lifestyle.smoking ? 'checkmark-circle-outline' : 'close-circle-outline'}
                    label={lifestyle.smoking ? 'Smoking OK' : 'Non-smoker'}
                  />
                )}
                {lifestyle.drinking !== undefined && (
                  <InfoChip
                    icon={lifestyle.drinking ? 'checkmark-circle-outline' : 'close-circle-outline'}
                    label={lifestyle.drinking ? 'Drinking OK' : 'No drinking'}
                  />
                )}
                {lifestyle.pets !== undefined && (
                  <InfoChip
                    icon={lifestyle.pets ? 'paw-outline' : 'close-circle-outline'}
                    label={lifestyle.pets ? 'Pets OK' : 'No pets'}
                  />
                )}
                {lifestyle.sleepSchedule && (
                  <InfoChip icon="moon-outline" label={lifestyle.sleepSchedule} />
                )}
              </View>
            </View>
          )}

          {/* ── Notes ───────────────────────────── */}
          {req.notes ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <Text style={styles.descText}>{req.notes}</Text>
            </View>
          ) : null}

          {/* ── Posted by ───────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posted by</Text>
            <View style={styles.hostCard}>
              <View style={styles.hostAvatarWrap}>
                {req.createdBy?.profileImage ? (
                  <Image source={{ uri: req.createdBy.profileImage }} style={styles.hostAvatar} />
                ) : (
                  <LinearGradient colors={colors.gradients.primary} style={styles.hostAvatarFallback}>
                    <Text style={styles.hostInitials}>{initials}</Text>
                  </LinearGradient>
                )}
              </View>
              <View style={styles.hostInfo}>
                <Text style={styles.hostName}>{req.createdBy?.name ?? 'User'}</Text>
                {req.createdAt && (
                  <Text style={styles.hostPosted}>Posted {formatPostedAgo(req.createdAt)}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky CTA ─────────────────────────── */}
      <View style={styles.cta}>
        {contactRevealed && req.createdBy?.phone ? (
          <TouchableOpacity style={styles.ctaCallBtn} activeOpacity={0.85}>
            <Icon name="call-outline" size={18} color={colors.success} />
            <Text style={styles.ctaCallText}>{req.createdBy.phone}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.ctaBtn} onPress={handleContact} activeOpacity={0.88}>
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Icon name="call-outline" size={18} color={colors.white} />
              <Text style={styles.ctaBtnText}>
                {req.phoneVisibility === 'masked' ? 'View Contact • ₹19' : 'View Contact'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default RoommateDetailScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  notFoundText: { ...textPresets.h5, color: colors.muted },
  backBtnAbs: {
    position: 'absolute',
    top: 52,
    left: layout.screenPaddingH,
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // ── Hero strip ──────────────────────────────────────────
  heroStrip: {
    paddingTop: 52,
    paddingBottom: spacing[7],
    alignItems: 'center',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: layout.screenPaddingH,
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    position: 'absolute',
    top: 52,
    right: layout.screenPaddingH,
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorWrap: {
    marginTop: spacing[5],
    marginBottom: spacing[3],
    width: 80,
    height: 80,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    ...shadows.md,
  },
  creatorAvatar: { width: '100%', height: '100%' },
  creatorAvatarFallback: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorInitials: { fontSize: 28, fontWeight: '800', color: colors.white },
  heroName: { ...textPresets.h4, color: colors.white, marginBottom: spacing[2] },
  heroBadgeRow: { flexDirection: 'row', gap: spacing[2] },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroBadgeText: { ...textPresets.caption, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  // ── Body ────────────────────────────────────────────────
  body: { padding: layout.screenPaddingH, gap: spacing[5], paddingBottom: spacing[10] },

  title: { ...textPresets.h4, color: colors.dark },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1.5] },
  locationText: { ...textPresets.body, color: colors.muted, flex: 1 },

  infoGrid: { flexDirection: 'row', gap: spacing[3] },
  infoBox: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    ...shadows.xs,
  },
  infoBoxLabel: { ...textPresets.caption, color: colors.muted, marginBottom: spacing[1] },
  infoBoxValue: { ...textPresets.h5, color: colors.primary },
  infoBoxSub: { ...textPresets.caption, color: colors.muted },

  section: { gap: spacing[3] },
  sectionTitle: { ...textPresets.labelLg, color: colors.dark },
  descText: { ...textPresets.body, color: colors.muted, lineHeight: 24 },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoChipText: { ...textPresets.caption, color: colors.dark, textTransform: 'capitalize' },

  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    ...shadows.xs,
  },
  hostAvatarWrap: { width: 52, height: 52, borderRadius: radius.full, overflow: 'hidden' },
  hostAvatar: { width: '100%', height: '100%' },
  hostAvatarFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hostInitials: { fontSize: 18, fontWeight: '800', color: colors.white },
  hostInfo: { flex: 1 },
  hostName: { ...textPresets.label, color: colors.dark },
  hostPosted: { ...textPresets.caption, color: colors.muted },

  cta: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  ctaBtn: { borderRadius: radius.xl, overflow: 'hidden', ...shadows.primarySm },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
  },
  ctaBtnText: { ...textPresets.buttonLg, color: colors.white },
  ctaCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    backgroundColor: colors.successLight,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.success,
  },
  ctaCallText: { ...textPresets.buttonLg, color: colors.success },
});
