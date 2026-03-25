/**
 * RoomDetailScreen — Full room listing detail
 * Hero image, amenities, host card, and contact/unlock CTA.
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
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { toggleSaved } from '../../Redux/Slices/wishlistSlice';
import { Room } from '../../Redux/Slices/roomsSlice';
import { ListingsService } from '../../services/listings.service';
import { DiscoverStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'RoomDetail'>;

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
};

const PREFERRED_TENANT_LABELS: Record<string, string> = {
  male: 'Male only',
  female: 'Female only',
  any: 'Any',
  family: 'Family preferred',
  students: 'Students preferred',
  'working-professionals': 'Working professionals',
};

const formatDate = (iso?: string) => {
  if (!iso) return 'Immediately';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatPostedAgo = (iso?: string) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 86_400_000) return 'Today';
  if (diff < 172_800_000) return 'Yesterday';
  return `${Math.floor(diff / 86_400_000)} days ago`;
};

const RoomDetailScreen = ({ navigation, route }: Props) => {
  const { roomId } = route.params;
  const dispatch = useAppDispatch();
  const savedIds = useAppSelector(s => s.wishlist.savedIds);
  const isSaved = savedIds.includes(roomId);

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);

  useEffect(() => {
    ListingsService.getRoomById(roomId)
      .then(setRoom)
      .catch(() => Alert.alert('Error', 'Could not load room details'))
      .finally(() => setIsLoading(false));
  }, [roomId]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    dispatch(toggleSaved(roomId));
    try {
      await ListingsService.toggleWishlist(roomId, 'room');
    } catch {
      dispatch(toggleSaved(roomId)); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleContact = () => {
    if (room?.phoneVisibility === 'reveal' || contactRevealed) {
      setContactRevealed(true);
    } else {
      Alert.alert(
        'Unlock Contact',
        'View this contact for ₹19 from your wallet. Proceed?',
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

  if (!room) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TouchableOpacity style={styles.backBtnAbs} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={22} color={colors.dark} />
        </TouchableOpacity>
        <View style={styles.loader}>
          <Icon name="home-outline" size={52} color={colors.gray300} />
          <Text style={styles.notFoundText}>Room not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials = room.postedBy?.name
    ?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero image ───────────────────────────── */}
        <View style={styles.hero}>
          {room.images?.[0] ? (
            <Image source={{ uri: room.images[0] }} style={styles.heroImg} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Icon name="home-outline" size={64} color={colors.gray300} />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={styles.heroOverlay}
          />

          {/* Actions overlay */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
            <Icon
              name={isSaved ? 'heart' : 'heart-outline'}
              size={22}
              color={isSaved ? colors.primary : colors.white}
            />
          </TouchableOpacity>

          {/* Available badge */}
          <View style={styles.availBadge}>
            <View style={styles.availDot} />
            <Text style={styles.availText}>Available from {formatDate(room.availableFrom)}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* ── Title + type tags ───────────────── */}
          <View style={styles.titleRow}>
            <View style={styles.typeBadge}>
              <Icon name="home-outline" size={12} color={colors.primary} />
              <Text style={styles.typeBadgeText}>Room</Text>
            </View>
            {room.preferredTenant && room.preferredTenant !== 'any' && (
              <View style={styles.tenantBadge}>
                <Text style={styles.tenantBadgeText}>
                  {PREFERRED_TENANT_LABELS[room.preferredTenant] ?? room.preferredTenant}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>{room.title}</Text>

          {/* ── Location ────────────────────────── */}
          <View style={styles.locationRow}>
            <Icon name="location-outline" size={16} color={colors.muted} />
            <Text style={styles.locationText}>{room.location}</Text>
          </View>

          {/* ── Rent ────────────────────────────── */}
          <View style={styles.rentRow}>
            <View>
              <Text style={styles.rentLabel}>Monthly Rent</Text>
              <Text style={styles.rentAmount}>₹{room.rent.toLocaleString()}</Text>
            </View>
            {room.deposit && (
              <View style={styles.depositBox}>
                <Text style={styles.depositLabel}>Security Deposit</Text>
                <Text style={styles.depositAmount}>₹{room.deposit.toLocaleString()}</Text>
              </View>
            )}
          </View>

          {/* ── About ───────────────────────────── */}
          {room.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this room</Text>
              <Text style={styles.descText}>{room.description}</Text>
            </View>
          ) : null}

          {/* ── Amenities ───────────────────────── */}
          {room.amenities && room.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {room.amenities.map(a => (
                  <View key={a} style={styles.amenityChip}>
                    <Icon
                      name={AMENITY_ICONS[a.toLowerCase()] ?? 'checkmark-circle-outline'}
                      size={15}
                      color={colors.primary}
                    />
                    <Text style={styles.amenityText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Host card ───────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posted by</Text>
            <View style={styles.hostCard}>
              <View style={styles.hostAvatarWrap}>
                {room.postedBy?.profileImage ? (
                  <Image source={{ uri: room.postedBy.profileImage }} style={styles.hostAvatar} />
                ) : (
                  <LinearGradient colors={colors.gradients.primary} style={styles.hostAvatarFallback}>
                    <Text style={styles.hostInitials}>{initials}</Text>
                  </LinearGradient>
                )}
              </View>
              <View style={styles.hostInfo}>
                <Text style={styles.hostName}>{room.postedBy?.name ?? 'Owner'}</Text>
                {room.createdAt && (
                  <Text style={styles.hostPosted}>Posted {formatPostedAgo(room.createdAt)}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky CTA ─────────────────────────── */}
      <View style={styles.cta}>
        {contactRevealed && room.postedBy?.phone ? (
          <TouchableOpacity style={styles.ctaCallBtn} activeOpacity={0.85}>
            <Icon name="call-outline" size={18} color={colors.success} />
            <Text style={styles.ctaCallText}>{room.postedBy.phone}</Text>
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
                {room.phoneVisibility === 'masked' ? 'View Contact • ₹19' : 'View Contact'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default RoomDetailScreen;

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

  // ── Hero ────────────────────────────────────────────────
  hero: { height: 280, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroPlaceholder: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
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
  saveBtn: {
    position: 'absolute',
    top: 52,
    right: layout.screenPaddingH,
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availBadge: {
    position: 'absolute',
    bottom: spacing[4],
    left: layout.screenPaddingH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  availDot: { width: 7, height: 7, borderRadius: radius.full, backgroundColor: colors.success },
  availText: { ...textPresets.caption, color: colors.white },

  // ── Body ────────────────────────────────────────────────
  body: { padding: layout.screenPaddingH, gap: spacing[5], paddingBottom: spacing[10] },

  titleRow: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: colors.primarySubtle,
  },
  typeBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  tenantBadge: {
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: colors.gray100,
  },
  tenantBadgeText: { fontSize: 11, fontWeight: '600', color: colors.muted },

  title: { ...textPresets.h4, color: colors.dark },

  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1.5] },
  locationText: { ...textPresets.body, color: colors.muted, flex: 1 },

  rentRow: {
    flexDirection: 'row',
    gap: spacing[8],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    ...shadows.xs,
  },
  rentLabel: { ...textPresets.caption, color: colors.muted, marginBottom: spacing[1] },
  rentAmount: { ...textPresets.h4, color: colors.primary },
  depositBox: {},
  depositLabel: { ...textPresets.caption, color: colors.muted, marginBottom: spacing[1] },
  depositAmount: { ...textPresets.h5, color: colors.dark },

  section: { gap: spacing[3] },
  sectionTitle: { ...textPresets.labelLg, color: colors.dark },
  descText: { ...textPresets.body, color: colors.muted, lineHeight: 24 },

  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.primarySubtle,
  },
  amenityText: { ...textPresets.caption, color: colors.primary, fontWeight: '600', textTransform: 'capitalize' },

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
