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
import colors from '../../constants/colors';
import { Mission } from '../../types/Mission';

const missions: Mission[] = [
  {
    id: 'm001',
    title: 'Личный бюджет',
    description: 'Научись распределять доходы и расходы без дефицита.',
    difficulty: 'Легко',
    xpReward: 30,
    finCoinReward: 10,
    type: 'quiz',
  },
  {
    id: 'm002',
    title: 'Финансовая подушка',
    description: 'Собери резерв на случай непредвиденных ситуаций.',
    difficulty: 'Средне',
    xpReward: 45,
    finCoinReward: 20,
    type: 'decision',
  },
  {
    id: 'm003',
    title: 'Банковская карта',
    description: 'Разберись, как безопасно пользоваться картой и кэшбэком.',
    difficulty: 'Легко',
    xpReward: 35,
    finCoinReward: 15,
    type: 'quiz',
  },
  {
    id: 'm004',
    title: 'Первый кредит',
    description: 'Оцени риски и выбери разумное финансовое решение.',
    difficulty: 'Сложно',
    xpReward: 60,
    finCoinReward: 35,
    type: 'decision',
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

export default function MissionsScreen() {
  const renderMission = ({ item }: { item: Mission }) => {
    const difficultyStyle = getDifficultyStyles(item.difficulty);

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <View style={styles.cardTopRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.typeRow}>
              <MaterialCommunityIcons
                name={item.type === 'quiz' ? 'file-question-outline' : 'swap-horizontal-bold'}
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
            <Text style={[styles.badgeText, { color: difficultyStyle.textColor }]}>
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
            <Text style={styles.rewardCapsuleText}>{item.finCoinReward} FinCoin</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} activeOpacity={0.85}>
          <Text style={styles.startButtonText}>Начать</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
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