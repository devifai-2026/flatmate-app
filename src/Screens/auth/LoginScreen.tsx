import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, textPresets, radius, layout } from '../../theme';
import { Button } from '../../Components/Button';
import { AuthService } from '../../services/auth.service';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const COUNTRY_CODE = '+91';

const LoginScreen = ({ navigation }: Props) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 70, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleContinue = async () => {
    const trimmed = phone.trim();
    if (trimmed.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      shake();
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const fullPhone = `${COUNTRY_CODE}${trimmed}`;
      await AuthService.sendOtp({ phone: fullPhone });
      navigation.navigate('OTPVerification', { phone: fullPhone });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? 'Failed to send OTP. Please try again.';
      setError(msg);
      shake();
    } finally {
      setIsLoading(false);
    }
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const isComplete = phone.length === 10;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
            },
          ]}
        >
          {/* ── Top bar ─────────────────────────────────── */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="chevron-back" size={22} color={colors.dark} />
            </TouchableOpacity>
          </View>

          {/* ── Headings ────────────────────────────────── */}
          <View style={styles.headings}>
            <Text style={styles.title}>Enter your{'\n'}phone number</Text>
            <Text style={styles.subtitle}>
              We'll send you a one-time verification code
            </Text>
          </View>

          {/* ── Phone input ─────────────────────────────── */}
          <View style={styles.inputRow}>
            {/* Country code pill */}
            <View style={styles.countryPill}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryCode}>{COUNTRY_CODE}</Text>
            </View>

            {/* Phone field with animated bottom border */}
            <Animated.View
              style={[styles.phoneWrap, { borderBottomColor: borderColor }]}
            >
              <TextInput
                style={styles.phoneInput}
                placeholder="000 000 0000"
                placeholderTextColor={colors.subtle}
                keyboardType="phone-pad"
                value={phone}
                maxLength={10}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChangeText={t => {
                  setError('');
                  setPhone(t.replace(/\D/g, ''));
                }}
              />
            </Animated.View>
          </View>

          {/* ── Error ───────────────────────────────────── */}
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* ── Info note ───────────────────────────────── */}
          <Text style={styles.note}>
            Standard SMS rates may apply
          </Text>

          <View style={styles.flex} />

          {/* ── CTA ─────────────────────────────────────── */}
          <Button
            label="Send OTP"
            onPress={handleContinue}
            disabled={!isComplete}
            loading={isLoading}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing[6],
  },
  topBar: {
    paddingTop: spacing[4],
    marginBottom: spacing[6],
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headings: { marginBottom: spacing[10] },
  title: {
    ...textPresets.h2,
    color: colors.dark,
    marginBottom: spacing[3],
  },
  subtitle: {
    ...textPresets.body,
    color: colors.muted,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    backgroundColor: colors.surfaceDark,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    height: 52,
  },
  flag: { fontSize: 18 },
  countryCode: {
    ...textPresets.labelLg,
    color: colors.dark,
  },
  phoneWrap: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingBottom: spacing[2],
  },
  phoneInput: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.dark,
    letterSpacing: 2,
    paddingVertical: spacing[1],
  },
  errorText: {
    ...textPresets.bodySm,
    color: colors.error,
    fontWeight: '600',
  },
  note: {
    ...textPresets.caption,
    color: colors.subtle,
    marginTop: spacing[3],
  },
});
