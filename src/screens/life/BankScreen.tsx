import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import colors from '../../constants/colors';
import { depositProducts } from '../../constants/depositProducts';
import { loanProducts } from '../../constants/loanProducts';
import { scalePrice } from '../../constants/economy';
import { useGame } from '../../store/GameContext';
import { LifeStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<LifeStackParamList, 'Bank'>;
type BankTab = 'deposits' | 'loans';

const BANK_UNLOCK_LEVEL = 2;

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);

  if (mins < 60) {
    return `${mins} мин`;
  }

  const hours = Math.floor(mins / 60);
  const restMins = mins % 60;

  if (restMins === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${restMins} мин`;
}

function formatTimer(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getEarlyWithdrawText(policy: 'none' | 'no_profit' | 'half_profit') {
  switch (policy) {
    case 'none':
      return 'Досрочное снятие недоступно';
    case 'no_profit':
      return 'Можно снять досрочно без прибыли';
    case 'half_profit':
      return 'При досрочном снятии теряется 50% прибыли';
    default:
      return '';
  }
}

function formatPaymentDate(timestamp: number) {
  const date = new Date(timestamp);

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function BankScreen({ navigation }: Props) {
  const {
    level,
    finCoin,

    mortgageStatus,

    activeDeposit,
    depositRemainingSeconds,

    activeLoan,

    openDeposit,
    takeLoan,
    payLoan,
    closeLoan,
    forceOverdue,
    reduceDepositTime,
  } = useGame();

    useEffect(() => {
    if (level < BANK_UNLOCK_LEVEL) {
      Alert.alert(
        'Банк закрыт',
        'Раздел «Банк» откроется на 2 уровне. Выполняй миссии и получай XP.',
        [
          {
            text: 'Понятно',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  }, [level, navigation]);

  const [activeTab, setActiveTab] = useState<BankTab>('deposits');

  const scaledDepositProducts = useMemo(
    () =>
      depositProducts.map((product) => ({
        ...product,
        minAmount: scalePrice(product.minAmount, level),
      })),
    [level]
  );

  const scaledLoanProducts = useMemo(
    () =>
      loanProducts.map((product) => ({
        ...product,
        amount: scalePrice(product.amount, level),
      })),
    [level]
  );

  const depositProgressPercent = useMemo(() => {
    if (!activeDeposit) return 0;

    const total = activeDeposit.durationSeconds;
    if (total <= 0) return 0;

    const passed = total - depositRemainingSeconds;

    return Math.max(0, Math.min(100, Math.round((passed / total) * 100)));
  }, [activeDeposit, depositRemainingSeconds]);

  const loanShortage = useMemo(() => {
    if (!activeLoan) return 0;

    return Math.max(0, activeLoan.remainingDebt - finCoin);
  }, [activeLoan, finCoin]);

  const paymentShortage = useMemo(() => {
    if (!activeLoan) return 0;

    return Math.max(0, activeLoan.monthlyPayment - finCoin);
  }, [activeLoan, finCoin]);

  const handleOpenDeposit = async (product: (typeof depositProducts)[number]) => {
    const result = await openDeposit(product);
    Alert.alert('Банк', result.message);
  };

  const handleTakeLoan = async (product: (typeof loanProducts)[number]) => {
    const result = await takeLoan(product);
    Alert.alert('Банк', result.message);
  };

  const handlePayLoan = async () => {
    const success = await payLoan();

    if (!success) {
      Alert.alert('Банк', 'Недостаточно FinCoin для внесения платежа.');
      return;
    }

    Alert.alert('Банк', 'Платёж по кредиту успешно внесён.');
  };

  const handleCloseLoan = async () => {
    const success = await closeLoan();

    if (!success) {
      Alert.alert('Банк', 'Недостаточно FinCoin для полного закрытия кредита.');
      return;
    }

    Alert.alert('Банк', 'Кредит полностью закрыт.');
  };

  const handleForceOverdue = () => {
    forceOverdue();
    Alert.alert('Банк', 'Кредит переведён в состояние просрочки для теста.');
  };

  const handleReduceDepositTime = async () => {
    const success = await reduceDepositTime(15, 0);

    if (!success) {
      Alert.alert('Банк', 'Не удалось ускорить вклад.');
    }
  };

  const handleCompleteDeposit = async () => {
    const success = await reduceDepositTime(999999, 0);

    if (!success) {
      Alert.alert('Банк', 'Не удалось завершить вклад.');
    }
  };

  const mortgageTitle =
    mortgageStatus === 'locked'
      ? 'Закрыто'
      : mortgageStatus === 'available'
      ? 'Доступно'
      : mortgageStatus === 'active'
      ? 'Активна'
      : 'Закрыта';

  const mortgageDescription =
    mortgageStatus === 'locked'
      ? 'Ипотека откроется на 3 уровне. Продолжай выполнять миссии и получать опыт.'
      : mortgageStatus === 'available'
      ? 'Ты можешь выбрать ипотечное предложение, сравнить условия и оформить подходящий вариант.'
      : mortgageStatus === 'active'
      ? 'У тебя уже есть активная ипотека. Сначала закрой текущую ипотеку на экране «Жизнь».'
      : 'Предыдущая ипотека закрыта. Теперь можно выбрать новое предложение и пройти следующий финансовый этап.';

  const mortgageButtonText =
    mortgageStatus === 'locked'
      ? 'Откроется на 3 уровне'
      : mortgageStatus === 'active'
      ? 'Ипотека уже активна'
      : mortgageStatus === 'completed'
      ? 'Выбрать новую ипотеку'
      : 'Выбрать ипотеку';

  const isMortgageButtonDisabled =
    mortgageStatus === 'locked' || mortgageStatus === 'active';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Банк</Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.balanceCard}>
          <View style={styles.balanceTopRow}>
            <View>
              <Text style={styles.balanceLabel}>Ваш баланс</Text>
              <Text style={styles.balanceValue}>{finCoin} FinCoin</Text>
            </View>

            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Уровень {level}</Text>
            </View>
          </View>

          <Text style={styles.balanceHint}>
            Банковские продукты открываются по мере роста уровня персонажа.
          </Text>
        </View>

        <View style={styles.mortgageBankCard}>
          <View style={styles.mortgageBankHeader}>
            <View style={styles.mortgageBankTitleRow}>
              <View style={styles.mortgageBankIcon}>
                <MaterialCommunityIcons
                  name="home-city-outline"
                  size={24}
                  color={colors.primaryDark}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.mortgageBankTitle}>Ипотека</Text>
                <Text style={styles.mortgageBankSubtitle}>
                  Крупный финансовый продукт для взрослого этапа
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.mortgageBankBadge,
                mortgageStatus === 'active' && styles.mortgageBankBadgeActive,
                mortgageStatus === 'locked' && styles.mortgageBankBadgeLocked,
                mortgageStatus === 'completed' &&
                  styles.mortgageBankBadgeCompleted,
              ]}
            >
              <Text
                style={[
                  styles.mortgageBankBadgeText,
                  mortgageStatus === 'locked' &&
                    styles.mortgageBankBadgeTextLocked,
                ]}
              >
                {mortgageTitle}
              </Text>
            </View>
          </View>

          <Text style={styles.mortgageBankText}>{mortgageDescription}</Text>

          <TouchableOpacity
            style={[
              styles.mortgageBankButton,
              isMortgageButtonDisabled && styles.mortgageBankButtonDisabled,
            ]}
            activeOpacity={0.85}
            disabled={isMortgageButtonDisabled}
            onPress={() => navigation.navigate('MortgageOffers')}
          >
            <Text
              style={[
                styles.mortgageBankButtonText,
                isMortgageButtonDisabled &&
                  styles.mortgageBankButtonTextDisabled,
              ]}
            >
              {mortgageButtonText}
            </Text>
          </TouchableOpacity>
        </View>

        {activeDeposit && (
          <View style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <View style={styles.activeTitleRow}>
                <View style={styles.activeIconWrap}>
                  <MaterialCommunityIcons
                    name="bank-transfer-in"
                    size={22}
                    color={colors.primaryDark}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.activeTitle}>Активный вклад</Text>
                  <Text style={styles.activeSubtitle}>{activeDeposit.title}</Text>
                </View>
              </View>

              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>В процессе</Text>
              </View>
            </View>

            <View style={styles.activeInfoGrid}>
              <View style={styles.activeInfoItem}>
                <Text style={styles.activeInfoLabel}>Сумма</Text>
                <Text style={styles.activeInfoValue}>
                  {activeDeposit.amount} FinCoin
                </Text>
              </View>

              <View style={styles.activeInfoItem}>
                <Text style={styles.activeInfoLabel}>Доход</Text>
                <Text style={styles.activeInfoValue}>
                  +{activeDeposit.interestPercent}%
                </Text>
              </View>

              <View style={styles.activeInfoItem}>
                <Text style={styles.activeInfoLabel}>К получению</Text>
                <Text style={styles.activeInfoValue}>
                  {activeDeposit.payoutAmount} FinCoin
                </Text>
              </View>
            </View>

            <Text style={styles.timerLabel}>Осталось времени</Text>
            <Text style={styles.timerValue}>
              {formatTimer(depositRemainingSeconds)}
            </Text>

            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${depositProgressPercent}%` },
                ]}
              />
            </View>

            <Text style={styles.progressHint}>
              Прогресс вклада: {depositProgressPercent}%
            </Text>

            <View style={styles.testButtonsRow}>
              <TouchableOpacity
                style={styles.testButton}
                activeOpacity={0.85}
                onPress={handleReduceDepositTime}
              >
                <Text style={styles.testButtonText}>Ускорить на 15 сек</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testButton}
                activeOpacity={0.85}
                onPress={handleCompleteDeposit}
              >
                <Text style={styles.testButtonText}>Завершить вклад</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeLoan && (
          <View style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <View style={styles.activeTitleRow}>
                <View style={styles.activeIconWrap}>
                  <MaterialCommunityIcons
                    name="cash-fast"
                    size={22}
                    color={colors.primaryDark}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.activeTitle}>Активный кредит</Text>
                  <Text style={styles.activeSubtitle}>{activeLoan.title}</Text>
                </View>
              </View>

              <View
                style={[
                  styles.activeBadge,
                  activeLoan.status === 'overdue' && styles.overdueBadge,
                ]}
              >
                <Text
                  style={[
                    styles.activeBadgeText,
                    activeLoan.status === 'overdue' && styles.overdueBadgeText,
                  ]}
                >
                  {activeLoan.status === 'overdue' ? 'Просрочка' : 'Активен'}
                </Text>
              </View>
            </View>

            <View style={styles.activeInfoGrid}>
              <View style={styles.activeInfoItem}>
                <Text style={styles.activeInfoLabel}>Получено</Text>
                <Text style={styles.activeInfoValue}>
                  {activeLoan.principal} FinCoin
                </Text>
              </View>

              <View style={styles.activeInfoItem}>
                <Text style={styles.activeInfoLabel}>Ставка</Text>
                <Text style={styles.activeInfoValue}>
                  +{activeLoan.interestPercent}%
                </Text>
              </View>

              <View style={styles.activeInfoItem}>
                <Text style={styles.activeInfoLabel}>Остаток</Text>
                <Text style={styles.activeInfoValue}>
                  {activeLoan.remainingDebt} FinCoin
                </Text>
              </View>
            </View>

            <View style={styles.activeInfoGrid}>
              <View style={styles.activeInfoItem}>
                <Text style={styles.activeInfoLabel}>Платёж</Text>
                <Text style={styles.activeInfoValue}>
                  {activeLoan.monthlyPayment} FinCoin
                </Text>
              </View>

              <View style={styles.activeInfoItem}>
                <Text style={styles.activeInfoLabel}>Внесено</Text>
                <Text style={styles.activeInfoValue}>
                  {activeLoan.paidPayments}/{activeLoan.totalPayments}
                </Text>
              </View>

              <View style={styles.activeInfoItem}>
                <Text style={styles.activeInfoLabel}>Штраф</Text>
                <Text style={styles.activeInfoValue}>
                  {activeLoan.penaltyAmount} FinCoin
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.loanChallengeBox,
                activeLoan.status === 'overdue' && styles.warningBox,
              ]}
            >
              <Text
                style={[
                  styles.loanChallengeTitle,
                  activeLoan.status === 'overdue' && styles.warningTitle,
                ]}
              >
                {activeLoan.status === 'overdue'
                  ? 'Платёж просрочен'
                  : 'Сегодня нужно внести платёж'}
              </Text>

              <Text
                style={[
                  styles.loanChallengeText,
                  activeLoan.status === 'overdue' && styles.warningText,
                ]}
              >
                {activeLoan.status === 'overdue'
                  ? `У вас просрочка ${activeLoan.overdueDays} дн. Штраф: ${activeLoan.penaltyAmount} FinCoin.`
                  : `Следующий платёж: ${activeLoan.monthlyPayment} FinCoin. Дата платежа: ${formatPaymentDate(
                      activeLoan.nextPaymentAt
                    )}.`}
              </Text>
            </View>

            <View style={styles.loanButtonsColumn}>
              <TouchableOpacity
                style={[
                  styles.loanActionButton,
                  paymentShortage > 0 && styles.actionButtonLocked,
                ]}
                activeOpacity={0.85}
                disabled={paymentShortage > 0}
                onPress={handlePayLoan}
              >
                <Text
                  style={[
                    styles.loanActionButtonText,
                    paymentShortage > 0 && styles.actionButtonTextLocked,
                  ]}
                >
                  {paymentShortage > 0
                    ? `Не хватает ${paymentShortage} FinCoin`
                    : 'Внести платёж'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.loanActionButton,
                  loanShortage > 0 && styles.actionButtonLocked,
                ]}
                activeOpacity={0.85}
                disabled={loanShortage > 0}
                onPress={handleCloseLoan}
              >
                <Text
                  style={[
                    styles.loanActionButtonText,
                    loanShortage > 0 && styles.actionButtonTextLocked,
                  ]}
                >
                  {loanShortage > 0
                    ? `Для закрытия не хватает ${loanShortage} FinCoin`
                    : 'Закрыть кредит полностью'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testOverdueButton}
                activeOpacity={0.85}
                onPress={handleForceOverdue}
              >
                <Text style={styles.testOverdueButtonText}>
                  Тест: сделать просрочку
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'deposits' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('deposits')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="bank-transfer-in"
              size={20}
              color={
                activeTab === 'deposits' ? colors.textLight : colors.primaryDark
              }
            />

            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'deposits' && styles.tabButtonTextActive,
              ]}
            >
              Вклады
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'loans' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('loans')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="credit-card-fast-outline"
              size={20}
              color={
                activeTab === 'loans' ? colors.textLight : colors.primaryDark
              }
            />

            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'loans' && styles.tabButtonTextActive,
              ]}
            >
              Кредиты
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {activeTab === 'deposits' &&
            scaledDepositProducts.map((product) => {
              const isUnlocked = level >= product.requiredLevel;
              const hasActiveDeposit = !!activeDeposit;

              return (
                <View
                  key={product.id}
                  style={[styles.card, !isUnlocked && styles.cardLocked]}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardTitleContainer}>
                      <View
                        style={[
                          styles.iconWrap,
                          !isUnlocked && styles.iconWrapLocked,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="bank"
                          size={22}
                          color={isUnlocked ? colors.primaryDark : colors.muted}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.cardTitle,
                            !isUnlocked && styles.lockedText,
                          ]}
                        >
                          {product.title}
                        </Text>

                        <Text style={styles.cardSubtitle}>
                          Открывается с {product.requiredLevel} уровня
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        isUnlocked
                          ? styles.statusBadgeUnlocked
                          : styles.statusBadgeLocked,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          !isUnlocked && styles.statusBadgeTextLocked,
                        ]}
                      >
                        {isUnlocked ? 'Доступно' : 'Закрыто'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Мин. сумма</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          !isUnlocked && styles.lockedText,
                        ]}
                      >
                        {product.minAmount} FinCoin
                      </Text>
                    </View>

                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Доходность</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          !isUnlocked && styles.lockedText,
                        ]}
                      >
                        +{product.interestPercent}%
                      </Text>
                    </View>

                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Срок</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          !isUnlocked && styles.lockedText,
                        ]}
                      >
                        {formatDuration(product.durationSeconds)}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.extraInfo,
                      !isUnlocked && styles.lockedText,
                    ]}
                  >
                    {getEarlyWithdrawText(product.earlyWithdraw)}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={!isUnlocked || hasActiveDeposit}
                    style={[
                      styles.actionButton,
                      isUnlocked && !hasActiveDeposit
                        ? styles.actionButtonPrimary
                        : styles.actionButtonLocked,
                    ]}
                    onPress={() => handleOpenDeposit(product)}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        (!isUnlocked || hasActiveDeposit) &&
                          styles.actionButtonTextLocked,
                      ]}
                    >
                      {!isUnlocked
                        ? `Откроется на ${product.requiredLevel} уровне`
                        : hasActiveDeposit
                        ? 'У вас уже есть активный вклад'
                        : 'Открыть вклад'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

          {activeTab === 'loans' &&
            scaledLoanProducts.map((product) => {
              const isUnlocked = level >= product.requiredLevel;
              const hasActiveLoan = !!activeLoan;

              const totalRepayment = Math.floor(
                product.amount + product.amount * (product.interestPercent / 100)
              );

              return (
                <View
                  key={product.id}
                  style={[styles.card, !isUnlocked && styles.cardLocked]}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardTitleContainer}>
                      <View
                        style={[
                          styles.iconWrap,
                          !isUnlocked && styles.iconWrapLocked,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="cash-fast"
                          size={22}
                          color={isUnlocked ? colors.primaryDark : colors.muted}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.cardTitle,
                            !isUnlocked && styles.lockedText,
                          ]}
                        >
                          {product.title}
                        </Text>

                        <Text style={styles.cardSubtitle}>
                          Открывается с {product.requiredLevel} уровня
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        isUnlocked
                          ? styles.statusBadgeUnlocked
                          : styles.statusBadgeLocked,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          !isUnlocked && styles.statusBadgeTextLocked,
                        ]}
                      >
                        {isUnlocked ? 'Доступно' : 'Закрыто'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Сумма</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          !isUnlocked && styles.lockedText,
                        ]}
                      >
                        {product.amount} FinCoin
                      </Text>
                    </View>

                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Переплата</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          !isUnlocked && styles.lockedText,
                        ]}
                      >
                        +{product.interestPercent}%
                      </Text>
                    </View>

                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>К возврату</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          !isUnlocked && styles.lockedText,
                        ]}
                      >
                        {totalRepayment} FinCoin
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.extraInfo,
                      !isUnlocked && styles.lockedText,
                    ]}
                  >
                    Кредит начисляет FinCoin сразу, но создаёт обязательные
                    платежи. Его можно закрыть досрочно полной суммой.
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={!isUnlocked || hasActiveLoan}
                    style={[
                      styles.actionButton,
                      isUnlocked && !hasActiveLoan
                        ? styles.actionButtonPrimary
                        : styles.actionButtonLocked,
                    ]}
                    onPress={() => handleTakeLoan(product)}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        (!isUnlocked || hasActiveLoan) &&
                          styles.actionButtonTextLocked,
                      ]}
                    >
                      {!isUnlocked
                        ? `Откроется на ${product.requiredLevel} уровне`
                        : hasActiveLoan
                        ? 'У вас уже есть активный кредит'
                        : 'Оформить кредит'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textDark,
  },
  headerRightPlaceholder: {
    width: 42,
    height: 42,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  balanceCard: {
    backgroundColor: colors.accent,
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textDark,
    opacity: 0.75,
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textDark,
  },
  balanceHint: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textDark,
    opacity: 0.8,
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  levelBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
  },
  mortgageBankCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E6E1D6',
  },
  mortgageBankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  mortgageBankTitleRow: {
    flexDirection: 'row',
    flex: 1,
  },
  mortgageBankIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#E7F2EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mortgageBankTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 4,
  },
  mortgageBankSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  mortgageBankBadge: {
    backgroundColor: '#E8F7C8',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  mortgageBankBadgeActive: {
    backgroundColor: '#FFF0C8',
  },
  mortgageBankBadgeLocked: {
    backgroundColor: '#F1F1F1',
  },
  mortgageBankBadgeCompleted: {
    backgroundColor: '#EAF6F3',
  },
  mortgageBankBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textDark,
  },
  mortgageBankBadgeTextLocked: {
    color: colors.muted,
  },
  mortgageBankText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#31433F',
    marginBottom: 14,
  },
  mortgageBankButton: {
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  mortgageBankButtonDisabled: {
    backgroundColor: '#EEF2F0',
  },
  mortgageBankButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  mortgageBankButtonTextDisabled: {
    color: colors.muted,
  },
  activeCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E6E1D6',
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  activeTitleRow: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 10,
  },
  activeIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#E7F2EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 4,
  },
  activeSubtitle: {
    fontSize: 14,
    color: colors.muted,
  },
  activeBadge: {
    backgroundColor: '#E8F7C8',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textDark,
  },
  overdueBadge: {
    backgroundColor: '#FFE2E2',
  },
  overdueBadgeText: {
    color: '#A33A3A',
  },
  activeInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  activeInfoItem: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  activeInfoLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
  },
  activeInfoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textDark,
  },
  timerLabel: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 6,
    textAlign: 'center',
  },
  timerValue: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#DDEAE5',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  progressHint: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  testButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  testButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textLight,
    textAlign: 'center',
  },
  loanChallengeBox: {
    marginTop: 2,
    marginBottom: 14,
    backgroundColor: '#EEF9EF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CDE9D0',
  },
  loanChallengeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 6,
  },
  loanChallengeText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#356B39',
  },
  warningBox: {
    backgroundColor: '#FFF1F1',
    borderColor: '#F2CACA',
  },
  warningTitle: {
    color: '#A33A3A',
  },
  warningText: {
    color: '#7A3B3B',
  },
  loanButtonsColumn: {
    gap: 10,
  },
  loanActionButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  loanActionButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textLight,
    textAlign: 'center',
  },
  testOverdueButton: {
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F1',
    borderWidth: 1,
    borderColor: '#F2CACA',
  },
  testOverdueButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#A33A3A',
    textAlign: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  tabButtonTextActive: {
    color: colors.textLight,
  },
  section: {
    gap: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
  },
  cardLocked: {
    opacity: 0.82,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#E7F2EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrapLocked: {
    backgroundColor: '#ECECEC',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.muted,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusBadgeUnlocked: {
    backgroundColor: '#E8F7C8',
  },
  statusBadgeLocked: {
    backgroundColor: '#EFEFEF',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textDark,
  },
  statusBadgeTextLocked: {
    color: colors.muted,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textDark,
  },
  extraInfo: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textDark,
    opacity: 0.8,
    marginBottom: 14,
  },
  lockedText: {
    color: colors.muted,
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionButtonLocked: {
    backgroundColor: '#ECECEC',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textLight,
    textAlign: 'center',
  },
  actionButtonTextLocked: {
    color: colors.muted,
  },
});