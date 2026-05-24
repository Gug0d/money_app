// src/screens/missions/MissionsScreen.tsx

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import colors from '../../constants/colors';
import TutorialTarget from '../../components/tutorial/TutorialTarget';
import { useGame } from '../../store/GameContext';
import { getMissionXpReward } from '../../store/gameConfig';
import { generateAiMissions } from '../../services/ai';
import { Mission } from '../../types/Mission';
import { RootTabParamList } from '../../navigation/AppNavigator';
import { MissionsStackParamList } from './MissionDetailsScreen';

type Props = CompositeScreenProps<
  NativeStackScreenProps<MissionsStackParamList, 'MissionsList'>,
  BottomTabScreenProps<RootTabParamList>
>;

let cachedMissions: Mission[] = [];
let cachedIsAiFallback = false;
let cachedMissionsInitialized = false;

const fallbackMissions: Mission[] = [
  {
    id: 'fallback_budget_1',
    title: 'Планирование расходов',
    description: 'Проверь, умеешь ли ты оценивать траты перед покупкой.',
    difficulty: 'Легко',
    xpReward: 25,
    finCoinReward: 15,
    type: 'quiz',
    question: 'Что лучше сделать перед крупной покупкой?',
    options: [
      {
        id: 'a',
        text: 'Проверить бюджет и обязательные расходы',
        isCorrect: true,
        explanation:
          'Так игрок понимает, хватит ли денег на важные платежи.',
      },
      {
        id: 'b',
        text: 'Купить сразу, пока хочется',
        isCorrect: false,
        explanation:
          'Импульсивная покупка может привести к нехватке денег.',
      },
      {
        id: 'c',
        text: 'Потратить все FinCoin',
        isCorrect: false,
        explanation: 'Если потратить всё, у игрока не останется резерва.',
      },
    ],
  },
  {
    id: 'fallback_home_1',
    title: 'Домашние счета',
    description: 'Разберись, зачем оплачивать обязательные расходы вовремя.',
    difficulty: 'Легко',
    xpReward: 30,
    finCoinReward: 18,
    type: 'quiz',
    question: 'Почему лучше оплачивать счета вовремя?',
    options: [
      {
        id: 'a',
        text: 'Чтобы избежать штрафов и сохранить дисциплину',
        isCorrect: true,
        explanation:
          'Своевременная оплата помогает избежать лишних расходов.',
      },
      {
        id: 'b',
        text: 'Чтобы быстрее потратить деньги',
        isCorrect: false,
        explanation: 'Цель не в быстрой трате, а в контроле обязательств.',
      },
      {
        id: 'c',
        text: 'Потому что счета никак не влияют на игру',
        isCorrect: false,
        explanation: 'В игре счета могут влиять на баланс и состояние дома.',
      },
    ],
  },
  {
    id: 'fallback_deposit_1',
    title: 'Вклад или трата',
    description: 'Выбери более грамотное решение для свободных FinCoin.',
    difficulty: 'Средне',
    xpReward: 40,
    finCoinReward: 22,
    type: 'decision',
    question:
      'У игрока есть свободные FinCoin. Что будет более разумным решением?',
    options: [
      {
        id: 'a',
        text: 'Сначала проверить обязательные расходы, потом открыть вклад',
        isCorrect: true,
        explanation:
          'Перед вкладом важно убедиться, что денег хватит на счета.',
      },
      {
        id: 'b',
        text: 'Открыть вклад на все деньги без проверки счетов',
        isCorrect: false,
        explanation:
          'Если вложить всё, может не хватить денег на обязательные расходы.',
      },
      {
        id: 'c',
        text: 'Потратить всё на случайную покупку',
        isCorrect: false,
        explanation:
          'Такая трата не помогает создать финансовую устойчивость.',
      },
    ],
  },
  {
    id: 'fallback_credit_1',
    title: 'Ответственный кредит',
    description: 'Проверь, понимаешь ли ты кредитную нагрузку.',
    difficulty: 'Средне',
    xpReward: 45,
    finCoinReward: 25,
    type: 'quiz',
    question: 'Что важно учитывать перед оформлением кредита?',
    options: [
      {
        id: 'a',
        text: 'Платёж, срок и общую переплату',
        isCorrect: true,
        explanation:
          'Кредит нужно оценивать не только по сумме, но и по будущим платежам.',
      },
      {
        id: 'b',
        text: 'Только сумму, которую дают сразу',
        isCorrect: false,
        explanation:
          'Важно помнить, что кредит нужно возвращать с процентами.',
      },
      {
        id: 'c',
        text: 'Можно ли не возвращать долг',
        isCorrect: false,
        explanation:
          'Просрочки приводят к штрафам и ухудшают положение игрока.',
      },
    ],
  },
  {
    id: 'fallback_strategy_1',
    title: 'Финансовая стратегия',
    description: 'Выбери решение для долгосрочной стабильности.',
    difficulty: 'Сложно',
    xpReward: 60,
    finCoinReward: 35,
    type: 'decision',
    question:
      'У игрока есть кредит, неоплаченные счета и возможность купить буст. Что лучше сделать сначала?',
    options: [
      {
        id: 'a',
        text: 'Сначала закрыть обязательные платежи',
        isCorrect: true,
        explanation:
          'Обязательные платежи важнее дополнительных покупок и снижают риск штрафов.',
      },
      {
        id: 'b',
        text: 'Купить буст, не проверяя счета и кредит',
        isCorrect: false,
        explanation: 'Буст может быть полезен, но обязательства обычно важнее.',
      },
      {
        id: 'c',
        text: 'Игнорировать платежи и ждать',
        isCorrect: false,
        explanation:
          'Ожидание может привести к штрафам и ухудшению состояния игрока.',
      },
    ],
  },
];

