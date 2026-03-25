/**
 * FlatmateProfileScreen — Full profile of an AI-matched user
 * Shows profile image, match score breakdown, bio, lifestyle tags, and connect CTA.
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
import { useAppSelector } from '../../hooks/useRedux';
import { UserService } from '../../services/user.service';
import { User } from '../../Redux/Slices/authSlice';
import { DiscoverStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'FlatmateProfile'>;

const SCORE_COLOR = (s: number) =>
  s >= 80 ? colors.success : s >= 60 ? colors.warning : colors.error;

const InfoRow = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.infoRow}>
    <Icon name={icon} size={15} color={colors.muted} />
    <Text style={styles.infoLabel}>{label}</Text>
  </View>
);

const FlatmateProfileScreen = ({ navigation, route }: Props) => {
  const { userId } = route.params;
  const matches = useAppSelector(s => s.matches.list);
  const match = matches.find(m => m.user._id === userId);

  const [profile, setProfile] = useState<User | null>(match?.user ?? null);
  const [isLoading, setIsLoading] = useState(!match);

  useEffect(() => {
    if (match) { setProfile(match.user); return; }
    UserService.getUserById(userId)
      .then(setProfile)
      .catch(() => Alert.alert('Error', 'Could not load profile'))
      .finally(() => setIsLoading(false));
  }, [userId, match]);

  const goChat = () =>
    (navigation as any).getParent()?.navigate('ChatTab', {
      screen: 'ChatDetail',
      params: {
        conversationId: `new_${userId}`,
        participantName: profile?.name ?? '',
        participantImage: profile?.profileImage,
        participantId: userId,
      },
    });

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TouchableOpacity style={styles.backBtnAbs} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={22} color={colors.dark} />
        </TouchableOpacity>
        <View style={styles.loader}>
          <Icon name="person-outline" size={52} color={colors.gray300} />
          <Text style={styles.notFoundText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials = profile.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const score = match?.score;
  const breakdown = match?.breakdown;

  const USER_TYPE_LABEL: Record<string, string> = {
    seeker: 'Looking for flat/PG',
    'flat-owner': 'Flat / Room Owner',
    'pg-owner': 'PG / Hostel Owner',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* ── Hero ─────────────────────────────────── */}
        <View style={styles.hero}>
          <LinearGradient
            colors={colors.gradients.primaryDeep}
            style={styles.heroBg}
          />
          {profile.profileImage ? (
            <Image
              source={{ uri: profile.profileImage }}
              style={styles.heroImg}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroImgFallback}>
              <Text style={styles.heroInitials}>{initials}</Text>
            </View>
          )}

          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="chevron-back" size={22} color={colors.white} />
          </TouchableOpacity>

          {/* Name + city */}
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{profile.name}</Text>
            {profile.city && (
              <View style={styles.heroCityRow}>
                <Icon name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroCity}>{profile.city}</Text>
              </View>
            )}
            {profile.userType && (
              <View style={styles.userTypePill}>
                <Text style={styles.userTypePillText}>
                  {USER_TYPE_LABEL[profile.userType] ?? profile.userType}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.body}>
          {/* ── Match score ──────────────────────── */}
          {score !== undefined && (
            <View style={styles.scoreCard}>
              <View style={styles.scoreLeft}>
                <View style={[styles.scoreCircle, { borderColor: SCORE_COLOR(score) }]}>
                  <Text style={[styles.scoreNum, { color: SCORE_COLOR(score) }]}>{score}</Text>
                  <Text style={styles.scorePct}>%</Text>
                </View>
                <View>
                  <Text style={styles.scoreTitle}>Match Score</Text>
                  <Text style={[styles.scoreSubtitle, { color: SCORE_COLOR(score) }]}>
                    {score >= 80 ? 'Great match!' : score >= 60 ? 'Good match' : 'Fair match'}
                  </Text>
                </View>
              </View>
              {breakdown && (
                <View style={styles.breakdown}>
                  {(Object.entries(breakdown) as [string, number][]).map(([key, val]) => (
                    <View key={key} style={styles.bRow}>
                      <Text style={styles.bLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                      <View style={styles.bBarTrack}>
                        <View style={[styles.bBarFill, { width: `${val}%`, backgroundColor: SCORE_COLOR(val) }]} />
                      </View>
                      <Text style={styles.bVal}>{val}%</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ── Bio ─────────────────────────────── */}
          {profile.bio ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          ) : null}

          {/* ── Info rows ────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.infoGrid}>
              {profile.gender && (
                <InfoRow
                  icon={profile.gender === 'male' ? 'male-outline' : 'female-outline'}
                  label={profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                />
              )}
              {profile.occupation && (
                <InfoRow icon="briefcase-outline" label={profile.occupation} />
              )}
              {profile.preferences?.lookingFor && (
                <InfoRow icon="search-outline" label={`Looking for ${profile.preferences.lookingFor}`} />
              )}
              {profile.preferences?.budgetMin !== undefined && (
                <InfoRow
                  icon="cash-outline"
                  label={`Budget: ₹${profile.preferences.budgetMin.toLocaleString()} – ₹${(profile.preferences.budgetMax ?? profile.preferences.budgetMin).toLocaleString()}`}
                />
              )}
            </View>
          </View>

          {/* ── Lifestyle tags ────────────────────── */}
          {profile.lifestyleTags && profile.lifestyleTags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lifestyle</Text>
              <View style={styles.tagsWrap}>
                {profile.lifestyleTags.map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag.replace(/-/g, ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Interests ────────────────────────── */}
          {profile.preferences?.interests && profile.preferences.interests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.tagsWrap}>
                {profile.preferences.interests.map(i => (
                  <View key={i} style={styles.tagOutline}>
                    <Text style={styles.tagOutlineText}>{i}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Sticky CTA ───────────────────────────── */}
      <View style={styles.cta}>
        <TouchableOpacity style={styles.ctaBtn} onPress={goChat} activeOpacity={0.85}>
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Icon name="chatbubble-ellipses-outline" size={18} color={colors.white} />
            <Text style={styles.ctaBtnText}>Start Chat</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FlatmateProfileScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  notFoundText: { ...textPresets.h5, color: colors.muted },

  // ── Hero ────────────────────────────────────────────────
  hero: {
    height: 320,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroImg: { width: '100%', height: '100%' },
  heroImgFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInitials: { fontSize: 72, fontWeight: '800', color: 'rgba(255,255,255,0.7)' },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: layout.screenPaddingH,
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  heroInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing[5],
    paddingTop: spacing[8],
    background: 'transparent',
  },
  heroName: { ...textPresets.h3, color: colors.white, marginBottom: spacing[1] },
  heroCityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginBottom: spacing[2] },
  heroCity: { ...textPresets.bodySm, color: 'rgba(255,255,255,0.85)' },
  userTypePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  userTypePillText: { ...textPresets.caption, color: colors.white, fontWeight: '600' },

  // ── Body ────────────────────────────────────────────────
  body: { padding: layout.screenPaddingH, gap: spacing[5], paddingBottom: spacing[10] },

  // ── Score card ──────────────────────────────────────────
  scoreCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    padding: spacing[4],
    ...shadows.sm,
  },
  scoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  scoreNum: { fontSize: 22, fontWeight: '800' },
  scorePct: { fontSize: 12, fontWeight: '600', color: colors.muted, marginTop: 4 },
  scoreTitle: { ...textPresets.h6, color: colors.dark },
  scoreSubtitle: { ...textPresets.bodySm, fontWeight: '600' },
  breakdown: { gap: spacing[2] },
  bRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  bLabel: { ...textPresets.caption, color: colors.muted, width: 70 },
  bBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.gray200,
    overflow: 'hidden',
  },
  bBarFill: { height: '100%', borderRadius: radius.full },
  bVal: { ...textPresets.caption, color: colors.dark, fontWeight: '600', width: 32, textAlign: 'right' },

  // ── Sections ────────────────────────────────────────────
  section: { gap: spacing[3] },
  sectionTitle: { ...textPresets.labelLg, color: colors.dark },
  bioText: { ...textPresets.body, color: colors.muted, lineHeight: 24 },

  infoGrid: { gap: spacing[2] },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  infoLabel: { ...textPresets.body, color: colors.dark },

  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  tag: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: 'rgba(255,19,81,0.15)',
  },
  tagText: { ...textPresets.caption, color: colors.primary, fontWeight: '600', textTransform: 'capitalize' },
  tagOutline: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagOutlineText: { ...textPresets.caption, color: colors.dark, textTransform: 'capitalize' },

  // ── CTA ─────────────────────────────────────────────────
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
});
