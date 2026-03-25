/**
 * WalletScreen — Balance, recharge packs, and transaction history
 *
 * Balance card: gradient, shows token balance
 * Recharge packs: ₹49 / ₹99 / ₹199 — opens Razorpay checkout
 * Transactions: full FlatList with type-coloured amounts
 *
 * Razorpay SDK (react-native-razorpay) is dynamically required so the
 * app doesn't crash if the SDK hasn't been linked yet.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RazorpayCheckout from 'react-native-razorpay';

import { colors, spacing, textPresets, radius, shadows, layout } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  setBalance,
  setTransactions,
  WalletTransaction,
} from '../../Redux/Slices/walletSlice';
import { WalletService } from '../../services/wallet.service';
import { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Wallet'>;

// ── Recharge packs ────────────────────────────────────────────────────────────

const PACKS = [
  { amount: 49,  tokens: 50,  label: 'Starter',    popular: false },
  { amount: 99,  tokens: 110, label: 'Popular',     popular: true  },
  { amount: 199, tokens: 250, label: 'Best Value',  popular: false },
] as const;

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Transaction row ────────────────────────────────────────────────────────────

const TxRow = ({ tx }: { tx: WalletTransaction }) => {
  const isCredit = tx.type === 'recharge';
  return (
    <View style={txStyles.row}>
      <View style={[txStyles.iconWrap, isCredit ? txStyles.iconWrapCredit : txStyles.iconWrapDebit]}>
        <Icon
          name={isCredit ? 'arrow-down' : 'arrow-up'}
          size={16}
          color={isCredit ? colors.success : colors.error}
        />
      </View>
      <View style={txStyles.body}>
        <Text style={txStyles.desc} numberOfLines={1}>{tx.description}</Text>
        <Text style={txStyles.date}>{formatDate(tx.createdAt)}</Text>
      </View>
      <View style={txStyles.right}>
        <Text style={[txStyles.amount, isCredit ? txStyles.amountCredit : txStyles.amountDebit]}>
          {isCredit ? '+' : '-'}₹{tx.amount}
        </Text>
        <Text style={txStyles.tokens}>
          {isCredit ? '+' : '-'}{tx.tokens} tokens
        </Text>
      </View>
    </View>
  );
};

const txStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapCredit: { backgroundColor: colors.successLight },
  iconWrapDebit:  { backgroundColor: colors.errorLight },
  body: { flex: 1, gap: 2 },
  desc: { ...textPresets.label, color: colors.dark },
  date: { ...textPresets.caption, color: colors.muted },
  right: { alignItems: 'flex-end', gap: 2 },
  amount: { ...textPresets.labelSm },
  amountCredit: { color: colors.success },
  amountDebit:  { color: colors.error },
  tokens: { ...textPresets.caption, color: colors.muted },
});

// ── Screen ────────────────────────────────────────────────────────────────────

const WalletScreen = ({ navigation }: Props) => {
  const dispatch      = useAppDispatch();
  const user          = useAppSelector(s => s.auth.user);
  const balance       = useAppSelector(s => s.wallet.balance);
  const transactions  = useAppSelector(s => s.wallet.transactions);

  const [isLoading,      setIsLoading]      = useState((transactions?.length ?? 0) === 0);
  const [isRefreshing,   setIsRefreshing]   = useState(false);
  const [rechargingPack, setRechargingPack] = useState<number | null>(null); // pack.amount

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [bal, txs] = await Promise.all([
        WalletService.getBalance(),
        WalletService.getTransactions(),
      ]);
      dispatch(setBalance(bal));
      dispatch(setTransactions(txs));
    } catch {
      // use cached
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setIsRefreshing(true); loadData(true); };

  const handleRecharge = useCallback(async (pack: typeof PACKS[number]) => {
    setRechargingPack(pack.amount);
    try {
      const order = await WalletService.createRechargeOrder(pack.amount);

      const options = {
        description:  `Wallet Recharge — ${pack.tokens} tokens`,
        currency:     order.currency,
        key:          order.keyId,
        amount:       order.amount,        // in paise (₹ × 100)
        name:         'Flatmate',
        order_id:     order.orderId,
        prefill: {
          name:    user?.name    ?? '',
          contact: user?.phone   ?? '',
        },
        theme: { color: colors.primary },
      };

      const paymentData: any = await RazorpayCheckout.open(options);
      const result = await WalletService.verifyRecharge({
        razorpayOrderId:   paymentData.razorpay_order_id,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpaySignature: paymentData.razorpay_signature,
      });
      dispatch(setBalance(result.balance));
      // Reload transactions to show the new entry
      WalletService.getTransactions()
        .then(txs => dispatch(setTransactions(txs)))
        .catch(() => {});
      Alert.alert('Recharge Successful', `${pack.tokens} tokens added to your wallet!`);
    } catch (err: any) {
      // code = 'PAYMENT_CANCELLED' means user closed the sheet — don't show error
      if (err?.code !== 'PAYMENT_CANCELLED') {
        Alert.alert('Payment Failed', 'Something went wrong. Please try again.');
      }
    } finally {
      setRechargingPack(null);
    }
  }, [user, dispatch]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="chevron-back" size={24} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={tx => tx._id}
        renderItem={({ item }) => <TxRow tx={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <>
            {/* ── Balance card ── */}
            <LinearGradient
              colors={['#D9103F', '#FF1351', '#FF4D7A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceCard}>
              <View style={styles.balanceCardTop}>
                <View>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                  <Text style={styles.balanceValue}>₹{balance}</Text>
                </View>
                <View style={styles.walletIconWrap}>
                  <Icon name="wallet" size={28} color="rgba(255,255,255,0.7)" />
                </View>
              </View>
              <Text style={styles.balanceSub}>
                Use tokens to unlock contact details of listings
              </Text>
            </LinearGradient>

            {/* ── Recharge packs ── */}
            <Text style={styles.sectionTitle}>Recharge</Text>
            <View style={styles.packsRow}>
              {PACKS.map(pack => {
                const isLoading = rechargingPack === pack.amount;
                return (
                  <TouchableOpacity
                    key={pack.amount}
                    style={[styles.packCard, pack.popular && styles.packCardPopular]}
                    onPress={() => handleRecharge(pack)}
                    disabled={rechargingPack !== null}
                    activeOpacity={0.8}>
                    {pack.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>Popular</Text>
                      </View>
                    )}
                    <Text style={[styles.packAmount, pack.popular && styles.packAmountPopular]}>
                      ₹{pack.amount}
                    </Text>
                    <Text style={[styles.packTokens, pack.popular && styles.packTokensPopular]}>
                      {pack.tokens} tokens
                    </Text>
                    <Text style={[styles.packLabel, pack.popular && styles.packLabelPopular]}>
                      {pack.label}
                    </Text>
                    {isLoading && (
                      <ActivityIndicator
                        style={StyleSheet.absoluteFill}
                        color={pack.popular ? colors.white : colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Transactions header ── */}
            <Text style={styles.sectionTitle}>Transaction History</Text>
            {(transactions?.length ?? 0) === 0 && (
              <View style={styles.emptyTx}>
                <Icon name="receipt-outline" size={40} color={colors.border} />
                <Text style={styles.emptyTxText}>No transactions yet</Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={null}
      />
    </SafeAreaView>
  );
};

export default WalletScreen;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingBottom: spacing[8], flexGrow: 1 },

  // Header
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
  headerTitle: { ...textPresets.h5, color: colors.dark, flex: 1, textAlign: 'center' },

  // Balance card
  balanceCard: {
    margin: layout.screenPaddingH,
    borderRadius: radius['2xl'],
    padding: spacing[6],
    ...shadows.primaryMd,
  },
  balanceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  balanceLabel: {
    ...textPresets.caption,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: spacing[1],
  },
  balanceValue: {
    ...textPresets.h2,
    color: colors.white,
  },
  walletIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceSub: {
    ...textPresets.caption,
    color: 'rgba(255,255,255,0.65)',
  },

  // Section title
  sectionTitle: {
    ...textPresets.labelSm,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: layout.screenPaddingH,
    marginTop: spacing[6],
    marginBottom: spacing[3],
  },

  // Packs
  packsRow: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPaddingH,
    gap: spacing[3],
  },
  packCard: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    padding: spacing[4],
    alignItems: 'center',
    gap: spacing[1],
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.xs,
    overflow: 'hidden',
  },
  packCardPopular: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.primarySm,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderBottomLeftRadius: radius.md,
  },
  popularBadgeText: { ...textPresets.caption, color: colors.white, fontSize: 9 },
  packAmount: { ...textPresets.h5, color: colors.dark },
  packAmountPopular: { color: colors.white },
  packTokens: { ...textPresets.bodySm, color: colors.muted },
  packTokensPopular: { color: 'rgba(255,255,255,0.85)' },
  packLabel: { ...textPresets.caption, color: colors.subtle },
  packLabelPopular: { color: 'rgba(255,255,255,0.65)' },

  // Empty transactions
  emptyTx: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[3],
  },
  emptyTxText: { ...textPresets.body, color: colors.muted },
});
