import React from 'react';
import {
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
import colors from '../../constants/colors';

export default function LifeScreen() {
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
            <Ionicons name="settings-sharp" size={26} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.worldCard}>
          <View style={styles.backgroundCloudOne} />
          <View style={styles.backgroundCloudTwo} />
          <View style={styles.backgroundHillLeft} />
          <View style={styles.backgroundHillRight} />

          <View style={styles.pathOne} />
          <View style={styles.pathTwo} />

          <TouchableOpacity style={[styles.mapNode, styles.nodeHome]} activeOpacity={0.88}>
            <View style={styles.nodeIconCircle}>
              <Ionicons name="home" size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.nodeLabelLeft}>Дом</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.mapNode, styles.nodeChallenges]} activeOpacity={0.88}>
            <View style={styles.nodeIconCircle}>
              <Ionicons name="checkmark-done-circle" size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.nodeLabelRight}>Челленджи</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.mapNode, styles.nodeAdvice]} activeOpacity={0.88}>
            <View style={styles.nodeIconCircle}>
              <MaterialCommunityIcons name="note-text-outline" size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.nodeLabelRight}>Советы</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.mapNode, styles.nodeBank]} activeOpacity={0.88}>
            <View style={styles.nodeIconCircle}>
              <Ionicons name="business" size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.nodeLabelLeft}>Банк</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.mapNode, styles.nodeFinance]} activeOpacity={0.88}>
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
              <Text style={styles.progressValue}>2</Text>
            </View>

            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Опыт</Text>
              <Text style={styles.progressValue}>95 XP</Text>
            </View>

            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Монеты</Text>
              <Text style={styles.progressValue}>40</Text>
            </View>
          </View>

          <View style={styles.goalBox}>
            <Text style={styles.goalTitle}>Следующая цель</Text>
            <Text style={styles.goalText}>
              Пройди ещё 2 миссии, чтобы открыть возможность устроиться на работу.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.playButton} activeOpacity={0.88}>
          <Text style={styles.playButtonText}>ИГРАТЬ</Text>
        </TouchableOpacity>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.bottomActionCard} activeOpacity={0.88}>
            <View style={styles.bottomActionIcon}>
              <Ionicons name="person" size={24} color={colors.primaryDark} />
            </View>
            <Text style={styles.bottomActionText}>Персонаж</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomActionCard} activeOpacity={0.88}>
            <View style={styles.bottomActionIcon}>
              <Ionicons name="chatbubble-ellipses" size={24} color={colors.primaryDark} />
            </View>
            <Text style={styles.bottomActionText}>Диалоги</Text>
          </TouchableOpacity>
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

  playButton: {
    backgroundColor: colors.accent,
    borderRadius: 28,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#D9A520',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },
  playButtonText: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primaryDark,
    letterSpacing: 1,
  },

  bottomActions: {
    flexDirection: 'row',
    gap: 14,
  },
  bottomActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7D6',
  },
  bottomActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F2F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  bottomActionText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
});