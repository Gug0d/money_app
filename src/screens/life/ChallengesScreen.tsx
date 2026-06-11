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
import { Ionicons } from '@expo/vector-icons';

import colors from '../../constants/colors';
import TutorialTarget from '../../components/tutorial/TutorialTarget';
import { useGame } from '../../store/GameContext';
import { LifeStackParamList } from '../../navigation/AppNavigator';
import {
  boosts,
  jobs,
  properties,
  riskDeals,
} from '../../constants/challenges';
import { scaleFinCoinPrice } from '../../store/gameConfig';
import { getWorkEfficiency } from '../../store/features/useChallengesGame';

type Props = NativeStackScreenProps<LifeStackParamList, 'Challenges'>;

function formatSeconds(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ChallengesScreen({ navigation }: Props) {
  const {
    level,
    finCoin,
    homeComfort,
    homeDiscipline,
    mortgageStatus,

    activeJobId,
    ownedPropertyId,
    activeBoostIds,
    boostOfferIds,
    boostOffersRefreshAt,
    nextSalaryAvailableAt,

    applyJob,
    receiveSalary,
    buyProperty,
    buyBoost,
    skipBoostOffer,
    runRiskDeal,
  } = useGame();

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const activeJob = useMemo(
    () => jobs.find((job) => job.id === activeJobId) ?? null,
    [activeJobId]
  );

  const ownedProperty = useMemo(
    () =>
      properties.find((property) => property.id === ownedPropertyId) ?? null,
    [ownedPropertyId]
  );

  const boostOffers = useMemo(
    () =>
      boostOfferIds
        .map((boostId) => boosts.find((boost) => boost.id === boostId))
        .filter(Boolean) as typeof boosts,
    [boostOfferIds]
  );

  const workEfficiency = getWorkEfficiency({
    homeComfort,
    homeDiscipline,
  });

  const activeBaseSalary = activeJob
    ? scaleFinCoinPrice(activeJob.salary, level)
    : 0;

  const activeSalary = activeJob
    ? Math.round(activeBaseSalary * workEfficiency.multiplier)
    : 0;

  const salaryRemainingSeconds =
    nextSalaryAvailableAt && nextSalaryAvailableAt > now
      ? Math.ceil((nextSalaryAvailableAt - now) / 1000)
      : 0;

  const salaryAvailable = !!activeJob && salaryRemainingSeconds <= 0;

  const boostRefreshRemainingSeconds =
    boostOffersRefreshAt && boostOffersRefreshAt > now
      ? Math.ceil((boostOffersRefreshAt - now) / 1000)
      : 0;

  const handleApplyJob = async (jobId: string) => {
    const result = await applyJob(jobId);

    Alert.alert(result.success ? 'Работа получена' : 'Ошибка', result.message);
  };

  const handleReceiveSalary = async () => {
    const result = await receiveSalary();

    Alert.alert(
      result.success ? 'Зарплата получена' : 'Ошибка',
      result.message
    );
  };

  const handleBuyProperty = async (propertyId: string) => {
    const result = await buyProperty(propertyId);

    Alert.alert(
      result.success ? 'Покупка выполнена' : 'Ошибка',
      result.message
    );
  };

  const handleBuyPropertyWithMortgage = (propertyId: string) => {
    navigation.navigate('MortgageOffers', {
      selectedPropertyId: propertyId,
    });
  };

  const handleRiskDeal = async (dealId: string) => {
    const result = await runRiskDeal(dealId);

    Alert.alert(
      result.success ? 'Сделка успешна' : 'Сделка завершена',
      result.message
    );
  };

  const handleBuyBoost = async (boostId: string) => {
    const result = await buyBoost(boostId);

    Alert.alert(
      result.success ? 'Буст активирован' : 'Ошибка',
      result.message
    );
  };

  const handleSkipBoost = async (boostId: string) => {
    const result = await skipBoostOffer(boostId);

    Alert.alert(
      result.success ? 'Предложение пропущено' : 'Ошибка',
      result.message
    );
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('LifeMain');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.85}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textLight} />
        </TouchableOpacity>

        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Челленджи</Text>
          <Text style={styles.headerSubtitle}>
            Работа, цели, сделки и бусты
          </Text>
        </View>

        <View style={styles.balanceBadge}>
          <Text style={styles.balanceText}>{finCoin} FC</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TutorialTarget id="challenges-status">
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Текущий статус</Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Уровень</Text>
                <Text style={styles.summaryValue}>{level}</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Работа</Text>
                <Text style={styles.summaryValueSmall}>
                  {activeJob?.title ?? 'Нет'}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Жильё</Text>
                <Text style={styles.summaryValueSmall}>
                  {ownedProperty?.title ?? 'Нет'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.workEfficiencyBox,
                workEfficiency.multiplier < 1 &&
                  styles.workEfficiencyBoxWarning,
              ]}
            >
              <View style={styles.workEfficiencyHeader}>
                <Ionicons
                  name={
                    workEfficiency.multiplier < 1
                      ? 'warning-outline'
                      : 'checkmark-circle-outline'
                  }
                  size={20}
                  color={
                    workEfficiency.multiplier < 1
                      ? '#8A5A00'
                      : colors.primary
                  }
                />

                <Text style={styles.workEfficiencyTitle}>
                  {workEfficiency.title}
                </Text>
              </View>

              <Text style={styles.workEfficiencyText}>
                {workEfficiency.description}
              </Text>

              <View style={styles.workStatsRow}>
                <Text style={styles.workStatText}>
                  Комфорт: {homeComfort}%
                </Text>

                <Text style={styles.workStatText}>
                  Дисциплина: {homeDiscipline}%
                </Text>

                <Text style={styles.workStatText}>
                  Эффективность: {workEfficiency.percent}%
                </Text>
              </View>
            </View>

            {activeBoostIds.length > 0 ? (
              <View style={styles.activeBoostsBox}>
                <Text style={styles.activeBoostsTitle}>Активные бусты</Text>

                <View style={styles.activeBoostsRow}>
                  {activeBoostIds.map((boostId) => {
                    const boost = boosts.find((item) => item.id === boostId);

                    if (!boost) {
                      return null;
                    }

                    return (
                      <View key={boost.id} style={styles.activeBoostChip}>
                        <Text style={styles.activeBoostChipText}>
                          {boost.title}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                !salaryAvailable && styles.disabledButton,
              ]}
              activeOpacity={0.88}
              onPress={handleReceiveSalary}
              disabled={!salaryAvailable}
            >
              <Text style={styles.primaryButtonText}>
                {!activeJob
                  ? 'Сначала устройся на работу'
                  : salaryRemainingSeconds > 0
                  ? `Зарплата через ${formatSeconds(salaryRemainingSeconds)}`
                  : `Получить зарплату: ${activeSalary} FC`}
              </Text>
            </TouchableOpacity>
          </View>
        </TutorialTarget>

        <Text style={styles.sectionTitle}>Карьера</Text>

        {jobs.map((job) => {
          const locked = level < job.requiredLevel;
          const active = activeJobId === job.id;
          const salary = scaleFinCoinPrice(job.salary, level);

          return (
            <View key={job.id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="briefcase" size={22} color="#FFFFFF" />
                </View>

                <View style={styles.cardTextBlock}>
                  <Text style={styles.cardTitle}>{job.title}</Text>
                  <Text style={styles.cardDescription}>
                    {job.description}
                  </Text>
                </View>

                <Text style={styles.priceText}>{salary} FC</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  Требуется уровень: {job.requiredLevel}
                </Text>

                {active ? (
                  <Text style={styles.activeText}>Активна</Text>
                ) : locked ? (
                  <Text style={styles.lockedText}>Закрыто</Text>
                ) : (
                  <Text style={styles.availableText}>Доступно</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  locked && styles.disabledButton,
                  active && styles.activeButton,
                ]}
                activeOpacity={0.88}
                onPress={() => handleApplyJob(job.id)}
                disabled={locked || active}
              >
                <Text style={styles.secondaryButtonText}>
                  {active
                    ? 'Ты уже работаешь здесь'
                    : locked
                    ? 'Недоступно'
                    : 'Устроиться'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <Text style={styles.sectionTitle}>Крупные цели</Text>

        {properties.map((property) => {
          const locked = level < property.requiredLevel;
          const owned = ownedPropertyId === property.id;
          const price = scaleFinCoinPrice(property.price, level);

          const mortgageLocked = mortgageStatus === 'locked';
          const mortgageActive = mortgageStatus === 'active';

          const purchaseUnavailable = locked || owned || mortgageActive;
          const mortgageUnavailable =
            locked || owned || mortgageLocked || mortgageActive;

          return (
            <View key={property.id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="home" size={22} color="#FFFFFF" />
                </View>

                <View style={styles.cardTextBlock}>
                  <Text style={styles.cardTitle}>{property.title}</Text>
                  <Text style={styles.cardDescription}>
                    {property.description}
                  </Text>
                </View>

                <Text style={styles.priceText}>{price} FC</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  Требуется уровень: {property.requiredLevel}
                </Text>

                {owned ? (
                  <Text style={styles.activeText}>Куплено</Text>
                ) : locked ? (
                  <Text style={styles.lockedText}>Закрыто</Text>
                ) : (
                  <Text style={styles.availableText}>Доступно</Text>
                )}
              </View>

              <Text style={styles.bonusText}>Бонус: {property.bonus}</Text>

              {!owned && !locked ? (
                <Text style={styles.mortgageHintText}>
                  Можно купить сразу за полную стоимость или оформить ипотеку
                  на это жильё.
                </Text>
              ) : null}

              <View style={styles.propertyButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.secondaryButton,
                    styles.propertyButton,
                    purchaseUnavailable && styles.disabledButton,
                    owned && styles.activeButton,
                  ]}
                  activeOpacity={0.88}
                  onPress={() => handleBuyProperty(property.id)}
                  disabled={purchaseUnavailable}
                >
                  <Text style={styles.secondaryButtonText}>
                    {owned
                      ? 'Куплено'
                      : locked
                      ? 'Недоступно'
                      : mortgageActive
                      ? 'Ипотека активна'
                      : 'Купить'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.mortgageButton,
                    styles.propertyButton,
                    mortgageUnavailable && styles.disabledButton,
                  ]}
                  activeOpacity={0.88}
                  onPress={() => handleBuyPropertyWithMortgage(property.id)}
                  disabled={mortgageUnavailable}
                >
                  <Text style={styles.mortgageButtonText}>
                    {owned
                      ? 'Куплено'
                      : locked
                      ? 'Недоступно'
                      : mortgageLocked
                      ? 'Ипотека с 3 ур.'
                      : mortgageActive
                      ? 'Ипотека активна'
                      : 'В ипотеку'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <Text style={styles.sectionTitle}>Рискованные сделки</Text>

        {riskDeals.map((deal) => {
          const locked = level < deal.requiredLevel;
          const cost = scaleFinCoinPrice(deal.cost, level);
          const reward = scaleFinCoinPrice(deal.reward, level);
          const penalty = scaleFinCoinPrice(deal.failPenalty, level);

          return (
            <View key={deal.id} style={styles.riskCard}>
              <View style={styles.cardTopRow}>
                <View style={styles.riskIconCircle}>
                  <Ionicons name="trending-up" size={22} color="#FFFFFF" />
                </View>

                <View style={styles.cardTextBlock}>
                  <Text style={styles.cardTitle}>{deal.title}</Text>
                  <Text style={styles.cardDescription}>
                    {deal.description}
                  </Text>
                </View>
              </View>

              <View style={styles.riskStatsRow}>
                <Text style={styles.riskStat}>Вход: {cost} FC</Text>
                <Text style={styles.riskStat}>Профит: {reward} FC</Text>
                <Text style={styles.riskStat}>Штраф: {penalty} FC</Text>
                <Text style={styles.riskStat}>Шанс: {deal.successChance}%</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  Требуется уровень: {deal.requiredLevel}
                </Text>

                {locked ? (
                  <Text style={styles.lockedText}>Закрыто</Text>
                ) : (
                  <Text style={styles.availableText}>Доступно</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.riskButton, locked && styles.disabledButton]}
                activeOpacity={0.88}
                onPress={() => handleRiskDeal(deal.id)}
                disabled={locked}
              >
                <Text style={styles.riskButtonText}>
                  {locked ? 'Недоступно' : 'Попробовать'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <Text style={styles.sectionTitle}>Предложения бустов</Text>

        {boostOffers.length === 0 ? (
          <View style={styles.emptyBoostCard}>
            <View style={styles.emptyBoostIcon}>
              <Ionicons name="time-outline" size={26} color="#FFFFFF" />
            </View>

            <Text style={styles.emptyBoostTitle}>Новых бустов пока нет</Text>

            <Text style={styles.emptyBoostText}>
              {boostRefreshRemainingSeconds > 0
                ? `Новые предложения появятся через ${formatSeconds(
                    boostRefreshRemainingSeconds
                  )}.`
                : 'Предложения скоро обновятся.'}
            </Text>
          </View>
        ) : (
          boostOffers.map((boost) => {
            const locked = level < boost.requiredLevel;
            const active = activeBoostIds.includes(boost.id);
            const price = scaleFinCoinPrice(boost.price, level);

            return (
              <View key={boost.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={styles.boostIconCircle}>
                    <Ionicons name="flash" size={22} color="#FFFFFF" />
                  </View>

                  <View style={styles.cardTextBlock}>
                    <Text style={styles.cardTitle}>{boost.title}</Text>
                    <Text style={styles.cardDescription}>
                      {boost.description}
                    </Text>
                  </View>

                  <Text style={styles.priceText}>{price} FC</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    Требуется уровень: {boost.requiredLevel}
                  </Text>

                  {active ? (
                    <Text style={styles.activeText}>Активен</Text>
                  ) : locked ? (
                    <Text style={styles.lockedText}>Закрыто</Text>
                  ) : (
                    <Text style={styles.availableText}>Предложение</Text>
                  )}
                </View>

                <Text style={styles.bonusText}>Эффект: {boost.effect}</Text>

                <View style={styles.offerButtonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      styles.offerButton,
                      (locked || active) && styles.disabledButton,
                      active && styles.activeButton,
                    ]}
                    activeOpacity={0.88}
                    onPress={() => handleBuyBoost(boost.id)}
                    disabled={locked || active}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {active
                        ? 'Активен'
                        : locked
                        ? 'Недоступно'
                        : 'Купить'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.skipButton, styles.offerButton]}
                    activeOpacity={0.88}
                    onPress={() => handleSkipBoost(boost.id)}
                  >
                    <Text style={styles.skipButtonText}>Пропустить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.textLight,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '700',
    color: '#DCEFE8',
  },
  balanceBadge: {
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 120,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#EEF5F1',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textDark,
  },
  summaryValueSmall: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textDark,
    textAlign: 'center',
  },
  activeBoostsBox: {
    marginBottom: 16,
  },
  activeBoostsTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 8,
  },
  activeBoostsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeBoostChip: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  activeBoostChipText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#F8F2E4',
    borderRadius: 26,
    padding: 18,
    marginBottom: 16,
  },
  riskCard: {
    backgroundColor: colors.accent,
    borderRadius: 26,
    padding: 18,
    marginBottom: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boostIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textDark,
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: colors.muted,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textDark,
  },
  metaRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.muted,
  },
  activeText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.success,
  },
  lockedText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.danger,
  },
  availableText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
  },
  secondaryButton: {
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.45,
  },
  activeButton: {
    backgroundColor: colors.success,
  },
  bonusText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  mortgageHintText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: colors.muted,
  },
  propertyButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  propertyButton: {
    flex: 1,
    marginTop: 0,
  },
  mortgageButton: {
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
  },
  mortgageButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  riskStatsRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  riskStat: {
    backgroundColor: '#FFF8D8',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 14,
    fontWeight: '900',
    color: colors.textDark,
  },
  riskButton: {
    marginTop: 14,
    backgroundColor: colors.primaryDark,
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
  },
  riskButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  offerButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  offerButton: {
    flex: 1,
    marginTop: 0,
  },
  skipButton: {
    backgroundColor: '#E8DDC8',
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textDark,
    textAlign: 'center',
  },
  workEfficiencyBox: {
    backgroundColor: '#EAF6F3',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CFE5DD',
  },
  workEfficiencyBoxWarning: {
    backgroundColor: '#FFF1C7',
    borderColor: '#E3C46A',
  },
  workEfficiencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  workEfficiencyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textDark,
  },
  workEfficiencyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5D58',
    marginBottom: 10,
  },
  workStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  workStatText: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '900',
    color: colors.textDark,
  },
  salaryBlock: {
    alignItems: 'flex-end',
  },
  salaryPenaltyText: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '800',
    color: '#8A5A00',
    textDecorationLine: 'line-through',
  },
  emptyBoostCard: {
    backgroundColor: '#F8F2E4',
    borderRadius: 26,
    padding: 22,
    marginBottom: 16,
    alignItems: 'center',
  },
  emptyBoostIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyBoostTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyBoostText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: colors.muted,
    textAlign: 'center',
  },
});