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

type Props = NativeStackScreenProps<LifeStackParamList, 'MortgageOffers'>;

const AI_ADVICE_COST = 20;

export default function MortgageOffersScreen({ navigation }: Props) {
  const { finCoin, level, spendFinCoin, startMortgage, mortgageStatus } =
    useGame();

  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [advice, setAdvice] = useState<AiAdviceResponse | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [creatingMortgage, setCreatingMortgage] = useState(false);

  const selectedOffer = useMemo(
    () => mortgageOffers.find((offer) => offer.id === selectedOfferId) ?? null,
    [selectedOfferId]
  );

  const handleAskAi = async () => {
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
        offers: mortgageOffers,
      });

      setAdvice(response);
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

    if (mortgageStatus === 'completed') {
      Alert.alert(
        'Ипотека уже завершена',
        'Текущая ипотека уже закрыта. Для следующего этапа лучше добавить новую механику.'
      );
      return;
    }

    try {
      setCreatingMortgage(true);

      const success = await startMortgage({
        totalSeconds: selectedOffer.gameDurationSeconds,
      });

      if (!success) {
        Alert.alert(
          'Не удалось оформить ипотеку',
          'Проверь, доступна ли ипотека на текущем уровне.'
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

        {mortgageOffers.map((offer) => {
          const isSelected = selectedOfferId === offer.id;
          const isRecommended = advice?.recommendedOfferId === offer.id;

          return (
            <TouchableOpacity
              key={offer.id}
              style={[
                styles.offerCard,
                isSelected && styles.offerCardSelected,
              ]}
              activeOpacity={0.92}
              onPress={() => handleSelectOffer(offer)}
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
          style={styles.aiButton}
          onPress={handleAskAi}
          activeOpacity={0.88}
          disabled={loadingAdvice}
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
            <Text style={styles.adviceReason}>{advice.recommendationReason}</Text>

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
            (!selectedOffer || creatingMortgage) && styles.createButtonDisabled,
          ]}
          onPress={handleCreateMortgage}
          activeOpacity={0.88}
          disabled={!selectedOffer || creatingMortgage}
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