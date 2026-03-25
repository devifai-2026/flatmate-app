/**
 * ViewUserProfileScreen — Public profile of any user
 *
 * Accessed from: notifications, discover deep links, roommate detail cards.
 * Loads the user via UserService.getUserById(userId).
 * Shows avatar, name, city, userType, bio, lifestyle tags.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { UserService } from '../../services/user.service';
import { User } from '../../Redux/Slices/authSlice';
import { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ViewUserProfile'>;

const USER_TYPE_LABELS: Record<string, string> = {
  seeker: 'Flatmate Seeker',
  'flat-owner': 'Flat Owner',
  'pg-owner': 'PG Owner',
};

// ── Screen ────────────────────────────────────────────────────────────────────

const ViewUserProfileScreen = ({ route, navigation }: Props) => {
  const { userId } = route.params;

  const [user,      setUser]      = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(false);

  useEffect(() => {
    UserService.getUserById(userId)
      .then(u => setUser(u))
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [userId]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="chevron-back" size={24} color={colors.dark} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Icon name="person-outline" size={52} color={colors.border} />
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Gradient hero ── */}
        <LinearGradient
          colors={colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>

          <TouchableOpacity
            style={styles.backBtnHero}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="chevron-back" size={22} color={colors.white} />
          </TouchableOpacity>

          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}

          <Text style={styles.heroName}>{user.name}</Text>

          <View style={styles.heroMeta}>
            {user.city ? (
              <View style={styles.heroPill}>
                <Icon name="location-outline" size={12} color="rgba(255,255,255,0.85)" />
                <Text style={styles.heroPillText}>{user.city}</Text>
              </View>
            ) : null}
            {user.userType ? (
              <View style={[styles.heroPill, styles.heroPillBorder]}>
                <Text style={styles.heroPillText}>
                  {USER_TYPE_LABELS[user.userType] ?? user.userType}
                </Text>
              </View>
            ) : null}
            {user.gender ? (
              <View style={[styles.heroPill, styles.heroPillBorder]}>
                <Text style={styles.heroPillText} style={{ textTransform: 'capitalize' }}>
                  {user.gender}
                </Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        {/* ── Body ── */}
        <View style={styles.body}>

          {/* Bio */}
          {user.bio ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>About</Text>
              <Text style={styles.bioText}>{user.bio}</Text>
            </View>
          ) : null}

          {/* Lifestyle tags */}
          {user.lifestyleTags && user.lifestyleTags.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Lifestyle</Text>
              <View style={styles.tagsWrap}>
                {user.lifestyleTags.map(tag => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Preferences (budget, looking for) */}
          {user.preferences ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Looking For</Text>
              <View style={styles.prefGrid}>
                {user.preferences.lookingFor ? (
                  <View style={styles.prefItem}>
                    <Icon name="search-outline" size={16} color={colors.primary} />
                    <Text style={styles.prefText}>
                      {user.preferences.lookingFor === 'room'
                        ? 'A Room'
                        : user.preferences.lookingFor === 'pg'
                        ? 'A PG'
                        : 'A Flatmate'}
                    </Text>
                  </View>
                ) : null}
                {(user.preferences.budgetMin || user.preferences.budgetMax) ? (
                  <View style={styles.prefItem}>
                    <Icon name="cash-outline" size={16} color={colors.primary} />
                    <Text style={styles.prefText}>
                      ₹{user.preferences.budgetMin ?? 0}
                      {' – '}
                      ₹{user.preferences.budgetMax ?? '∞'}
                      /mo
                    </Text>
                  </View>
                ) : null}
                {user.preferences.preferredLocation ? (
                  <View style={styles.prefItem}>
                    <Icon name="location-outline" size={16} color={colors.primary} />
                    <Text style={styles.prefText}>{user.preferences.preferredLocation}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}

        </View>

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewUserProfileScreen;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  errorText: { ...textPresets.body, color: colors.muted },

  // Standalone header (error state)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[3],
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: { padding: spacing[1] },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: spacing[14],
    paddingBottom: spacing[8],
    paddingHorizontal: layout.screenPaddingH,
  },
  backBtnHero: {
    position: 'absolute',
    top: spacing[5],
    left: spacing[4],
    padding: spacing[2],
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: spacing[3],
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: spacing[3],
  },
  avatarInitials: { ...textPresets.h4, color: colors.white },
  heroName: { ...textPresets.h4, color: colors.white, marginBottom: spacing[2] },
  heroMeta: {
    flexDirection: 'row',
    gap: spacing[2],
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  heroPillBorder: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  heroPillText: { ...textPresets.caption, color: 'rgba(255,255,255,0.9)' },

  // Body
  body: { paddingHorizontal: layout.screenPaddingH, paddingTop: spacing[5], gap: spacing[4] },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    padding: spacing[5],
    ...shadows.xs,
  },
  cardTitle: {
    ...textPresets.labelSm,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[3],
  },
  bioText: { ...textPresets.body, color: colors.dark, lineHeight: 22 },

  // Tags
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  tagChip: {
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
  },
  tagText: {
    ...textPresets.caption,
    color: colors.primary,
    textTransform: 'capitalize',
  },

  // Preferences
  prefGrid: { gap: spacing[3] },
  prefItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  prefText: { ...textPresets.body, color: colors.dark },
});
