import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, textPresets } from '../../theme';

const TransactionsScreen = () => (
  <View style={styles.container}>
    <Text style={styles.badge}>WALLET</Text>
    <Text style={styles.title}>Transaction History</Text>
    <Text style={styles.sub}>Phase 5 →</Text>
  </View>
);

export default TransactionsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  badge: { ...textPresets.overline, color: colors.primary, backgroundColor: colors.primarySubtle, paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: 99, overflow: 'hidden' },
  title: { ...textPresets.h3, color: colors.dark },
  sub: { ...textPresets.body, color: colors.muted },
});