function getDifficultyStyle(difficulty: Mission['difficulty']) {
  switch (difficulty) {
    case 'Легко':
      return styles.easyBadge;
    case 'Средне':
      return styles.mediumBadge;
    case 'Сложно':
      return styles.hardBadge;
    default:
      return styles.easyBadge;
  }
}

function getDifficultyIcon(difficulty: Mission['difficulty']) {
  switch (difficulty) {
    case 'Легко':
      return 'leaf-outline';
    case 'Средне':
      return 'flash-outline';
    case 'Сложно':
      return 'flame-outline';
    default:
      return 'leaf-outline';
  }
}

export default function MissionsScreen({ navigation, route }: Props) {
  const game = useGame();

  const [missions, setMissions] = useState<Mission[]>(cachedMissions);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiFallback, setIsAiFallback] = useState(cachedIsAiFallback);

  const gameState = useMemo(
    () => ({
      level: game.level,
      xp: game.xp,
      finCoin: game.finCoin,

      mortgageStatus: game.mortgageStatus,
      mortgage: game.mortgage,

      activeDeposit: game.activeDeposit,
      depositRemainingSeconds: game.depositRemainingSeconds,

      activeLoan: game.activeLoan,
      loanRemainingSeconds: game.loanRemainingSeconds,

      homeBills: game.homeBills,
      homeComfort: game.homeComfort,
      homeDiscipline: game.homeDiscipline,
      homeEvent: game.homeEvent,

      activeJobId: game.activeJobId,
      ownedPropertyId: game.ownedPropertyId,
      activeBoostIds: game.activeBoostIds,
      boostOfferIds: game.boostOfferIds,
      nextSalaryAvailableAt: game.nextSalaryAvailableAt,
    }),
    [
      game.level,
      game.xp,
      game.finCoin,
      game.mortgageStatus,
      game.mortgage,
      game.activeDeposit,
      game.depositRemainingSeconds,
      game.activeLoan,
      game.loanRemainingSeconds,
      game.homeBills,
      game.homeComfort,
      game.homeDiscipline,
      game.homeEvent,
      game.activeJobId,
      game.ownedPropertyId,
      game.activeBoostIds,
      game.boostOfferIds,
      game.nextSalaryAvailableAt,
    ]
  );

  const loadAiMissions = async () => {
    setIsLoading(true);
    setIsAiFallback(false);

    try {
      const generatedMissions = await generateAiMissions({
        level: game.level,
        count: 5,
        gameState,
      });

      if (!generatedMissions || generatedMissions.length === 0) {
        cachedMissions = fallbackMissions;
        cachedIsAiFallback = true;
        cachedMissionsInitialized = true;

        setMissions(cachedMissions);
        setIsAiFallback(true);

        return;
      }

      cachedMissions = generatedMissions;
      cachedIsAiFallback = false;
      cachedMissionsInitialized = true;

      setMissions(cachedMissions);
      setIsAiFallback(false);
    } catch (error) {
      console.log('[MissionsScreen] generate missions error:', error);

      cachedMissions = fallbackMissions;
      cachedIsAiFallback = true;
      cachedMissionsInitialized = true;

      setMissions(cachedMissions);
      setIsAiFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cachedMissionsInitialized) {
      return;
    }

    loadAiMissions();
  }, []);

  useEffect(() => {
    const completedMissionId = route.params?.completedMissionId;

    if (!completedMissionId) {
      return;
    }

    cachedMissions = cachedMissions.filter(
      (mission) => mission.id !== completedMissionId
    );

    setMissions(cachedMissions);

    navigation.setParams({
      completedMissionId: undefined,
    });
  }, [route.params?.completedMissionId, navigation]);

  const handleGenerateNewMissions = async () => {
    if (missions.length > 0) {
      return;
    }

    await loadAiMissions();
  };

  const handleOpenMission = (mission: Mission) => {
    navigation.navigate('MissionDetails', {
      mission,
    });
  };

  const renderMission = ({ item }: { item: Mission }) => {
    const xpReward = getMissionXpReward(item.difficulty, game.level);

    return (
      <TouchableOpacity
        style={styles.missionCard}
        activeOpacity={0.88}
        onPress={() => handleOpenMission(item)}
      >
        <View style={styles.missionHeader}>
          <View
            style={[
              styles.difficultyBadge,
              getDifficultyStyle(item.difficulty),
            ]}
          >
            <Ionicons
              name={getDifficultyIcon(item.difficulty)}
              size={15}
              color={colors.primaryDark}
            />
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>

          <View style={styles.rewardRow}>
            <View style={styles.rewardChip}>
              <Ionicons name="star-outline" size={15} color="#D9A520" />
              <Text style={styles.rewardText}>{xpReward} XP</Text>
            </View>

            <View style={styles.rewardChip}>
              <Ionicons name="logo-usd" size={15} color="#D9A520" />
              <Text style={styles.rewardText}>{item.finCoinReward} FC</Text>
            </View>
          </View>
        </View>

        <Text style={styles.missionTitle}>{item.title}</Text>

        <Text style={styles.missionDescription}>{item.description}</Text>

        <View style={styles.missionFooter}>
          <Text style={styles.missionType}>
            {item.type === 'decision' ? 'Финансовое решение' : 'Викторина'}
          </Text>

          <View style={styles.openMissionButton}>
            <Text style={styles.openMissionButtonText}>Открыть</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyMissions = () => {
    if (isLoading) {
      return null;
    }

    return (
      <View style={styles.emptyBox}>
        <Ionicons
          name="checkmark-done-circle"
          size={56}
          color={colors.primary}
        />

        <Text style={styles.emptyTitle}>Все миссии выполнены</Text>

        <Text style={styles.emptyText}>
          Ты прошёл весь текущий список миссий. Сгенерируй новые задания, чтобы
          продолжить получать опыт и FinCoin.
        </Text>

        <TouchableOpacity
          style={styles.emptyButton}
          activeOpacity={0.9}
          onPress={handleGenerateNewMissions}
          disabled={isLoading}
        >
          <Text style={styles.emptyButtonText}>
            Сгенерировать новые миссии
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('Life', {
                screen: 'LifeMain',
              })
            }
          >
            <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
          </TouchableOpacity>

          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>Миссии</Text>
            <Text style={styles.subtitle}>
              Выполняй задания, получай опыт и FinCoin
            </Text>
          </View>
        </View>

        <TutorialTarget id="missions-list">
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="checkmark-circle"
                size={34}
                color={colors.primary}
              />
            </View>

            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>Развивай финансовые навыки</Text>
              <Text style={styles.heroDescription}>
                Отвечай на вопросы, принимай решения и повышай уровень героя.
              </Text>
            </View>
          </View>
        </TutorialTarget>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Уровень</Text>
            <Text style={styles.statValue}>{game.level}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Опыт</Text>
            <Text style={styles.statValue}>{game.xp} XP</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Монеты</Text>
            <Text style={styles.statValue}>{game.finCoin}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Доступные миссии</Text>

            {isAiFallback ? (
              <Text style={styles.sectionSubtitle}>
                Показаны стандартные миссии
              </Text>
            ) : (
              <Text style={styles.sectionSubtitle}>
                Миссии сгенерированы AI под текущую ситуацию
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.refreshButton,
              missions.length > 0 && styles.refreshButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleGenerateNewMissions}
            disabled={isLoading || missions.length > 0}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primaryDark} />
            ) : (
              <Ionicons
                name="refresh"
                size={20}
                color={missions.length > 0 ? '#B8B0A0' : colors.primaryDark}
              />
            )}
          </TouchableOpacity>
        </View>

        {isLoading && missions.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Генерируем миссии...</Text>
          </View>
        ) : (
          <FlatList
            data={missions}
            keyExtractor={(item) => item.id}
            renderItem={renderMission}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyMissions}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E4',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F6E7A8',
    borderWidth: 2,
    borderColor: '#E1BE52',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextBlock: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 21,
    color: '#5E6E69',
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAF6F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  heroDescription: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    color: '#5E6E69',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7D6',
  },
  statLabel: {
    fontSize: 13,
    color: '#72817D',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  sectionSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#72817D',
  },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#F6E7A8',
    borderWidth: 1,
    borderColor: '#E1BE52',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonDisabled: {
    backgroundColor: '#EEE5D2',
    borderColor: '#D8CDB8',
  },
  listContent: {
    paddingBottom: 24,
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    marginBottom: 12,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  easyBadge: {
    backgroundColor: '#EAF6F3',
  },
  mediumBadge: {
    backgroundColor: '#FFF1C7',
  },
  hardBadge: {
    backgroundColor: '#FFE2D8',
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 6,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E5',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primaryDark,
    marginBottom: 6,
  },
  missionDescription: {
    fontSize: 15,
    lineHeight: 21,
    color: '#4B5D58',
    marginBottom: 14,
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  missionType: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#72817D',
  },
  openMissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 6,
  },
  openMissionButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#72817D',
  },
  emptyBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    marginTop: 20,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '900',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
    color: '#5E6E69',
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});