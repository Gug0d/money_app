import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';

const tips = [
  {
    id: 't1',
    category: 'Расходы',
    icon: 'wallet-outline',
    title: 'Следи за мелкими тратами',
    text: 'Даже небольшие ежедневные расходы могут незаметно съедать бюджет. Попробуй записывать все траты хотя бы 3 дня подряд.',
    action: 'Записать расходы',
  },
  {
    id: 't2',
    category: 'Накопления',
    icon: 'save-outline',
    title: 'Сначала отложи, потом трать',
    text: 'Хорошая привычка — откладывать часть дохода сразу после его получения. Даже 5–10% уже создают полезный резерв.',
    action: 'Начать копить',
  },
  {
    id: 't3',
    category: 'Безопасность',
    icon: 'shield-checkmark-outline',
    title: 'Береги данные карты',
    text: 'Не передавай CVV-код, пин-код и полные реквизиты карты другим людям. Для онлайн-покупок используй только проверенные сайты.',
    action: 'Понял',
  },
];

export default function AdvisorScreen() {
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  const activeTip = useMemo(() => tips[activeTipIndex], [activeTipIndex]);

  const handleNextTip = () => {
    setActiveTipIndex((prev) => (prev + 1) % tips.length);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Советник</Text>
          <Text style={styles.subtitle}>
            Получай рекомендации и принимай более разумные финансовые решения
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatarWrap}>
              <FontAwesome5 name="robot" size={28} color={colors.primary} />
            </View>

            <View style={styles.heroTextBlock}>
              <Text style={styles.heroName}>Fin Advisor</Text>
              <Text style={styles.heroRole}>Твой помощник по финансам</Text>
            </View>
          </View>

          <Text style={styles.heroDescription}>
            Я подскажу, как лучше управлять деньгами, избегать лишних трат и
            принимать более безопасные финансовые решения.
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatChip}>
              <Ionicons name="flash" size={16} color="#D9A520" />
              <Text style={styles.heroStatText}>+ советы каждый день</Text>
            </View>

            <View style={styles.heroStatChip}>
              <MaterialCommunityIcons
                name="brain"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.heroStatText}>Практические подсказки</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Совет дня</Text>
          <Text style={styles.sectionSubtitle}>
            Применяй подсказки на практике
          </Text>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipHeaderRow}>
            <View style={styles.tipIconWrap}>
              <Ionicons
                name={activeTip.icon as any}
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.tipHeaderTextBlock}>
              <Text style={styles.tipCategory}>{activeTip.category}</Text>
              <Text style={styles.tipTitle}>{activeTip.title}</Text>
            </View>
          </View>

          <Text style={styles.tipText}>{activeTip.text}</Text>

          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.88}>
            <Text style={styles.primaryButtonText}>{activeTip.action}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Быстрые рекомендации</Text>
        </View>

        <View style={styles.recommendationCard}>
          <View style={styles.recommendationTopRow}>
            <View style={styles.recommendationIconWrap}>
              <Ionicons name="trending-down-outline" size={22} color="#C87B2A" />
            </View>
            <Text style={styles.recommendationTitle}>Сократи импульсивные покупки</Text>
          </View>
          <Text style={styles.recommendationText}>
            Перед незапланированной покупкой подожди 24 часа. Часто желание купить
            проходит, и бюджет остаётся целым.
          </Text>
        </View>

        <View style={styles.recommendationCard}>
          <View style={styles.recommendationTopRow}>
            <View style={styles.recommendationIconWrap}>
              <Ionicons name="cash-outline" size={22} color="#C87B2A" />
            </View>
            <Text style={styles.recommendationTitle}>Разделяй деньги по целям</Text>
          </View>
          <Text style={styles.recommendationText}>
            Удобно мысленно делить бюджет на обязательные траты, личные расходы и
            накопления. Так проще контролировать финансы.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.88}
          onPress={handleNextTip}
        >
          <Text style={styles.secondaryButtonText}>Получить ещё совет</Text>
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
  heroCard: {
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
    marginBottom: 24,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarWrap: {
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
  heroName: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textDark,
  },
  heroRole: {
    marginTop: 4,
    fontSize: 14,
    color: '#6A7975',
  },
  heroDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#31433F',
    marginBottom: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E5',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroStatText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '800',
    color: colors.textDark,
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
  tipCard: {
    backgroundColor: '#FFF7DE',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1E3B4',
    marginBottom: 24,
  },
  tipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  tipIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3E7B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipHeaderTextBlock: {
    flex: 1,
  },
  tipCategory: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9C7A1C',
    marginBottom: 4,
  },
  tipTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    color: colors.textDark,
  },
  tipText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#31433F',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.textDark,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    marginBottom: 14,
  },
  recommendationTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF1D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: colors.textDark,
  },
  recommendationText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#53625D',
  },
  secondaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});