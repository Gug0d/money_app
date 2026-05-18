import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import colors from '../../constants/colors';
import TutorialTarget from '../../components/tutorial/TutorialTarget';
import { Mission } from '../../types/Mission';
import { MissionsStackParamList } from './MissionDetailsScreen';

type Props = NativeStackScreenProps<MissionsStackParamList, 'MissionsList'>;

const missions: Mission[] = [
  {
    id: 'm001',
    title: 'Личный бюджет',
    description: 'Научись распределять доходы и расходы без дефицита.',
    difficulty: 'Легко',
    xpReward: 30,
    finCoinReward: 10,
    type: 'quiz',
    question: 'Как лучше поступить с ежемесячным доходом?',
    options: [
      {
        id: 'm001_o1',
        text: 'Потратить всё сразу на развлечения',
        isCorrect: false,
        explanation:
          'Так ты не сможешь контролировать расходы и ничего не отложишь.',
        xp: 5,
        finCoin: 2,
      },
      {
        id: 'm001_o2',
        text: 'Сначала распределить деньги на обязательные траты, накопления и личные расходы',
        isCorrect: true,
        explanation: 'Это правильный подход: сначала план, потом траты.',
        xp: 30,
        finCoin: 10,
      },
      {
        id: 'm001_o3',
        text: 'Вообще не вести учёт денег',
        isCorrect: false,
        explanation: 'Без учёта сложно понять, куда уходят деньги.',
        xp: 5,
        finCoin: 2,
      },
    ],
  },
  {
    id: 'm002',
    title: 'Финансовая подушка',
    description: 'Собери резерв на случай непредвиденных ситуаций.',
    difficulty: 'Средне',
    xpReward: 45,
    finCoinReward: 20,
    type: 'decision',
    question: 'Что лучше сделать, если у тебя неожиданно сломался телефон?',
    options: [
      {
        id: 'm002_o1',
        text: 'Взять дорогой кредит на новый телефон без расчётов',
        isCorrect: false,
        explanation:
          'Импульсивный кредит может создать лишнюю долговую нагрузку.',
        xp: 10,
        finCoin: 5,
      },
      {
        id: 'm002_o2',
        text: 'Использовать часть финансовой подушки или выбрать более доступное решение',
        isCorrect: true,
        explanation:
          'Финансовая подушка нужна именно для непредвиденных ситуаций.',
        xp: 45,
        finCoin: 20,
      },
      {
        id: 'm002_o3',
        text: 'Попросить деньги у всех знакомых без плана возврата',
        isCorrect: false,
        explanation:
          'Это неустойчивое решение и может привести к проблемам.',
        xp: 10,
        finCoin: 5,
      },
    ],
  },
  {
    id: 'm003',
    title: 'Банковская карта',
    description: 'Разберись, как безопасно пользоваться картой и кэшбэком.',
    difficulty: 'Легко',
    xpReward: 35,
    finCoinReward: 15,
    type: 'quiz',
    question: 'Как безопаснее всего пользоваться банковской картой в интернете?',
    options: [
      {
        id: 'm003_o1',
        text: 'Сообщать CVV-код друзьям, если они просят оплатить покупку',
        isCorrect: false,
        explanation: 'CVV и данные карты нельзя никому передавать.',
        xp: 5,
        finCoin: 2,
      },
      {
        id: 'm003_o2',
        text: 'Покупать только на проверенных сайтах и никому не сообщать данные карты',
        isCorrect: true,
        explanation:
          'Это базовое правило безопасности при онлайн-оплате.',
        xp: 35,
        finCoin: 15,
      },
      {
        id: 'm003_o3',
        text: 'Хранить пин-код в заметках без защиты',
        isCorrect: false,
        explanation:
          'Так данные карты могут легко попасть к посторонним.',
        xp: 5,
        finCoin: 2,
      },
    ],
  },
  {
    id: 'm004',
    title: 'Первый кредит',
    description: 'Оцени риски и выбери разумное финансовое решение.',
    difficulty: 'Сложно',
    xpReward: 60,
    finCoinReward: 35,
    type: 'decision',
    question: 'Ты хочешь взять первый кредит. Что нужно сделать в первую очередь?',
    options: [
      {
        id: 'm004_o1',
        text: 'Сразу подписать договор, не читая условия',
        isCorrect: false,
        explanation: 'Так можно пропустить ставку, комиссии и штрафы.',
        xp: 10,
        finCoin: 5,
      },
      {
        id: 'm004_o2',
        text: 'Сравнить предложения, посчитать переплату и проверить, потянешь ли платёж',
        isCorrect: true,
        explanation:
          'Перед кредитом всегда нужно оценить полную стоимость и свою нагрузку.',
        xp: 60,
        finCoin: 35,
      },
      {
        id: 'm004_o3',
        text: 'Взять максимальную сумму, которую одобрят',
        isCorrect: false,
        explanation:
          'Одобренная сумма не означает, что она безопасна для бюджета.',
        xp: 10,
        finCoin: 5,
      },
    ],
  },
];

