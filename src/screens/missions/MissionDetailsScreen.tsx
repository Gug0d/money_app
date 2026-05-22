// src/screens/missions/MissionDetailsScreen.tsx

import React, { useMemo, useState } from 'react';
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
import { useGame } from '../../store/GameContext';
import { Mission, MissionOption } from '../../types/Mission';

export type MissionsStackParamList = {
  MissionsList: undefined;
  MissionDetails: {
    mission: Mission;
  };
};

type Props = NativeStackScreenProps<MissionsStackParamList, 'MissionDetails'>;

export default function MissionDetailsScreen({ route, navigation }: Props) {
  const { mission } = route.params;
  const game = useGame();

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rewardGiven, setRewardGiven] = useState(false);

  const selectedOption = useMemo(() => {
    return mission.options?.find((option) => option.id === selectedOptionId);
  }, [mission.options, selectedOptionId]);

  const correctOption = useMemo(() => {
    return mission.options?.find((option) => option.isCorrect);
  }, [mission.options]);

  const handleSelectOption = async (option: MissionOption) => {
    if (isCompleted) {
      return;
    }

    setSelectedOptionId(option.id);
    setIsCompleted(true);

    if (option.isCorrect && !rewardGiven) {
      const xpReward = option.xp ?? mission.xpReward;
      const finCoinReward = option.finCoin ?? mission.finCoinReward;

      await game.addRewards(xpReward, finCoinReward);
      setRewardGiven(true);

      Alert.alert(
        'Верно!',
        `Ты получил ${xpReward} XP и ${finCoinReward} FC.`
      );

      return;
    }

    Alert.alert(
      'Неверно',
      correctOption
        ? `Правильный ответ: ${correctOption.text}`
        : 'Попробуй внимательнее изучить вопрос.'
    );
  };

  const handleFinish = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>

        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.iconWrap}>
              <Ionicons name="sparkles" size={30} color={colors.primary} />
            </View>

            <View style={styles.headerTextBlock}>
              <Text style={styles.difficulty}>{mission.difficulty}</Text>
              <Text style={styles.title}>{mission.title}</Text>
            </View>
          </View>

          <Text style={styles.description}>{mission.description}</Text>

          <View style={styles.rewardRow}>
            <View style={styles.rewardChip}>
              <Ionicons name="star-outline" size={16} color="#D9A520" />
              <Text style={styles.rewardText}>+{mission.xpReward} XP</Text>
            </View>

            <View style={styles.rewardChip}>
              <Ionicons name="wallet-outline" size={16} color={colors.primary} />
              <Text style={styles.rewardText}>+{mission.finCoinReward} FC</Text>
            </View>
          </View>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Вопрос</Text>
          <Text style={styles.questionText}>
            {mission.question || 'Какое решение будет финансово грамотным?'}
          </Text>
        </View>

        <View style={styles.optionsBlock}>
          <Text style={styles.sectionTitle}>Выбери ответ</Text>

          {mission.options?.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const showResult = isCompleted;
            const isCorrect = option.isCorrect;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                  showResult && isCorrect && styles.optionCardCorrect,
                  showResult && isSelected && !isCorrect && styles.optionCardWrong,
                ]}
                activeOpacity={0.86}
                onPress={() => handleSelectOption(option)}
                disabled={isCompleted}
              >
                <View style={styles.optionTopRow}>
                  <View
                    style={[
                      styles.optionLetter,
                      showResult && isCorrect && styles.optionLetterCorrect,
                      showResult &&
                        isSelected &&
                        !isCorrect &&
                        styles.optionLetterWrong,
                    ]}
                  >
                    <Text style={styles.optionLetterText}>
                      {option.id.toUpperCase()}
                    </Text>
                  </View>

                  <Text style={styles.optionText}>{option.text}</Text>
                </View>

                {showResult && option.explanation ? (
                  <Text style={styles.explanationText}>
                    {option.explanation}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {isCompleted ? (
          <View style={styles.resultCard}>
            <View style={styles.resultTopRow}>
              <Ionicons
                name={selectedOption?.isCorrect ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={selectedOption?.isCorrect ? colors.success : colors.danger}
              />

              <Text style={styles.resultTitle}>
                {selectedOption?.isCorrect ? 'Ответ верный' : 'Ответ неверный'}
              </Text>
            </View>

            <Text style={styles.resultText}>
              {selectedOption?.isCorrect
                ? 'Отлично! Ты принял финансово грамотное решение.'
                : correctOption
                ? `Правильный вариант: ${correctOption.text}`
                : 'Изучи объяснение и попробуй применить этот принцип в следующих миссиях.'}
            </Text>

            <TouchableOpacity
              style={styles.finishButton}
              activeOpacity={0.9}
              onPress={handleFinish}
            >
              <Text style={styles.finishButtonText}>Завершить</Text>
            </TouchableOpacity>
          </View>
        ) : null}
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 14,
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.primary,
  },
  headerCard: {
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
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EAF6F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTextBlock: {
    flex: 1,
  },
  difficulty: {
    fontSize: 13,
    fontWeight: '900',
    color: '#9C7A1C',
    marginBottom: 4,
  },
  title: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    color: colors.textDark,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#53625D',
    marginBottom: 14,
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
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  rewardText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '900',
    color: colors.textDark,
  },
  questionCard: {
    backgroundColor: '#FFF7DE',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1E3B4',
    marginBottom: 20,
  },
  questionLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#9C7A1C',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '900',
    color: colors.textDark,
  },
  optionsBlock: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    marginBottom: 12,
  },
  optionCardSelected: {
    borderColor: colors.primary,
  },
  optionCardCorrect: {
    borderColor: colors.success,
    backgroundColor: '#EEF8EF',
  },
  optionCardWrong: {
    borderColor: colors.danger,
    backgroundColor: '#FDEEEE',
  },
  optionTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  optionLetter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF6F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetterCorrect: {
    backgroundColor: '#DDF3DF',
  },
  optionLetterWrong: {
    backgroundColor: '#F7D4D4',
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '800',
    color: colors.textDark,
  },
  explanationText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#53625D',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE7D6',
  },
  resultTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.textDark,
  },
  resultText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#53625D',
    marginBottom: 16,
  },
  finishButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});