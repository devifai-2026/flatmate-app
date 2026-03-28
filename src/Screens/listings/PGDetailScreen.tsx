/**
 * PGDetailScreen — Full PG listing detail
 * Hero image, floating body card, info grid, amenities, host card, contact CTA.
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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { toggleSaved } from '../../Redux/Slices/wishlistSlice';
import { PG } from '../../Redux/Slices/pgsSlice';
import { ListingsService } from '../../services/listings.service';
import { DiscoverStackParamList } from '../../navigation/types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_H = Math.round(SCREEN_H * 0.44);
const INFO_BOX_W = (SCREEN_W - layout.screenPaddingH * 2 - spacing[3]) / 2;

type Props = NativeStackScreenProps<DiscoverStackParamList, 'PGDetail'>;

const AMENITY_ICONS: Record<string, string> = {
  wifi: 'wifi-outline',
  parking: 'car-outline',
  gym: 'barbell-outline',
  ac: 'snow-outline',
  laundry: 'water-outline',
  kitchen: 'restaurant-outline',
  security: 'shield-checkmark-outline',
  power: 'flash-outline',
  water: 'water-outline',
  furniture: 'bed-outline',
  tv: 'tv-outline',
};

const SHARING_LABELS: Record<string, string> = {
  single: 'Single',
  double: 'Double',
  triple: 'Triple',
  any: 'Flexible',
};

const GENDER_LABELS: Record<string, { label: string; color: string }> = {
  male: { label: 'Male only', color: colors.info },
  female: { label: 'Female only', color: '#EC4899' },
  unisex: { label: 'Unisex', color: colors.success },
};

const formatDate = (iso?: string) => {
  if (!iso) return 'Immediately';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatPostedAgo = (iso?: string) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 86_400_000) return 'Today';
  if (diff < 172_800_000) return 'Yesterday';
  return `${Math.floor(diff / 86_400_000)} days ago`;
};

// ── Info box component ─────────────────────────────────────────────────────
const InfoBox = ({
  icon, label, value, accent = false,
}: { icon: string; label: string; value: string; accent?: boolean }) => (
  <View style={[styles.infoBox, accent && styles.infoBoxAccent]}>
    <View style={[styles.infoIconBg, accent && styles.infoIconBgAccent]}>
      <Icon name={icon} size={16} color={accent ? colors.white : colors.primary} />
    </View>
    <Text style={[styles.infoLabel, accent && styles.infoLabelAccent]}>{label}</Text>
    <Text style={[styles.infoValue, accent && styles.infoValueAccent]} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

// ── Main screen ────────────────────────────────────────────────────────────
const PGDetailScreen = ({ navigation, route }: Props) => {
  const { pgId } = route.params;
  const dispatch = useAppDispatch();
  const savedIds = useAppSelector(s => s.wishlist.savedIds);
  const isSaved = savedIds.includes(pgId);

  const [pg, setPG] = useState<PG | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);

  useEffect(() => {
    ListingsService.getPGById(pgId)
      .then(setPG)
      .catch(() => Alert.alert('Error', 'Could not load PG details'))
      .finally(() => setIsLoading(false));
  }, [pgId]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    dispatch(toggleSaved(pgId));
    try {
      await ListingsService.toggleWishlist(pgId, 'pg');
    } catch {
      dispatch(toggleSaved(pgId));
    } finally {
      setIsSaving(false);
    }
  };

  const handleContact = () => {
    if (pg?.phoneVisibility === 'reveal' || contactRevealed) {
      setContactRevealed(true);
    } else {
      Alert.alert(
        'Unlock Contact',
        "View this PG owner's contact for ₹19 from your wallet. Proceed?",
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

  if (!pg) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TouchableOpacity style={styles.backBtnAbs} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={22} color={colors.dark} />
        </TouchableOpacity>
        <View style={styles.loader}>
          <View style={styles.notFoundIconWrap}>
            <Icon name="business-outline" size={40} color={colors.primary} />
          </View>
          <Text style={styles.notFoundTitle}>PG not found</Text>
          <Text style={styles.notFoundSub}>This listing may have been removed</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials =
    pg.postedBy?.name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? '?';
  const genderMeta = pg.gender ? GENDER_LABELS[pg.gender] : null;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* ── Hero ───────────────────────────────────── */}
        <View style={styles.hero}>
          {pg.images?.[0] ? (
            <Image source={{ uri: pg.images[0] }} style={styles.heroImg} resizeMode="cover" />
          ) : (
            <LinearGradient colors={['#3D3D3D', '#1A1A1A']} style={styles.heroPlaceholder}>
              <Icon name="business-outline" size={64} color="rgba(255,255,255,0.15)" />
            </LinearGradient>
          )}

          {/* Top fade for button visibility */}
          <LinearGradient
            colors={['rgba(0,0,0,0.55)', 'transparent']}
            style={styles.heroTopGrad}
          />
          {/* Bottom fade for card overlap */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)']}
            style={styles.heroBottomGrad}
          />

          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={20} color={colors.white} />
          </TouchableOpacity>

          {/* Save */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
            <Icon
              name={isSaved ? 'heart' : 'heart-outline'}
              size={20}
              color={isSaved ? '#FF6B6B' : colors.white}
            />
          </TouchableOpacity>

          {/* Available from badge */}
          <View style={styles.availBadge}>
            <View style={styles.availDot} />
            <Text style={styles.availText}>Available {formatDate(pg.availableFrom)}</Text>
          </View>

          {/* Image count */}
          {pg.images && pg.images.length > 1 && (
            <View style={styles.imgCount}>
              <Icon name="images-outline" size={12} color={colors.white} />
              <Text style={styles.imgCountText}>{pg.images.length} photos</Text>
            </View>
          )}
        </View>

        {/* ── Floating body card ─────────────────────── */}
        <View style={styles.body}>

          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Badges */}
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Icon name="business-outline" size={11} color={colors.primary} />
              <Text style={styles.typeBadgeText}>PG / Hostel</Text>
            </View>
            {genderMeta && (
              <View style={[styles.pill, { backgroundColor: `${genderMeta.color}18` }]}>
                <Text style={[styles.pillText, { color: genderMeta.color }]}>
                  {genderMeta.label}
                </Text>
              </View>
            )}
            {pg.meals && (
              <View style={[styles.pill, { backgroundColor: colors.successLight }]}>
                <Icon name="restaurant-outline" size={11} color={colors.success} />
                <Text style={[styles.pillText, { color: colors.success }]}>Meals incl.</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{pg.title}</Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <View style={styles.locationIconWrap}>
              <Icon name="location" size={14} color={colors.primary} />
            </View>
            <Text style={styles.locationText} numberOfLines={2}>{pg.location}</Text>
          </View>

          {/* ── Info stat grid ─────────────────────── */}
          <View style={styles.infoGrid}>
            <InfoBox
              icon="cash-outline"
              label="Monthly Rent"
              value={`₹${pg.rent.toLocaleString()}`}
              accent
            />
            {pg.deposit ? (
              <InfoBox
                icon="shield-outline"
                label="Deposit"
                value={`₹${pg.deposit.toLocaleString()}`}
              />
            ) : null}
            {pg.sharing ? (
              <InfoBox
                icon="people-outline"
                label="Sharing"
                value={SHARING_LABELS[pg.sharing] ?? pg.sharing}
              />
            ) : null}
            <InfoBox
              icon="calendar-outline"
              label="Available"
              value={formatDate(pg.availableFrom)}
            />
          </View>

          <View style={styles.divider} />

          {/* ── About ──────────────────────────────── */}
          {pg.description ? (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About this PG</Text>
                <Text style={styles.descText}>{pg.description}</Text>
              </View>
              <View style={styles.divider} />
            </>
          ) : null}

          {/* ── Amenities ──────────────────────────── */}
          {pg.amenities && pg.amenities.length > 0 && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>What's included</Text>
                  <Text style={styles.sectionCount}>{pg.amenities.length} amenities</Text>
                </View>
                <View style={styles.amenitiesGrid}>
                  {pg.amenities.map(a => (
                    <View key={a} style={styles.amenityChip}>
                      <View style={styles.amenityIconBg}>
                        <Icon
                          name={AMENITY_ICONS[a.toLowerCase()] ?? 'checkmark-circle-outline'}
                          size={13}
                          color={colors.primary}
                        />
                      </View>
                      <Text style={styles.amenityText}>{a}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.divider} />
            </>
          )}

          {/* ── Host card ──────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PG Owner</Text>
            <View style={styles.hostCard}>
              <View style={styles.hostAvatarContainer}>
                <View style={styles.hostAvatarWrap}>
                  {pg.postedBy?.profileImage ? (
                    <Image
                      source={{ uri: pg.postedBy.profileImage }}
                      style={styles.hostAvatar}
                    />
                  ) : (
                    <LinearGradient
                      colors={colors.gradients.primary}
                      style={styles.hostAvatarFallback}
                    >
                      <Text style={styles.hostInitials}>{initials}</Text>
                    </LinearGradient>
                  )}
                </View>
                <View style={styles.hostVerifiedDot} />
              </View>
              <View style={styles.hostInfo}>
                <Text style={styles.hostName}>{pg.postedBy?.name ?? 'Owner'}</Text>
                <Text style={styles.hostRole}>PG Owner</Text>
                {pg.createdAt ? (
                  <Text style={styles.hostPosted}>Listed {formatPostedAgo(pg.createdAt)}</Text>
                ) : null}
              </View>
              <View style={styles.hostVerifiedBadge}>
                <Icon name="checkmark-circle" size={13} color={colors.success} />
                <Text style={styles.hostVerifiedText}>Verified</Text>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* ── Sticky CTA ───────────────────────────────── */}
      <View style={styles.cta}>
        <View style={styles.ctaPriceBlock}>
          <Text style={styles.ctaPriceLabel}>Rent / mo</Text>
          <Text style={styles.ctaPriceValue}>₹{pg.rent.toLocaleString()}</Text>
        </View>
        <View style={styles.ctaDividerV} />
        {contactRevealed && pg.postedBy?.phone ? (
          <TouchableOpacity style={styles.ctaCallBtn} activeOpacity={0.85}>
            <Icon name="call-outline" size={18} color={colors.success} />
            <Text style={styles.ctaCallText}>{pg.postedBy.phone}</Text>
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
                {pg.phoneVisibility === 'masked' ? 'Unlock Contact • ₹19' : 'View Contact'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default PGDetailScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },

  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    gap: spacing[3],
  },
  notFoundIconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundTitle: { ...textPresets.h5, color: colors.dark },
  notFoundSub: { ...textPresets.bodySm, color: colors.muted, textAlign: 'center' },
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

  // ── Hero ─────────────────────────────────────────────────────
  hero: {
    height: HERO_H,
    position: 'relative',
    backgroundColor: colors.surfaceDark,
  },
  heroImg: { width: '100%', height: '100%' },
  heroPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTopGrad: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 130,
  },
  heroBottomGrad: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: layout.screenPaddingH,
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
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
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availBadge: {
    position: 'absolute',
    bottom: spacing[7],
    left: layout.screenPaddingH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  availDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.success,
  },
  availText: { fontFamily: 'Inter-Medium', fontSize: 11, color: colors.white },
  imgCount: {
    position: 'absolute',
    bottom: spacing[7],
    right: layout.screenPaddingH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  imgCountText: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: colors.white },

  // ── Floating body card ────────────────────────────────────────
  body: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    marginTop: -spacing[8],
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[3],
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray200,
    alignSelf: 'center',
    marginBottom: spacing[1],
  },

  // ── Badges ───────────────────────────────────────────────────
  badgeRow: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: colors.primarySubtle,
  },
  typeBadgeText: { fontFamily: 'Inter-Bold', fontSize: 11, color: colors.primary },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  pillText: { fontFamily: 'Inter-Bold', fontSize: 11 },

  // ── Title / location ──────────────────────────────────────────
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: colors.dark,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2.5],
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationIconWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  locationText: { ...textPresets.bodySm, color: colors.muted, flex: 1 },

  // ── Info stat grid ────────────────────────────────────────────
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  infoBox: {
    width: INFO_BOX_W,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    padding: spacing[3.5],
    gap: spacing[1.5],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.xs,
  },
  infoBoxAccent: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  infoIconBg: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconBgAccent: { backgroundColor: 'rgba(255,255,255,0.22)' },
  infoLabel: { fontFamily: 'Inter-Regular', fontSize: 11, color: colors.muted },
  infoLabelAccent: { color: 'rgba(255,255,255,0.7)' },
  infoValue: { fontFamily: 'Inter-Bold', fontSize: 15, color: colors.dark },
  infoValueAccent: { color: colors.white, fontSize: 18 },

  // ── Divider ───────────────────────────────────────────────────
  divider: { height: 1, backgroundColor: colors.border },

  // ── Sections ──────────────────────────────────────────────────
  section: { gap: spacing[3] },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: colors.dark,
  },
  sectionCount: { ...textPresets.caption, color: colors.muted },
  descText: {
    ...textPresets.body,
    color: colors.muted,
    lineHeight: 24,
  },

  // ── Amenities ─────────────────────────────────────────────────
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amenityIconBg: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.dark,
    textTransform: 'capitalize',
  },

  // ── Host card ─────────────────────────────────────────────────
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.xs,
  },
  hostAvatarContainer: { position: 'relative', flexShrink: 0 },
  hostAvatarWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
  hostAvatar: { width: '100%', height: '100%' },
  hostAvatarFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hostInitials: { fontFamily: 'Inter-ExtraBold', fontSize: 20, color: colors.white },
  hostVerifiedDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: radius.full,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surfaceCard,
  },
  hostInfo: { flex: 1, gap: 2 },
  hostName: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: colors.dark },
  hostRole: { fontFamily: 'Inter-Regular', fontSize: 12, color: colors.muted },
  hostPosted: { fontFamily: 'Inter-Regular', fontSize: 11, color: colors.subtle },
  hostVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: colors.successLight,
  },
  hostVerifiedText: { fontFamily: 'Inter-SemiBold', fontSize: 10, color: colors.success },

  // ── Sticky CTA ────────────────────────────────────────────────
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    gap: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  ctaPriceBlock: { gap: 2, minWidth: 70 },
  ctaPriceLabel: { fontFamily: 'Inter-Regular', fontSize: 11, color: colors.muted },
  ctaPriceValue: { fontFamily: 'Inter-ExtraBold', fontSize: 20, color: colors.primary },
  ctaDividerV: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  ctaBtn: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.primarySm,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
  },
  ctaBtnText: { ...textPresets.button, color: colors.white },
  ctaCallBtn: {
    flex: 1,
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
  ctaCallText: { ...textPresets.button, color: colors.success },
});