const getDifficultyStyles = (difficulty: Mission['difficulty']) => {
  switch (difficulty) {
    case 'Легко':
      return {
        backgroundColor: '#E4F7EE',
        textColor: '#1F8A5B',
      };
    case 'Средне':
      return {
        backgroundColor: '#FFF1D6',
        textColor: '#B7791F',
      };
    case 'Сложно':
      return {
        backgroundColor: '#FDE2E1',
        textColor: '#C94C4C',
      };
    default:
      return {
        backgroundColor: '#E7F4F1',
        textColor: colors.primary,
      };
  }
};

export default function MissionsScreen({ navigation }: Props) {
  const renderMission = ({ item, index }: { item: Mission; index: number }) => {
    const difficultyStyle = getDifficultyStyles(item.difficulty);

    const card = (
      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <View style={styles.cardTopRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.cardTitle}>{item.title}</Text>

            <View style={styles.typeRow}>
              <MaterialCommunityIcons
                name={
                  item.type === 'quiz'
                    ? 'file-question-outline'
                    : 'swap-horizontal-bold'
                }
                size={16}
                color={colors.primary}
              />

              <Text style={styles.cardType}>
                {item.type === 'quiz' ? 'Квиз' : 'Сценарий выбора'}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.badge,
              { backgroundColor: difficultyStyle.backgroundColor },
            ]}
          >
            <Text
              style={[styles.badgeText, { color: difficultyStyle.textColor }]}
            >
              {item.difficulty}
            </Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>{item.description}</Text>

        <View style={styles.rewardsRow}>
          <View style={styles.rewardCapsule}>
            <Ionicons name="flash" size={16} color="#D9A520" />
            <Text style={styles.rewardCapsuleText}>{item.xpReward} XP</Text>
          </View>

          <View style={styles.rewardCapsule}>
            <Ionicons name="logo-usd" size={16} color="#D9A520" />
            <Text style={styles.rewardCapsuleText}>
              {item.finCoinReward} FinCoin
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('MissionDetails', { mission: item })
          }
        >
          <Text style={styles.startButtonText}>Начать</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );

    if (index === 0) {
      return (
        <TutorialTarget id="mission-first-card">
          {card}
        </TutorialTarget>
      );
    }

    return card;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Миссии</Text>
        <Text style={styles.subtitle}>
          Выполняй задания и получай XP и FinCoin
        </Text>
      </View>

      <FlatList
        data={missions}
        keyExtractor={(item) => item.id}
        renderItem={renderMission}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E4',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardType: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  badge: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#31433F',
    marginTop: 16,
    marginBottom: 16,
  },
  rewardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  rewardCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E5',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rewardCapsuleText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '800',
    color: colors.textDark,
  },
  startButton: {
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#D9A520',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textDark,
  },
});