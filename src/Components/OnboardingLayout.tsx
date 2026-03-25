import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, textPresets, layout, shadows } from '../theme';
import { ProgressDots } from './ProgressDots';
import { Button } from './Button';

interface OnboardingLayoutProps {
  step: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  continueLoading?: boolean;
  scrollable?: boolean;
}

export const OnboardingLayout = ({
  step,
  totalSteps = 8,
  title,
  subtitle,
  children,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  continueLoading = false,
  scrollable = false,
}: OnboardingLayoutProps) => {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

  const mainContent = (
    <>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => canGoBack && navigation.goBack()}
            style={[styles.backBtn, !canGoBack && styles.backBtnHidden]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="chevron-back" size={22} color={colors.dark} />
          </TouchableOpacity>

          <ProgressDots total={totalSteps} current={step} />

          {/* Spacer to balance the back button */}
          <View style={styles.backBtn} />
        </View>

        {/* ── Content ────────────────────────────────────── */}
        {scrollable ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {mainContent}
          </ScrollView>
        ) : (
          <View style={styles.body}>{mainContent}</View>
        )}

        {/* ── Footer button ──────────────────────────────── */}
        <View style={styles.footer}>
          <Button
            label={continueLabel}
            onPress={onContinue}
            disabled={continueDisabled}
            loading={continueLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceDark,
  },
  backBtnHidden: { opacity: 0 },
  body: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingH,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing[4],
    flexGrow: 1,
  },
  titleBlock: {
    marginTop: spacing[6],
    marginBottom: spacing[8],
  },
  title: {
    ...textPresets.h3,
    color: colors.dark,
    marginBottom: spacing[2],
  },
  subtitle: {
    ...textPresets.body,
    color: colors.muted,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing[6],
    paddingTop: spacing[3],
  },
});
