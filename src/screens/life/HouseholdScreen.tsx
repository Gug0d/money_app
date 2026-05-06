import React, { useMemo } from 'react';
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

import { LifeStackParamList } from '../../navigation/AppNavigator';
import { useGame } from '../../store/GameContext';

type Props = NativeStackScreenProps<LifeStackParamList, 'Household'>;

function formatLongTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(
    2,
    '0'
  )}:${String(secs).padStart(2, '0')}`;
}

export default function HouseholdScreen({ navigation }: Props) {
  const {
    finCoin,
    homeBills,
    homeComfort,
    homeDiscipline,
    homeEvent,
    homeBillsRefreshRemainingSeconds,
    payHomeBill,
    repairHomeProblem,
    postponeHomeProblem,
    addTestCoins,
    resetHomeBillsForTest,
    triggerHomeEventForTest,
  } = useGame();

  const paidBills = useMemo(
    () => homeBills.filter((bill) => bill.status === 'paid').length,
    [homeBills]
  );

  const progress =
    homeBills.length > 0 ? Math.round((paidBills / homeBills.length) * 100) : 0;

  const handlePayBill = async (billId: number) => {
    const success = await payHomeBill(billId);

    if (!success) {
      Alert.alert(
        'Недостаточно FinCoin',
        'Сейчас не хватает монет для оплаты этого счёта.'
      );
    }
  };

  const handleRepair = async () => {
    const success = await repairHomeProblem();

    if (!success) {
      Alert.alert('Недостаточно FinCoin', 'Не хватает монет для решения события.');
    }
  };

  const handlePostpone = async () => {
    await postponeHomeProblem();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Баланс</Text>
            <Text style={styles.balanceValue}>{finCoin} FC</Text>
          </View>
        </View>

        <View style={styles.homeCard}>
          <Text style={styles.homeEmoji}>🏠</Text>
          <Text style={styles.title}>Дом и быт</Text>
          <Text style={styles.subtitle}>
            Оплачивай счета вовремя, избегай штрафов и поддерживай комфорт.
          </Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Счета месяца</Text>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <Text style={styles.timerText}>
            До обновления: {formatLongTime(homeBillsRefreshRemainingSeconds)}
          </Text>
        </View>

        {homeBills.map((bill) => {
          const isPaid = bill.status === 'paid';
          const isWarning = bill.status === 'warning';
          const isOverdue = bill.status === 'overdue';

          return (
            <View key={bill.id} style={styles.billCard}>
              <View style={styles.billLeft}>
                <Text style={styles.billIcon}>{bill.icon}</Text>

                <View style={styles.billInfo}>
                  <Text style={styles.billTitle}>{bill.title}</Text>
                  <Text style={styles.billDue}>{bill.due}</Text>

                  {isOverdue && (
                    <Text style={styles.penaltyText}>
                      Штраф: {bill.penalty} FC
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.billRight}>
                <Text style={styles.billAmount}>{bill.amount} FC</Text>

                <Text
                  style={[
                    styles.billStatus,
                    isPaid && styles.statusPaid,
                    isWarning && styles.statusWarning,
                    isOverdue && styles.statusOverdue,
                  ]}
                >
                  {isPaid
                    ? 'Оплачено'
                    : isWarning
                    ? 'Скоро срок'
                    : isOverdue
                    ? 'Просрочено'
                    : 'К оплате'}
                </Text>

                {!isPaid && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.smallButton}
                    onPress={() => handlePayBill(bill.id)}
                  >
                    <Text style={styles.smallButtonText}>Оплатить</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {homeEvent ? (
          <View style={styles.eventCard}>
            <Text style={styles.eventLabel}>Событие дома</Text>

            <Text style={styles.eventTitle}>
              {homeEvent.icon} {homeEvent.title}
            </Text>

            <Text style={styles.eventText}>{homeEvent.description}</Text>

            <Text style={styles.eventText}>
              Стоимость решения: {homeEvent.cost} FC
            </Text>

            <View style={styles.eventActions}>
              <TouchableOpacity
                style={styles.eventPrimaryButton}
                activeOpacity={0.85}
                onPress={handleRepair}
              >
                <Text style={styles.eventPrimaryText}>Решить</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.eventSecondaryButton}
                activeOpacity={0.85}
                onPress={handlePostpone}
              >
                <Text style={styles.eventSecondaryText}>Позже</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.eventCard}>
            <Text style={styles.eventLabel}>Событие дома</Text>
            <Text style={styles.eventTitle}>⏳ Пока всё спокойно</Text>
            <Text style={styles.eventText}>
              Иногда дома появляются неожиданные расходы. Будь готов.
            </Text>
          </View>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{homeDiscipline}%</Text>
            <Text style={styles.statLabel}>Дисциплина</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{homeComfort}%</Text>
            <Text style={styles.statLabel}>Комфорт</Text>
          </View>
        </View>

        <View style={styles.testBlock}>
          <Text style={styles.testTitle}>Тестирование</Text>

          <TouchableOpacity
            style={styles.testButton}
            activeOpacity={0.85}
            onPress={() => addTestCoins(100)}
          >
            <Text style={styles.testButtonText}>+100 FC</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            activeOpacity={0.85}
            onPress={resetHomeBillsForTest}
          >
            <Text style={styles.testButtonText}>Новый месяц</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            activeOpacity={0.85}
            onPress={triggerHomeEventForTest}
          >
            <Text style={styles.testButtonText}>Случайное событие</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            activeOpacity={0.85}
            onPress={() => {
              const firstUnpaid = homeBills.find((bill) => bill.status !== 'paid');
              if (firstUnpaid) {
                handlePayBill(firstUnpaid.id);
              }
            }}
          >
            <Text style={styles.testButtonText}>Оплатить 1 счёт</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A6A61',
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 120,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F7F1E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 42,
    lineHeight: 44,
    fontWeight: '900',
    color: '#0A4F4A',
  },
  balanceCard: {
    backgroundColor: '#F2C84B',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A4F4A',
    opacity: 0.8,
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A4F4A',
  },
  homeCard: {
    backgroundColor: '#F7F1E4',
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
  },
  homeEmoji: {
    fontSize: 42,
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    color: '#0A4F4A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#39635F',
  },
  progressCard: {
    backgroundColor: '#0F7D73',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F7F1E4',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F2C84B',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#086057',
    borderRadius: 20,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F2C84B',
    borderRadius: 20,
  },
  timerText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '800',
    color: '#F7F1E4',
  },
  billCard: {
    backgroundColor: '#F7F1E4',
    borderRadius: 22,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  billIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
  },
  billTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0A4F4A',
  },
  billDue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7D7A',
    marginTop: 3,
  },
  penaltyText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#C0392B',
    marginTop: 4,
  },
  billRight: {
    alignItems: 'flex-end',
  },
  billAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A4F4A',
  },
  billStatus: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D96B3A',
    marginTop: 2,
    marginBottom: 8,
  },
  statusPaid: {
    color: '#0E9F6E',
  },
  statusWarning: {
    color: '#D98A12',
  },
  statusOverdue: {
    color: '#C0392B',
  },
  smallButton: {
    backgroundColor: '#F2C84B',
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  smallButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0A4F4A',
  },
  eventCard: {
    backgroundColor: '#F2C84B',
    borderRadius: 24,
    padding: 18,
    marginTop: 6,
    marginBottom: 16,
  },
  eventLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0A4F4A',
    opacity: 0.75,
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A4F4A',
    marginBottom: 6,
  },
  eventText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: '#0A4F4A',
    marginBottom: 10,
  },
  eventActions: {
    flexDirection: 'row',
    marginTop: 4,
  },
  eventPrimaryButton: {
    flex: 1,
    backgroundColor: '#0A6A61',
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
    marginRight: 8,
  },
  eventPrimaryText: {
    color: '#F7F1E4',
    fontSize: 16,
    fontWeight: '900',
  },
  eventSecondaryButton: {
    flex: 1,
    backgroundColor: '#F7F1E4',
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
    marginLeft: 8,
  },
  eventSecondaryText: {
    color: '#0A4F4A',
    fontSize: 16,
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0F7D73',
    borderRadius: 22,
    padding: 16,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F2C84B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F7F1E4',
  },
  testBlock: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
    color: '#0A4F4A',
  },
  testButton: {
    backgroundColor: '#F2C84B',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  testButtonText: {
    fontWeight: '900',
    color: '#0A4F4A',
  },
});