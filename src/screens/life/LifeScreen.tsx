import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import colors from '../../constants/colors';

export default function LifeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Режим «Жизнь»</Text>
          <Text style={styles.subtitle}>
            Управляй доходами, расходами и решениями персонажа
          </Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Баланс</Text>
          <Text style={styles.balanceValue}>12 450 FinCoin</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={styles.statTopRow}>
                <Ionicons name="trending-up" size={18} color="#B8F5C2" />
                <Text style={styles.statTitle}>Доход</Text>
              </View>
              <Text style={styles.statPositive}>+ 2 500</Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statTopRow}>
                <Ionicons name="trending-down" size={18} color="#FFD2D2" />
                <Text style={styles.statTitle}>Расход</Text>
              </View>
              <Text style={styles.statNegative}>- 1 300</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Локации</Text>
          <Text style={styles.sectionSubtitle}>Выбери, куда перейти</Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.locationCard} activeOpacity={0.88}>
            <View style={styles.locationIconWrap}>
              <Ionicons name="home" size={28} color={colors.primary} />
            </View>
            <Text style={styles.locationText}>Дом</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.locationCard} activeOpacity={0.88}>
            <View style={styles.locationIconWrap}>
              <Ionicons name="briefcase" size={28} color={colors.primary} />
            </View>
            <Text style={styles.locationText}>Работа</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.locationCard} activeOpacity={0.88}>
            <View style={styles.locationIconWrap}>
              <Ionicons name="business" size={28} color={colors.primary} />
            </View>
            <Text style={styles.locationText}>Банк</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.locationCard} activeOpacity={0.88}>
            <View style={styles.locationIconWrap}>
              <MaterialCommunityIcons
                name="chart-line"
                size={28}
                color={colors.primary}
              />
            </View>
            <Text style={styles.locationText}>Биржа</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.advisorCard}>
          <View style={styles.advisorHeader}>
            <View style={styles.advisorIconWrap}>
              <FontAwesome5 name="robot" size={16} color={colors.primary} />
            </View>
            <Text style={styles.advisorTitle}>Советник</Text>
          </View>

          <Text style={styles.advisorText}>
            Сегодня твои расходы выросли. Попробуй сократить необязательные
            траты и отложить часть дохода в резерв.
          </Text>

          <TouchableOpacity style={styles.advisorButton} activeOpacity={0.88}>
            <Text style={styles.advisorButtonText}>Получить совет</Text>
          </TouchableOpacity>
        </View>
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
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 15,
    color: '#D7F0EC',
  },
  balanceValue: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0F7B70',
    borderRadius: 18,
    padding: 14,
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    marginLeft: 6,
    fontSize: 14,
    color: '#D7F0EC',
  },
  statPositive: {
    fontSize: 22,
    fontWeight: '900',
    color: '#B8F5C2',
  },
  statNegative: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFD2D2',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textDark,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6A7975',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginBottom: 24,
  },
  locationCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7D6',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },
  locationIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EAF6F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
  },
  advisorCard: {
    backgroundColor: '#FFF7DE',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1E3B4',
  },
  advisorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  advisorIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3E7B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  advisorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textDark,
  },
  advisorText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#31433F',
    marginBottom: 16,
  },
  advisorButton: {
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  advisorButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.textDark,
  },
});