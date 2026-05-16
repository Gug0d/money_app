import React, { useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import colors from '../../constants/colors';
import { mortgageOffers } from '../../constants/mortgageOffers';
import { MortgageOffer, AiAdviceResponse } from '../../types/finance';
import { getMortgageAdvice } from '../../services/aiAdvisor';
import { useGame } from '../../store/GameContext';
import { LifeStackParamList } from '../../navigation/AppNavigator';
import { scaleRubPrice } from '../../store/gameConfig';


type Props = NativeStackScreenProps<LifeStackParamList, 'MortgageOffers'>;

const AI_ADVICE_COST = 20;

export default function MortgageOffersScreen({ navigation }: Props) {
  const { finCoin, level, spendFinCoin, startMortgage, mortgageStatus } =
    useGame();
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [advice, setAdvice] = useState<AiAdviceResponse | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [creatingMortgage, setCreatingMortgage] = useState(false);

  const scaledMortgageOffers = useMemo(
  () =>
      mortgageOffers.map((offer) => ({
        ...offer,
        monthlyPayment: scaleRubPrice(offer.monthlyPayment, level),
        totalPayment: scaleRubPrice(offer.totalPayment, level),
        overpayment: scaleRubPrice(offer.overpayment, level),
        downPayment: scaleRubPrice(offer.downPayment, level),
      })),
    [level]
  );

  const selectedOffer = useMemo(
    () =>
      scaledMortgageOffers.find((offer) => offer.id === selectedOfferId) ?? null,
    [scaledMortgageOffers, selectedOfferId]
  );

  const handleAskAi = async () => {
    if (loadingAdvice || mortgageStatus === 'active') {
      return;
    }

    if (finCoin < AI_ADVICE_COST) {
      Alert.alert(
        'Недостаточно монет',
        `Для совета ИИ нужно ${AI_ADVICE_COST} фин коинов.`
      );
      return;
    }

    const paid = await spendFinCoin(AI_ADVICE_COST);

    if (!paid) {
      Alert.alert('Ошибка', 'Не удалось списать коины.');
      return;
    }

    try {
      setLoadingAdvice(true);

      const response = await getMortgageAdvice({
        playerLevel: level,
        playerCoins: finCoin - AI_ADVICE_COST,
        offers: scaledMortgageOffers,
      });

      setAdvice(response);

      if (response.recommendedOfferId) {
        setSelectedOfferId(response.recommendedOfferId);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось получить совет ИИ.');
    } finally {
      setLoadingAdvice(false);
    }
  };

  const handleCreateMortgage = async () => {
    if (!selectedOffer) {
      Alert.alert('Выбери предложение', 'Сначала выбери один из вариантов.');
      return;
    }

    if (mortgageStatus === 'active') {
      Alert.alert('Ипотека уже активна', 'У тебя уже есть активная ипотека.');
      return;
    }

    try {
      setCreatingMortgage(true);

      const success = await startMortgage({
        totalSeconds: selectedOffer.gameDurationSeconds,
        downPayment: selectedOffer.downPayment,
      });

      if (!success) {
        Alert.alert(
          'Не удалось оформить ипотеку',
          'Проверь, доступна ли ипотека на текущем уровне и хватает ли условий для оформления.'
        );
        return;
      }

      Alert.alert(
        'Ипотека оформлена',
        `Ты выбрал предложение от ${selectedOffer.bankName}.`
      );

      navigation.goBack();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось оформить ипотеку.');
    } finally {
      setCreatingMortgage(false);
    }
  };

  const handleSelectOffer = (offer: MortgageOffer) => {
    if (mortgageStatus === 'active') {
      return;
    }

    setSelectedOfferId(offer.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Выбор ипотеки</Text>
        <Text style={styles.subtitle}>
          Сравни условия, спроси совет у ИИ и оформи подходящий вариант
        </Text>

        {mortgageStatus === 'completed' && (
          <View style={styles.completedInfoCard}>
            <Text style={styles.completedInfoTitle}>
              Предыдущая ипотека закрыта
            </Text>
            <Text style={styles.completedInfoText}>
              Теперь можно выбрать новое предложение и пройти следующий
              финансовый этап.
            </Text>
          </View>
        )}

        {mortgageStatus === 'active' && (
          <View style={styles.activeInfoCard}>
            <Text style={styles.activeInfoTitle}>Ипотека уже активна</Text>
            <Text style={styles.activeInfoText}>
              Сначала закрой текущую ипотеку на экране «Жизнь», после этого
              можно будет выбрать новое предложение.
            </Text>
          </View>
        )}

        {scaledMortgageOffers.map((offer) => {
          const isSelected = selectedOfferId === offer.id;
          const isRecommended = advice?.recommendedOfferId === offer.id;

          return (
            <TouchableOpacity
              key={offer.id}
              style={[
                styles.offerCard,
                isSelected && styles.offerCardSelected,
                mortgageStatus === 'active' && styles.offerCardDisabled,
              ]}
              activeOpacity={0.92}
              onPress={() => handleSelectOffer(offer)}
              disabled={mortgageStatus === 'active'}
            >
              <View style={styles.offerHeader}>
                <Text style={styles.bankName}>{offer.bankName}</Text>

                {isRecommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedBadgeText}>Совет ИИ</Text>
                  </View>
                )}
              </View>

              <Text style={styles.offerDescription}>{offer.description}</Text>

              <View style={styles.statsBlock}>
                <Text style={styles.statText}>Ставка: {offer.rate}%</Text>
                <Text style={styles.statText}>Срок: {offer.years} лет</Text>
                <Text style={styles.statText}>
                  Платёж: {offer.monthlyPayment.toLocaleString('ru-RU')} ₽/мес
                </Text>
                <Text style={styles.statText}>
                  Переплата: {offer.overpayment.toLocaleString('ru-RU')} ₽
                </Text>
                <Text style={styles.statText}>
                  Первый взнос: {offer.downPayment.toLocaleString('ru-RU')} ₽
                </Text>
                <Text style={styles.statText}>
                  Игровое время: {offer.gameDurationSeconds} сек
                </Text>
              </View>

              <View style={styles.offerFooter}>
                <Text style={styles.chooseHint}>
                  {isSelected ? 'Выбрано' : 'Нажми, чтобы выбрать'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[
            styles.aiButton,
            (loadingAdvice || mortgageStatus === 'active') &&
              styles.aiButtonDisabled,
          ]}
          onPress={handleAskAi}
          activeOpacity={0.88}
          disabled={loadingAdvice || mortgageStatus === 'active'}
        >
          <Text style={styles.aiButtonText}>
            {loadingAdvice
              ? 'ИИ анализирует...'
              : `Спросить ИИ за ${AI_ADVICE_COST} монет`}
          </Text>
        </TouchableOpacity>

        {loadingAdvice && (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        )}

        {advice && (
          <View style={styles.adviceCard}>
            <Text style={styles.adviceTitle}>Совет ИИ</Text>
            <Text style={styles.adviceSummary}>{advice.summary}</Text>
            <Text style={styles.adviceReason}>
              {advice.recommendationReason}
            </Text>

            <Text style={styles.tradeoffTitle}>На что обратить внимание:</Text>

            {advice.tradeoffs.map((item, index) => (
              <Text key={index} style={styles.tradeoffText}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.createButton,
            (!selectedOffer ||
              creatingMortgage ||
              mortgageStatus === 'active') &&
              styles.createButtonDisabled,
          ]}
          onPress={handleCreateMortgage}
          activeOpacity={0.88}
          disabled={
            !selectedOffer || creatingMortgage || mortgageStatus === 'active'
          }
        >
          <Text style={styles.createButtonText}>
            {creatingMortgage ? 'Оформление...' : 'Оформить выбранную ипотеку'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E4',
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 18,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#5E6E69',
    marginBottom: 20,
  },
  completedInfoCard: {
    backgroundColor: '#FFF7DE',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1E3B4',
    marginBottom: 16,
  },
  completedInfoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primaryDark,
    marginBottom: 6,
  },
  completedInfoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#31433F',
  },
  activeInfoCard: {
    backgroundColor: '#FDECEC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F4C7C7',
    marginBottom: 16,
  },
  activeInfoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#8A2E2E',
    marginBottom: 6,
  },
  activeInfoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6E3434',
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    marginBottom: 16,
  },
  offerCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#F8FBFA',
  },
  offerCardDisabled: {
    opacity: 0.65,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  bankName: {
    flex: 1,
    fontSize: 22,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  recommendedBadge: {
    backgroundColor: '#EAF6F3',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  recommendedBadgeText: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 12,
  },
  offerDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#586763',
    marginBottom: 12,
  },
  statsBlock: {
    gap: 6,
  },
  statText: {
    fontSize: 15,
    color: '#31433F',
  },
  offerFooter: {
    marginTop: 14,
    alignItems: 'flex-end',
  },
  chooseHint: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  aiButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  aiButtonDisabled: {
    opacity: 0.6,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  loader: {
    marginBottom: 16,
  },
  adviceCard: {
    backgroundColor: '#FFF7DE',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1E3B4',
    marginBottom: 18,
  },
  adviceTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 10,
  },
  adviceSummary: {
    fontSize: 16,
    lineHeight: 24,
    color: '#31433F',
    marginBottom: 10,
  },
  adviceReason: {
    fontSize: 15,
    lineHeight: 22,
    color: '#31433F',
    marginBottom: 14,
  },
  tradeoffTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 8,
  },
  tradeoffText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#31433F',
    marginBottom: 6,
  },
  createButton: {
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
  },
});