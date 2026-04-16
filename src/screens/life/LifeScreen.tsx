import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import colors from '../../constants/colors';
import { useGame } from '../../store/GameContext';
import { LifeStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<LifeStackParamList, 'LifeMain'>;

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function LifeScreen({ navigation }: Props) {
  const {
    level,
    xp,
    finCoin,
    currentLevelXp,
    nextLevelXp,
    progressToNextLevel,
    mortgage,
    mortgageStatus,
    mortgageRemainingSeconds,
    isGameLoading,
    addTestXp,
    addTestCoins,
    reduceMortgageTime,
  } = useGame();

  const ACCELERATION_SECONDS = 15;
  const ACCELERATION_COST = 20;

  const nextGoalText =
    level === 1
      ? 'Пройди ещё миссии, чтобы открыть финансовые инструменты.'
      : level === 2
      ? 'Достигни 3 уровня, чтобы открыть ипотеку.'
      : level === 3
      ? 'Теперь тебе доступна ипотека. Сравни предложения и выбери лучший вариант.'
      : 'Продолжай развивать персонажа и открывай новые финансовые возможности.';

  const progressPercent = Math.round(progressToNextLevel * 100);

  const handleReduceTime = async () => {
    await reduceMortgageTime(ACCELERATION_SECONDS, ACCELERATION_COST);
  };

  const mortgageProgress =
    mortgage.totalSeconds > 0
      ? Math.round(
          ((mortgage.totalSeconds - mortgageRemainingSeconds) /
            mortgage.totalSeconds) *
            100
        )
      : 0;

  if (isGameLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Загрузка игрового прогресса...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.coinWrap}>
            <Ionicons name="logo-usd" size={18} color="#C18A10" />
          </View>

          <Text style={styles.logo}>Finity</Text>

          <TouchableOpacity style={styles.iconButton} activeOpacity={0.85}>
            <Ionicons
              name="settings-sharp"
              size={26}
              color={colors.primaryDark}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.worldCard}>
          <View style={styles.backgroundCloudOne} />
          <View style={styles.backgroundCloudTwo} />
          <View style={styles.backgroundHillLeft} />
          <View style={styles.backgroundHillRight} />
          <View style={styles.pathOne} />
          <View style={styles.pathTwo} />

          <TouchableOpacity
            style={[styles.mapNode, styles.nodeHome]}
            activeOpacity={0.88}
          >
            <View style={styles.nodeIconCircle}>
              <Ionicons name="home" size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.nodeLabelLeft}>Дом</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mapNode, styles.nodeChallenges]}
            activeOpacity={0.88}
          >
            <View style={styles.nodeIconCircle}>
              <Ionicons
                name="checkmark-done-circle"
                size={26}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.nodeLabelRight}>Челленджи</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mapNode, styles.nodeAdvice]}
            activeOpacity={0.88}
          >
            <View style={styles.nodeIconCircle}>
              <MaterialCommunityIcons
                name="note-text-outline"
                size={26}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.nodeLabelRight}>Советы</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mapNode, styles.nodeBank]}
            activeOpacity={0.88}
          >
            <View style={styles.nodeIconCircle}>
              <Ionicons name="business" size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.nodeLabelLeft}>Банк</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mapNode, styles.nodeFinance]}
            activeOpacity={0.88}
          >
            <View style={styles.nodeIconCircle}>
              <FontAwesome5 name="hashtag" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.nodeLabelRight}>Финансы</Text>
          </TouchableOpacity>

          <View style={styles.characterWrap}>
            <View style={styles.characterShadow} />
            <View style={styles.characterHead} />
            <View style={styles.characterBody} />
            <View style={styles.characterLeftArm} />
            <View style={styles.characterRightArm} />
            <View style={styles.characterLeftLeg} />
            <View style={styles.characterRightLeg} />

            <View style={styles.characterInfoCard}>
              <Text style={styles.characterName}>Артём</Text>
              <Text style={styles.characterRole}>Начинающий финансист</Text>
              <Text style={styles.characterHint}>
                Викторины и решения помогают герою расти, находить работу и
                улучшать уровень жизни.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Прогресс персонажа</Text>

          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Уровень</Text>
              <Text style={styles.progressValue}>{level}</Text>
            </View>

            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Опыт</Text>
              <Text style={styles.progressValue}>{xp} XP</Text>
            </View>

            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Монеты</Text>
              <Text style={styles.progressValue}>{finCoin}</Text>
            </View>
          </View>

          <View style={styles.levelProgressCard}>
            <View style={styles.levelProgressHeader}>
              <Text style={styles.levelProgressTitle}>
                Прогресс до следующего уровня
              </Text>
              <Text style={styles.levelProgressPercent}>{progressPercent}%</Text>
            </View>

            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>

            <View style={styles.progressMarksRow}>
              <Text style={styles.progressMarkText}>{currentLevelXp} XP</Text>
              <Text style={styles.progressMarkText}>{nextLevelXp} XP</Text>
            </View>
          </View>

          <View style={styles.goalBox}>
            <Text style={styles.goalTitle}>Следующая цель</Text>
            <Text style={styles.goalText}>{nextGoalText}</Text>
          </View>
        </View>

        <View style={styles.debugCard}>
          <Text style={styles.debugTitle}>Тестирование</Text>

          <View style={styles.debugButtonsRow}>
            <TouchableOpacity
              style={styles.debugButton}
              activeOpacity={0.88}
              onPress={() => addTestXp(100)}
            >
              <Text style={styles.debugButtonText}>+100 XP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.debugButton}
              activeOpacity={0.88}
              onPress={() => addTestCoins(50)}
            >
              <Text style={styles.debugButtonText}>+50 монет</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mortgageCard}>
          <View style={styles.mortgageHeader}>
            <Text style={styles.mortgageTitle}>Ипотека</Text>
            <Text style={styles.mortgageStatus}>
              {mortgageStatus === 'locked'
                ? 'Закрыто'
                : mortgageStatus === 'available'
                ? 'Доступно'
                : mortgageStatus === 'active'
                ? 'Активна'
                : 'Закрыта'}
            </Text>
          </View>

          {mortgageStatus === 'locked' && (
            <Text style={styles.mortgageText}>
              Ипотека откроется на 3 уровне. Продолжай выполнять миссии и получать опыт.
            </Text>
          )}

          {mortgageStatus === 'available' && (
            <>
              <Text style={styles.mortgageText}>
                Ты открыл возможность выбрать ипотечное предложение. Сравни варианты и при необходимости спроси совет у ИИ.
              </Text>

              <TouchableOpacity
                style={styles.mortgageButton}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('MortgageOffers')}
              >
                <Text style={styles.mortgageButtonText}>
                  Смотреть предложения
                </Text>
              </TouchableOpacity>
            </>
          )}

          {mortgageStatus === 'active' && (
            <>
              <Text style={styles.mortgageText}>
                Ипотека оформлена. Осталось времени до закрытия:
              </Text>

              <Text style={styles.timerValue}>
                {formatTime(mortgageRemainingSeconds)}
              </Text>

              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${mortgageProgress}%` },
                  ]}
                />
              </View>

              <Text style={styles.accelerationText}>
                Ускорить на {ACCELERATION_SECONDS} сек. за {ACCELERATION_COST} фин коинов
              </Text>

              <TouchableOpacity
                style={styles.mortgageButton}
                activeOpacity={0.88}
                onPress={handleReduceTime}
              >
                <Text style={styles.mortgageButtonText}>Ускорить</Text>
              </TouchableOpacity>
            </>
          )}

          {mortgageStatus === 'completed' && (
            <Text style={styles.mortgageSuccessText}>
              Поздравляем! Ипотека закрыта. Ты успешно прошёл первый крупный финансовый этап.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const NODE_SIZE = 72;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E4',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7F1E4',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 32,
  },
  topBar: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  coinWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F6E7A8',
    borderWidth: 2,
    borderColor: '#E1BE52',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 46,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  worldCard: {
    position: 'relative',
    height: 680,
    borderRadius: 34,
    backgroundColor: '#F4EFD9',
    overflow: 'hidden',
    marginBottom: 20,
  },
  backgroundCloudOne: {
    position: 'absolute',
    top: 92,
    left: 28,
    width: 90,
    height: 26,
    borderRadius: 18,
    backgroundColor: '#DDEDD8',
  },
  backgroundCloudTwo: {
    position: 'absolute',
    top: 104,
    right: 34,
    width: 110,
    height: 28,
    borderRadius: 18,
    backgroundColor: '#DDEDD8',
  },
  backgroundHillLeft: {
    position: 'absolute',
    left: -40,
    bottom: 120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#5AA88E',
    opacity: 0.18,
  },
  backgroundHillRight: {
    position: 'absolute',
    right: -60,
    bottom: 140,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#5AA88E',
    opacity: 0.18,
  },
  pathOne: {
    position: 'absolute',
    left: 110,
    top: 330,
    width: 170,
    height: 240,
    borderRadius: 120,
    borderWidth: 14,
    borderColor: '#EBCB67',
    backgroundColor: 'transparent',
    transform: [{ rotate: '18deg' }],
    opacity: 0.8,
  },
  pathTwo: {
    position: 'absolute',
    left: 60,
    top: 420,
    width: 220,
    height: 140,
    borderRadius: 100,
    borderWidth: 12,
    borderColor: '#EBCB67',
    backgroundColor: 'transparent',
    transform: [{ rotate: '-14deg' }],
    opacity: 0.8,
  },
  mapNode: {
    position: 'absolute',
    alignItems: 'center',
    width: 110,
  },
  nodeHome: {
    top: 180,
    left: 18,
  },
  nodeChallenges: {
    top: 175,
    right: 8,
  },
  nodeAdvice: {
    top: 315,
    right: 12,
  },
  nodeBank: {
    top: 390,
    left: 18,
  },
  nodeFinance: {
    top: 495,
    right: 10,
  },
  nodeIconCircle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: '#E9D783',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },
  nodeLabelLeft: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  nodeLabelRight: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  characterWrap: {
    position: 'absolute',
    left: '50%',
    top: 170,
    marginLeft: -88,
    width: 176,
    height: 350,
    alignItems: 'center',
  },
  characterShadow: {
    position: 'absolute',
    bottom: 18,
    width: 120,
    height: 22,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  characterHead: {
    width: 58,
    height: 68,
    borderRadius: 28,
    backgroundColor: '#F3C9A7',
    marginTop: 8,
    zIndex: 2,
  },
  characterBody: {
    width: 88,
    height: 128,
    borderRadius: 22,
    backgroundColor: '#11977F',
    marginTop: -2,
    zIndex: 1,
  },
  characterLeftArm: {
    position: 'absolute',
    top: 84,
    left: 24,
    width: 20,
    height: 112,
    borderRadius: 12,
    backgroundColor: '#11977F',
    transform: [{ rotate: '10deg' }],
  },
  characterRightArm: {
    position: 'absolute',
    top: 84,
    right: 24,
    width: 20,
    height: 112,
    borderRadius: 12,
    backgroundColor: '#11977F',
    transform: [{ rotate: '-10deg' }],
  },
  characterLeftLeg: {
    position: 'absolute',
    top: 182,
    left: 52,
    width: 24,
    height: 132,
    borderRadius: 14,
    backgroundColor: '#07574A',
    transform: [{ rotate: '4deg' }],
  },
  characterRightLeg: {
    position: 'absolute',
    top: 182,
    right: 52,
    width: 24,
    height: 132,
    borderRadius: 14,
    backgroundColor: '#07574A',
    transform: [{ rotate: '-4deg' }],
  },
  characterInfoCard: {
    position: 'absolute',
    bottom: -2,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E9E0CB',
  },
  characterName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  characterRole: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '700',
    color: '#5D6D68',
    textAlign: 'center',
  },
  characterHint: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    color: '#556460',
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    marginBottom: 18,
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primaryDark,
    marginBottom: 14,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  progressItem: {
    flex: 1,
    backgroundColor: '#F3F7F4',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 13,
    color: '#72817D',
    marginBottom: 6,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  levelProgressCard: {
    backgroundColor: '#F8FBFA',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4EEEB',
    marginBottom: 14,
  },
  levelProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  levelProgressTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: colors.textDark,
  },
  levelProgressPercent: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
  },
  progressBarBackground: {
    height: 14,
    borderRadius: 999,
    backgroundColor: '#DDEAE5',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  progressMarksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressMarkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D7B77',
  },
  goalBox: {
    backgroundColor: '#FFF7DE',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1E3B4',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 6,
  },
  goalText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#31433F',
  },
  debugCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    marginBottom: 18,
  },
  debugTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primaryDark,
    marginBottom: 12,
  },
  debugButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  debugButton: {
    flex: 1,
    backgroundColor: '#EAF6F3',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  mortgageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    marginBottom: 18,
  },
  mortgageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  mortgageTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  mortgageStatus: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
  },
  mortgageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#31433F',
    marginBottom: 14,
  },
  timerValue: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  accelerationText: {
    fontSize: 14,
    color: '#5D6D68',
    marginBottom: 12,
    textAlign: 'center',
  },
  mortgageButton: {
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  mortgageButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  mortgageSuccessText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2E7D32',
    fontWeight: '800',
  },
});