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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { Mission } from '../../types/Mission';

export type MissionsStackParamList = {
  MissionsList: undefined;
  MissionDetails: { mission: Mission };
};

type Props = NativeStackScreenProps<MissionsStackParamList, 'MissionDetails'>;

export default function MissionDetailsScreen({ route, navigation }: Props) {
  const { mission } = route.params;
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedOption = useMemo(
    () => mission.options?.find((option) => option.id === selectedOptionId),
    [mission.options, selectedOptionId]
  );

  const handleSubmit = () => {
    if (!selectedOptionId) {
      Alert.alert('Выберите вариант', 'Сначала выбери один из ответов.');
      return;
    }

    setSubmitted(true);
  };

  const handleFinish = () => {
    const xp = selectedOption?.xp ?? mission.xpReward;
    const finCoin = selectedOption?.finCoin ?? mission.finCoinReward;

    Alert.alert(
      'Миссия завершена',
      `Ты получил ${xp} XP и ${finCoin} FinCoin.`
    );

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primaryDark} />
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>

        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <Text style={styles.title}>{mission.title}</Text>

            <View style={styles.typeBadge}>
              <MaterialCommunityIcons
                name={
                  mission.type === 'quiz'
                    ? 'file-question-outline'
                    : 'swap-horizontal-bold'
                }
                size={16}
                color={colors.primary}
              />
              <Text style={styles.typeBadgeText}>
                {mission.type === 'quiz' ? 'Квиз' : 'Сценарий'}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{mission.description}</Text>

          <View style={styles.rewardRow}>
            <View style={styles.rewardChip}>
              <Ionicons name="flash" size={16} color="#D9A520" />
              <Text style={styles.rewardChipText}>{mission.xpReward} XP</Text>
            </View>

            <View style={styles.rewardChip}>
              <Ionicons name="logo-usd" size={16} color="#D9A520" />
              <Text style={styles.rewardChipText}>
                {mission.finCoinReward} FinCoin
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Вопрос</Text>
          <Text style={styles.questionText}>
            {mission.question ?? 'Выбери наиболее разумное финансовое решение.'}
          </Text>
        </View>

        <View style={styles.optionsBlock}>
          <Text style={styles.optionsTitle}>Варианты ответа</Text>

          {mission.options?.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const showCorrect = submitted && option.isCorrect;
            const showWrong = submitted && isSelected && !option.isCorrect;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                  showCorrect && styles.optionCardCorrect,
                  showWrong && styles.optionCardWrong,
                ]}
                activeOpacity={0.88}
                onPress={() => !submitted && setSelectedOptionId(option.id)}
              >
                <View style={styles.optionTopRow}>
                  <View style={styles.optionRadio}>
                    {isSelected && <View style={styles.optionRadioInner} />}
                  </View>

                  <Text style={styles.optionText}>{option.text}</Text>
                </View>

                {submitted && isSelected && option.explanation ? (
                  <Text style={styles.explanationText}>{option.explanation}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {!submitted ? (
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.88}
            onPress={handleSubmit}
          >
            <Text style={styles.actionButtonText}>Проверить ответ</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.88}
            onPress={handleFinish}
          >
            <Text style={styles.actionButtonText}>Завершить миссию</Text>
          </TouchableOpacity>
        )}
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
    paddingBottom: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    marginBottom: 16,
  },
  headerTopRow: {
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textDark,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF6F3',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  typeBadgeText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  description: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 24,
    color: '#31433F',
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E5',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rewardChipText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '800',
    color: colors.textDark,
  },
  questionCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  questionLabel: {
    fontSize: 14,
    color: '#D7F0EC',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  optionsBlock: {
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 14,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    marginBottom: 12,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F4FBF9',
  },
  optionCardCorrect: {
    borderColor: '#3FAF6C',
    backgroundColor: '#EAF8EF',
  },
  optionCardWrong: {
    borderColor: '#D96C6C',
    backgroundColor: '#FDECEC',
  },
  optionTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textDark,
    fontWeight: '600',
  },
  explanationText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#53625D',
  },
  actionButton: {
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textDark,
  },
});