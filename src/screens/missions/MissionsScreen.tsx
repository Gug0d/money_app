// src/screens/missions/MissionsScreen.tsx

import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
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
import { generateAiMissions } from '../../services/ai';
import { AiGameState } from '../../types/ai';
import { Mission } from '../../types/Mission';
import { MissionsStackParamList } from './MissionDetailsScreen';

type Props = NativeStackScreenProps<MissionsStackParamList, 'MissionsList'>;

export default function MissionsScreen({ navigation }: Props) {
  const game = useGame();

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMissions, setAiMissions] = useState<Mission[]>([]);

  const gameState: AiGameState = useMemo(
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

  const handleGenerateMissions = async () => {
    if (isGenerating) {
      return;
    }

    try {
      setIsGenerating(true);

      const missions = await generateAiMissions({
        level: game.level,
        count: 5,
        gameState,
      });

      setAiMissions(missions);

      Alert.alert(
        'Готово',
        `ИИ сгенерировал ${missions.length} миссий разной сложности.`
      );
    } catch (error: any) {
      console.log('[MissionsScreen] generate missions error:', error);

      Alert.alert(
        'Ошибка',
        error?.message ||
          'Не получилось сгенерировать миссии. Проверь, что локальный ИИ-сервер запущен.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const openMission = (mission: Mission) => {
    navigation.navigate('MissionDetails', {
      mission,
    });
  };

  const renderMission = ({ item }: { item: Mission }) => {
    return (
      <TouchableOpacity
        style={styles.missionCard}
        activeOpacity={0.88}
        onPress={() => openMission(item)}
      >
        <View style={styles.missionTopRow}>
          <View style={styles.missionIconWrap}>
            <Ionicons name="sparkles" size={22} color={colors.primary} />
          </View>

          <View style={styles.missionHeaderText}>
            <Text
              style={[
                styles.missionDifficulty,
                item.difficulty === 'Средне' && styles.mediumDifficulty,
                item.difficulty === 'Сложно' && styles.hardDifficulty,
              ]}
            >
              {item.difficulty}
            </Text>

            <Text style={styles.missionTitle}>{item.title}</Text>
          </View>
        </View>

        <Text style={styles.missionDescription}>{item.description}</Text>

        {item.question ? (
          <Text style={styles.missionQuestion} numberOfLines={2}>
            {item.question}
          </Text>
        ) : null}

        <View style={styles.rewardRow}>
          <View style={styles.rewardChip}>
            <Ionicons name="star-outline" size={15} color="#D9A520" />
            <Text style={styles.rewardText}>+{item.xpReward} XP</Text>
          </View>

          <View style={styles.rewardChip}>
            <Ionicons name="wallet-outline" size={15} color={colors.primary} />
            <Text style={styles.rewardText}>+{item.finCoinReward} FC</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={aiMissions}
        keyExtractor={(item) => item.id}
        renderItem={renderMission}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Цели</Text>
              <Text style={styles.subtitle}>
                Проходи миссии, отвечай на вопросы и развивай финансовую
                грамотность
              </Text>
            </View>

            <TutorialTarget id="missions-screen">
              <View style={styles.generatorCard}>
                <View style={styles.generatorTopRow}>
                  <View style={styles.generatorIconWrap}>
                    <Ionicons
                      name="sparkles"
                      size={28}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.generatorTextBlock}>
                    <Text style={styles.generatorTitle}>
                      ИИ-генератор миссий
                    </Text>
                    <Text style={styles.generatorSubtitle}>
                      Создаёт сразу 5 вопросов разной сложности под твой уровень
                    </Text>
                  </View>
                </View>

                <View style={styles.difficultyRow}>
                  <View style={styles.difficultyChip}>
                    <Text style={styles.difficultyChipText}>Легко</Text>
                  </View>

                  <View style={styles.difficultyChip}>
                    <Text style={styles.difficultyChipText}>Средне</Text>
                  </View>

                  <View style={styles.difficultyChip}>
                    <Text style={styles.difficultyChipText}>Сложно</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    isGenerating && styles.generateButtonDisabled,
                  ]}
                  activeOpacity={0.88}
                  onPress={handleGenerateMissions}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="add-circle" size={22} color="#FFFFFF" />
                      <Text style={styles.generateButtonText}>
                        Сгенерировать 5 миссий
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </TutorialTarget>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Сгенерированные миссии</Text>
              <Text style={styles.sectionSubtitle}>
                Нажми на карточку, чтобы пройти миссию
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={34} color="#8A9A95" />

            <Text style={styles.emptyTitle}>Миссий пока нет</Text>

            <Text style={styles.emptyText}>
              Нажми «Сгенерировать 5 миссий», чтобы ИИ создал набор вопросов.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E4',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    lineHeight: 22,
    color: '#5E6E69',
  },
  generatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
    marginBottom: 22,
  },
  generatorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  generatorIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EAF6F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  generatorTextBlock: {
    flex: 1,
  },
  generatorTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textDark,
  },
  generatorSubtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 19,
    color: '#6A7975',
  },
  difficultyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 16,
  },
  difficultyChip: {
    backgroundColor: '#FFF8E5',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F1E3B4',
  },
  difficultyChipText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.textDark,
  },
  generateButton: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textDark,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6A7975',
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    marginBottom: 14,
  },
  missionTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  missionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF6F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  missionHeaderText: {
    flex: 1,
  },
  missionDifficulty: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2E7D32',
    marginBottom: 4,
  },
  mediumDifficulty: {
    color: '#9C7A1C',
  },
  hardDifficulty: {
    color: '#C62828',
  },
  missionTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
    color: colors.textDark,
  },
  missionDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#53625D',
    marginBottom: 10,
  },
  missionQuestion: {
    fontSize: 15,
    lineHeight: 22,
    color: '#21312E',
    fontWeight: '700',
    marginBottom: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E5',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  rewardText: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '900',
    color: colors.textDark,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '900',
    color: colors.textDark,
  },
  emptyText: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: '#6A7975',
    textAlign: 'center',
  },
});