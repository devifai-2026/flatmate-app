import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface ProgressDotsProps {
  total: number;
  /** 1-based current step */
  current: number;
}

export const ProgressDots = ({ total, current }: ProgressDotsProps) => (
  <View style={styles.container}>
    {Array.from({ length: total }).map((_, i) => {
      const done = i < current;
      const active = i === current - 1;
      return (
        <View
          key={i}
          style={[
            styles.dot,
            done ? styles.done : styles.idle,
            active && styles.active,
          ]}
        />
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  dot: {
    height: 6,
    borderRadius: radius.full,
  },
  active: {
    width: 24,
    backgroundColor: colors.primary,
  },
  done: {
    width: 16,
    backgroundColor: colors.primaryLight,
    opacity: 0.7,
  },
  idle: {
    width: 6,
    backgroundColor: colors.gray200,
  },
});
