import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import colors from '../../constants/colors';
import { properties, type Property } from '../../constants/challenges';
import { mortgageOffers } from '../../constants/mortgageOffers';
import { AiAdviceResponse, MortgageOffer } from '../../types/finance';
import { getMortgageAdvice } from '../../services/aiAdvisor';
import { useGame } from '../../store/GameContext';
import { LifeStackParamList } from '../../navigation/AppNavigator';
import { scaleFinCoinPrice } from '../../store/gameConfig';

type Props = NativeStackScreenProps<LifeStackParamList, 'MortgageOffers'>;

const AI_ADVICE_COST = 20;

const formatFinCoin = (value: number) =>
  `${value.toLocaleString('ru-RU')} FinCoin`;

export default function MortgageOffersScreen({ navigation, route }: Props) {
  const {
    finCoin,
    level,
    ownedPropertyId,
    spendFinCoin,
    startMortgage,
    mortgageStatus,
  } = useGame();

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    route.params?.selectedPropertyId ?? null
  );

  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [advice, setAdvice] = useState<AiAdviceResponse | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [creatingMortgage, setCreatingMortgage] = useState(false);

  const mortgageUnavailable =
    mortgageStatus === 'locked' || mortgageStatus === 'active';

  const scaledProperties = useMemo(
    () =>
      properties.map((property) => ({
        ...property,
        price: scaleFinCoinPrice(property.price, level),
      })),
    [level]
  );

  const selectedProperty = useMemo(
    () =>
      scaledProperties.find((property) => property.id === selectedPropertyId) ??
      null,
    [scaledProperties, selectedPropertyId]
  );

  const scaledMortgageOffers = useMemo(
    () =>
      mortgageOffers.map((offer) => ({
        ...offer,
        monthlyPayment: scaleFinCoinPrice(offer.monthlyPayment, level),
        totalPayment: scaleFinCoinPrice(offer.totalPayment, level),
        overpayment: scaleFinCoinPrice(offer.overpayment, level),
        downPayment: scaleFinCoinPrice(offer.downPayment, level),
      })),
    [level]
  );

  const selectedOffer = useMemo(
    () =>
      scaledMortgageOffers.find((offer) => offer.id === selectedOfferId) ??
      null,
    [scaledMortgageOffers, selectedOfferId]
  );

  const createButtonDisabled =
    !selectedProperty ||
    !selectedOffer ||
    creatingMortgage ||
    mortgageUnavailable;

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('LifeMain');
  };

  const handleSelectProperty = (property: Property) => {
    const locked = level < property.requiredLevel;
    const owned = ownedPropertyId === property.id;

    if (mortgageUnavailable || locked || owned) {
      return;
    }

    setSelectedPropertyId(property.id);
  };

  const handleSelectOffer = (offer: MortgageOffer) => {
    if (mortgageUnavailable) {
      return;
    }

    setSelectedOfferId(offer.id);
  };

  const handleAskAi = async () => {
    if (loadingAdvice || mortgageUnavailable) {
      return;
    }

    if (finCoin < AI_ADVICE_COST) {
      Alert.alert(
        'Недостаточно FinCoin',
        `Для получения совета нужно ${AI_ADVICE_COST} FinCoin.`
      );
      return;
    }

    const paid = await spendFinCoin(AI_ADVICE_COST);

    if (!paid) {
      Alert.alert(
        'Не удалось оплатить совет',
        'Проверь количество FinCoin и попробуй снова.'
      );
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
      Alert.alert(
        'Советник недоступен',
        'Не удалось получить рекомендацию. Попробуй снова позже.'
      );
    } finally {
      setLoadingAdvice(false);
    }
  };

  const handleCreateMortgage = async () => {
    if (!selectedProperty) {
      Alert.alert(
        'Недвижимость не выбрана',
        'Сначала выбери жильё из раздела «Крупные цели».'
      );
      return;
    }

    if (level < selectedProperty.requiredLevel) {
      Alert.alert(
        'Недвижимость пока закрыта',
        `Для этого жилья нужен ${selectedProperty.requiredLevel} уровень. Сейчас у тебя ${level}.`
      );
      return;
    }

    if (ownedPropertyId === selectedProperty.id) {
      Alert.alert(
        'Жильё уже куплено',
        'Эта недвижимость уже находится в твоём владении.'
      );
      return;
    }

    if (!selectedOffer) {
      Alert.alert(
        'Вариант не выбран',
        'Выбери одно из ипотечных предложений, чтобы продолжить.'
      );
      return;
    }

    if (mortgageStatus === 'locked') {
      Alert.alert(
        'Ипотека пока закрыта',
        'Ипотека открывается на 3 уровне. Сначала повысь уровень игрока.'
      );
      return;
    }

    if (mortgageStatus === 'active') {
      Alert.alert(
        'Ипотека уже оформлена',
        'Сначала заверши выплаты по текущей ипотеке на экране «Жизнь».'
      );
      return;
    }

    try {
      setCreatingMortgage(true);

      const success = await startMortgage({
        totalSeconds: selectedOffer.gameDurationSeconds,
        downPayment: selectedOffer.downPayment,
        propertyId: selectedProperty.id,
        propertyTitle: selectedProperty.title,
        offerId: selectedOffer.id,
        bankName: selectedOffer.bankName,
        monthlyPayment: selectedOffer.monthlyPayment,
        totalPayment: selectedOffer.totalPayment,
        overpayment: selectedOffer.overpayment,
      });

      if (!success) {
        Alert.alert(
          'Не удалось оформить ипотеку',
          `Проверь уровень, выбранное жильё и первый взнос: ${formatFinCoin(
            selectedOffer.downPayment
          )}.`
        );
        return;
      }

      Alert.alert(
        'Ипотека оформлена!',
        `Ты взял ипотеку на «${selectedProperty.title}» через ${
          selectedOffer.bankName
        }. Первый взнос составил ${formatFinCoin(selectedOffer.downPayment)}.`
      );

      navigation.navigate('Challenges');
    } catch (error) {
      Alert.alert(
        'Ошибка оформления',
        'Не удалось оформить ипотеку. Попробуй снова.'
      );
    } finally {
      setCreatingMortgage(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.85}
          onPress={handleGoBack}
        >
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Ипотека</Text>

        <Text style={styles.subtitle}>
          Сначала выбери недвижимость из раздела «Челленджи», затем сравни
          ипотечные условия и оформи покупку через банк.
        </Text>

        {mortgageStatus === 'locked' && (
          <View style={styles.lockedInfoCard}>
            <Text style={styles.lockedInfoTitle}>Ипотека пока закрыта</Text>

            <Text style={styles.lockedInfoText}>
              Ипотека откроется на 3 уровне. Продолжай выполнять миссии и
              получать опыт.
            </Text>
          </View>
        )}

        {mortgageStatus === 'completed' && (
          <View style={styles.completedInfoCard}>
            <Text style={styles.completedInfoTitle}>Ипотека выплачена!</Text>

            <Text style={styles.completedInfoText}>
              Ты успешно завершил выплаты. Теперь можно выбрать новое жильё и
              оформить другую ипотеку.
            </Text>
          </View>
        )}

        {mortgageStatus === 'active' && (
          <View style={styles.activeInfoCard}>
            <Text style={styles.activeInfoTitle}>Ипотека уже оформлена</Text>

            <Text style={styles.activeInfoText}>
              Сначала заверши выплаты по текущей ипотеке на экране «Жизнь», а
              затем выбирай новое предложение.
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>1. Выбери жильё</Text>

        {scaledProperties.map((property) => {
          const isSelected = selectedPropertyId === property.id;
          const locked = level < property.requiredLevel;
          const owned = ownedPropertyId === property.id;
          const disabled = mortgageUnavailable || locked || owned;

          return (
            <TouchableOpacity
              key={property.id}
              style={[
                styles.propertyCard,
                isSelected && styles.propertyCardSelected,
                disabled && styles.propertyCardDisabled,
              ]}
              activeOpacity={0.92}
              onPress={() => handleSelectProperty(property)}
              disabled={disabled}
            >
              <View style={styles.propertyHeader}>
                <View style={styles.propertyTextBlock}>
                  <Text style={styles.propertyTitle}>{property.title}</Text>

                  <Text style={styles.propertyDescription}>
                    {property.description}
                  </Text>
                </View>

                <Text style={styles.propertyPrice}>
                  {property.price} FC
                </Text>
              </View>

              <View style={styles.propertyMetaRow}>
                <Text style={styles.propertyMetaText}>
                  Требуется уровень: {property.requiredLevel}
                </Text>

                {owned ? (
                  <Text style={styles.propertyOwnedText}>Куплено</Text>
                ) : locked ? (
                  <Text style={styles.propertyLockedText}>Закрыто</Text>
                ) : isSelected ? (
                  <Text style={styles.propertySelectedText}>Выбрано</Text>
                ) : (
                  <Text style={styles.propertyAvailableText}>Доступно</Text>
                )}
              </View>

              <Text style={styles.propertyBonus}>Бонус: {property.bonus}</Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.sectionTitle}>2. Выбери предложение</Text>

        {scaledMortgageOffers.map((offer) => {
          const isSelected = selectedOfferId === offer.id;
          const isRecommended = advice?.recommendedOfferId === offer.id;

          return (
            <TouchableOpacity
              key={offer.id}
              style={[
                styles.offerCard,
                isSelected && styles.offerCardSelected,
                mortgageUnavailable && styles.offerCardDisabled,
              ]}
              activeOpacity={0.92}
              onPress={() => handleSelectOffer(offer)}
              disabled={mortgageUnavailable}
            >
              <View style={styles.offerHeader}>
                <Text style={styles.bankName}>{offer.bankName}</Text>

                {isRecommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedBadgeText}>Выбор ИИ</Text>
                  </View>
                )}
              </View>

              <Text style={styles.offerDescription}>{offer.description}</Text>

              <View style={styles.statsBlock}>
                <Text style={styles.statText}>Ставка: {offer.rate}%</Text>

                <Text style={styles.statText}>Срок: {offer.years} лет</Text>

                <Text style={styles.statText}>
                  Платёж: {formatFinCoin(offer.monthlyPayment)}
                </Text>

                <Text style={styles.statText}>
                  Переплата: {formatFinCoin(offer.overpayment)}
                </Text>

                <Text style={styles.statText}>
                  Первый взнос: {formatFinCoin(offer.downPayment)}
                </Text>

                <Text style={styles.statText}>
                  Время выплаты: {offer.gameDurationSeconds} сек.
                </Text>
              </View>

              <View style={styles.offerFooter}>
                <Text style={styles.chooseHint}>
                  {isSelected ? 'Выбранный вариант' : 'Выбрать ипотеку'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[
            styles.aiButton,
            (loadingAdvice || mortgageUnavailable) && styles.aiButtonDisabled,
          ]}
          onPress={handleAskAi}
          activeOpacity={0.88}
          disabled={loadingAdvice || mortgageUnavailable}
        >
          <Text style={styles.aiButtonText}>
            {loadingAdvice
              ? 'ИИ сравнивает варианты...'
              : `Получить совет ИИ за ${AI_ADVICE_COST} FinCoin`}
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
            <Text style={styles.adviceTitle}>Финансовый советник</Text>

            <Text style={styles.adviceSummary}>{advice.summary}</Text>

            <Text style={styles.adviceReason}>
              {advice.recommendationReason}
            </Text>

            <Text style={styles.tradeoffTitle}>Обрати внимание:</Text>

            {advice.tradeoffs.map((item, index) => (
              <Text key={`${item}-${index}`} style={styles.tradeoffText}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.createButton,
            createButtonDisabled && styles.createButtonDisabled,
          ]}
          onPress={handleCreateMortgage}
          activeOpacity={0.88}
          disabled={createButtonDisabled}
        >
          <Text style={styles.createButtonText}>
            {creatingMortgage
              ? 'Оформляем ипотеку...'
              : selectedProperty
              ? `Оформить ипотеку на «${selectedProperty.title}»`
              : 'Сначала выбери жильё'}
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

  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primaryDark,
    marginBottom: 12,
    marginTop: 4,
  },

  lockedInfoCard: {
    backgroundColor: '#FDECEC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F4C7C7',
    marginBottom: 16,
  },

  lockedInfoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#8A2E2E',
    marginBottom: 6,
  },

  lockedInfoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6E3434',
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

  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    marginBottom: 14,
  },

  propertyCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#F8FBFA',
  },

  propertyCardDisabled: {
    opacity: 0.6,
  },

  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },

  propertyTextBlock: {
    flex: 1,
  },

  propertyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primaryDark,
  },

  propertyDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#586763',
  },

  propertyPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
    textAlign: 'right',
  },

  propertyMetaRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  propertyMetaText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#5E6E69',
  },

  propertySelectedText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
  },

  propertyAvailableText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
  },

  propertyOwnedText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.success,
  },

  propertyLockedText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.danger,
  },

  propertyBonus: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
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
    lineHeight: 21,
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
    paddingHorizontal: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },

  aiButtonDisabled: {
    opacity: 0.6,
  },

  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
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
    paddingHorizontal: 14,
    alignItems: 'center',
  },

  createButtonDisabled: {
    opacity: 0.6,
  },

  createButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
    textAlign: 'center',
  },
});