import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { useAppDispatch } from '../../hooks/useRedux';
import { loginSuccess } from '../../Redux/Slices/authSlice';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerification'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

const OTPScreen = ({ navigation, route }: Props) => {
  const { phone } = route.params;
  const dispatch = useAppDispatch();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 80, useNativeDriver: true }),
    ]).start();
    // Focus first input
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);
    setError('');

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (digit && index === OTP_LENGTH - 1) {
      const filled = updated.every(d => d !== '');
      if (filled) verifyOtp(updated.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const updated = [...otp];
      updated[index - 1] = '';
      setOtp(updated);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = useCallback(async (code: string) => {
    try {
      setIsLoading(true);
      setError('');
      const res = await AuthService.verifyOtp({ phone, otp: code });
      dispatch(
        loginSuccess({
          user: res.user,
          token: res.token,
          uid: res.user._id,
        }),
      );
      // RootNavigator handles redirect to Onboarding or Main automatically
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Invalid or expired code.';
      setError(msg);
      shake();
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setIsLoading(false);
    }
  }, [phone, dispatch]);

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits.');
      shake();
      return;
    }
    verifyOtp(code);
  };

  const handleResend = async () => {
    try {
      setIsResending(true);
      await AuthService.sendOtp({ phone });
      setResendTimer(RESEND_SECONDS);
      setOtp(Array(OTP_LENGTH).fill(''));
      setError('');
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const maskedPhone = phone.replace(/(\+\d{2})(\d{5})(\d{5})/, '$1 ••••• $3');
  const isComplete = otp.every(d => d !== '');

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
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
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
            <Text style={styles.title}>Verify your{'\n'}number</Text>
            <Text style={styles.subtitle}>
              Code sent to{' '}
              <Text style={styles.phoneBold}>{maskedPhone}</Text>
            </Text>
          </View>

          {/* ── OTP boxes ───────────────────────────────── */}
          <Animated.View
            style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}
          >
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={ref => { inputRefs.current[i] = ref; }}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                  error ? styles.otpBoxError : null,
                ]}
                value={digit}
                onChangeText={val => handleOtpChange(val, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                textContentType="oneTimeCode"
                caretHidden
              />
            ))}
          </Animated.View>

          {/* ── Error ───────────────────────────────────── */}
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* ── Resend ──────────────────────────────────── */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the code?</Text>
            {resendTimer > 0 ? (
              <Text style={styles.countdown}>
                {' '}Resend in {resendTimer}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={isResending}>
                <Text style={styles.resendBtn}>
                  {isResending ? ' Sending...' : ' Resend OTP'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.flex} />

          {/* ── CTA ─────────────────────────────────────── */}
          <Button
            label="Verify"
            onPress={handleVerify}
            disabled={!isComplete}
            loading={isLoading}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OTPScreen;

const BOX_SIZE = 52;

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
  phoneBold: {
    color: colors.dark,
    fontWeight: '700',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  otpBox: {
    flex: 1,
    height: BOX_SIZE,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceInput,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: colors.dark,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  otpBoxError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  errorText: {
    ...textPresets.bodySm,
    color: colors.error,
    fontWeight: '600',
    marginBottom: spacing[2],
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  resendLabel: {
    ...textPresets.bodySm,
    color: colors.muted,
  },
  countdown: {
    ...textPresets.bodySm,
    color: colors.subtle,
    fontWeight: '600',
  },
  resendBtn: {
    ...textPresets.bodySm,
    color: colors.primary,
    fontWeight: '700',
  },
});
