import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import colors from '../../constants/colors';

const goals = ['Научиться копить', 'Контролировать расходы', 'Разобраться с долгами'];
const incomes = ['До 30 000 ₽', '30 000 – 70 000 ₽', '70 000 ₽+'];
const debts = ['Нет долгов', 'Есть небольшие долги', 'Есть серьёзные долги'];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [income, setIncome] = useState<string | null>(null);
  const [debt, setDebt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentUser = auth.currentUser;

  const goNext = () => {
    if (step === 0 && !goal) {
      Alert.alert('Выбери цель', 'Нужно выбрать одну цель.');
      return;
    }

    if (step === 1 && !income) {
      Alert.alert('Выбери доход', 'Нужно выбрать уровень дохода.');
      return;
    }

    if (step === 2 && !debt) {
      Alert.alert('Выбери вариант', 'Нужно указать наличие долгов.');
      return;
    }

    setStep((prev) => prev + 1);
  };

  const completeOnboarding = async () => {
    if (!currentUser) {
      Alert.alert('Ошибка', 'Пользователь не найден.');
      return;
    }

    try {
      setLoading(true);

      await updateDoc(doc(db, 'users', currentUser.uid), {
        onboardingCompleted: true,
        onboarding: {
          goal,
          income,
          debt,
        },
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось завершить онбординг.');
    } finally {
      setLoading(false);
    }
  };

  const renderOption = (
    label: string,
    selectedValue: string | null,
    onPress: (value: string) => void
  ) => {
    const selected = selectedValue === label;

    return (
      <TouchableOpacity
        key={label}
        style={[styles.optionCard, selected && styles.optionCardSelected]}
        onPress={() => onPress(label)}
        activeOpacity={0.85}
      >
        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const progress = `${step + 1}/4`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.progress}>{progress}</Text>

        {step === 0 && (
          <>
            <Text style={styles.title}>Какая у тебя цель?</Text>
            <Text style={styles.subtitle}>
              Это поможет сделать приложение полезнее именно для тебя
            </Text>

            <View style={styles.optionsWrap}>
              {goals.map((item) => renderOption(item, goal, setGoal))}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.title}>Какой у тебя доход?</Text>
            <Text style={styles.subtitle}>
              Выбери вариант, который ближе всего к твоей ситуации
            </Text>

            <View style={styles.optionsWrap}>
              {incomes.map((item) => renderOption(item, income, setIncome))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.title}>Есть ли у тебя долги?</Text>
            <Text style={styles.subtitle}>
              Это поможет подобрать более точные советы и сценарии
            </Text>

            <View style={styles.optionsWrap}>
              {debts.map((item) => renderOption(item, debt, setDebt))}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.title}>Ты готов начать путь в Finity</Text>
            <Text style={styles.subtitle}>
              Мы сохраним твои ответы и откроем основной режим приложения
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>Цель: {goal}</Text>
              <Text style={styles.summaryText}>Доход: {income}</Text>
              <Text style={styles.summaryText}>Долги: {debt}</Text>
            </View>
          </>
        )}

        <View style={styles.bottomBlock}>
          {step < 3 ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={goNext}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Далее</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={completeOnboarding}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Сохраняем...' : 'Начать'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  progress: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5E6E69',
    marginBottom: 28,
  },
  optionsWrap: {
    gap: 14,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DFCF',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EAF6F3',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#21312E',
  },
  optionTextSelected: {
    color: colors.primaryDark,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6DFCF',
  },
  summaryText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#21312E',
    fontWeight: '700',
    marginBottom: 8,
  },
  bottomBlock: {
    marginTop: 'auto',
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textDark,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});