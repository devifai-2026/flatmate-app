import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, radius, shadows, textPresets, spacing } from '../theme';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';
export type ButtonSize = 'lg' | 'md' | 'sm';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const HEIGHT: Record<ButtonSize, number> = { lg: 56, md: 48, sm: 40 };

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  style,
  labelStyle,
  fullWidth = true,
  icon,
}: ButtonProps) => {
  const h = HEIGHT[size];
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={isDisabled ? ['#E0D8D2', '#D6CEC8'] : colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, { height: h }, !isDisabled && shadows.primaryMd]}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <View style={styles.row}>
              {icon && <View style={styles.iconLeft}>{icon}</View>}
              <Text style={[styles.primaryLabel, labelStyle]}>{label}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[
          styles.base,
          styles.outlineBase,
          { height: h },
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabledOutline,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <View style={styles.row}>
            {icon && <View style={styles.iconLeft}>{icon}</View>}
            <Text
              style={[
                styles.outlineLabel,
                isDisabled && styles.disabledLabel,
                labelStyle,
              ]}
            >
              {label}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // ghost / text
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.6}
      style={[styles.ghostBase, fullWidth && styles.fullWidth, style]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <Text style={[styles.ghostLabel, isDisabled && styles.disabledLabel, labelStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  base: {
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconLeft: { marginRight: spacing[2] },
  primaryLabel: {
    ...textPresets.buttonLg,
    color: colors.white,
  },
  outlineBase: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  outlineLabel: {
    ...textPresets.buttonLg,
    color: colors.primary,
  },
  ghostBase: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
  },
  ghostLabel: {
    ...textPresets.button,
    color: colors.primary,
  },
  disabledOutline: { borderColor: colors.gray300 },
  disabledLabel: { color: colors.gray400 },
});
