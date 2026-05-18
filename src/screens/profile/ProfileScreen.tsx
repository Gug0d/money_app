import React, { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';

import colors from '../../constants/colors';
import { auth, db } from '../../services/firebase';
import { logout } from '../../services/auth';
import { useGame } from '../../store/GameContext';

type UserProfileData = {
  name?: string | null;
  email?: string | null;
  isGuest?: boolean;
  role?: string;
};

type Props = {
  guestMode?: boolean;
  exitGuestMode?: () => void;
};

export default function ProfileScreen({
  guestMode = false,
  exitGuestMode,
}: Props) {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tutorialResetLoading, setTutorialResetLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const {
    level,
    xp,
    finCoin,
    mortgageStatus,
    isGameLoading,
    resetTutorialProgress,
  } = useGame();

  const currentUser = auth.currentUser;

  const loadUserData = async () => {
    if (guestMode) {
      setUserData({
        name: 'Тестовый гость',
        email: null,
        isGuest: true,
        role: 'guest',
      });
      setLoading(false);
      return;
    }

    if (!currentUser) {
      setUserData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data() as UserProfileData);
      } else {
        setUserData(null);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить профиль.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [guestMode]);

  const handleResetTutorial = async () => {
    try {
      setTutorialResetLoading(true);

      await resetTutorialProgress();

      Alert.alert(
        'Готово',
        'Туториал сброшен. Перейди на другую вкладку или перезапусти приложение, чтобы обучение появилось снова.'
      );
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сбросить туториал.');
    } finally {
      setTutorialResetLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);

      if (guestMode) {
        exitGuestMode?.();
        return;
      }

      await logout();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выйти из аккаунта.');
    } finally {
      setLogoutLoading(false);
    }
  };

  const displayName =
    userData?.name || currentUser?.displayName || 'Пользователь';

  const displayEmail = guestMode
    ? 'Тестовый вход без Firebase'
    : userData?.email || currentUser?.email || 'Без email';

  const role = userData?.role || 'user';

  const accountType = guestMode
    ? 'Тестовый гостевой режим'
    : role === 'admin'
    ? 'Администратор'
    : role === 'guest'
    ? 'Гость'
    : 'Обычный аккаунт';

  const mortgageStatusTitle =
    mortgageStatus === 'locked'
      ? 'Ипотека закрыта'
      : mortgageStatus === 'available'
      ? 'Ипотека доступна'
      : mortgageStatus === 'active'
      ? 'Ипотека активна'
      : 'Ипотека закрыта';

  const mortgageStatusText =
    mortgageStatus === 'locked'
      ? 'Ипотека пока недоступна. Продолжай развивать персонажа и повышать уровень.'
      : mortgageStatus === 'available'
      ? 'Ты можешь выбрать ипотечное предложение в разделе «Банк».'
      : mortgageStatus === 'active'
      ? 'У тебя есть активная ипотека. Следи за прогрессом её закрытия на экране «Жизнь».'
      : 'Ипотека успешно закрыта. Новую ипотеку можно выбрать в разделе «Банк».';

  const isLoading = loading || isGameLoading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Профиль</Text>
        <Text style={styles.subtitle}>
          Управляй аккаунтом и тестовыми настройками
        </Text>

        <View style={styles.card}>
          {isLoading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loaderText}>Загружаем профиль...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.infoText}>{displayEmail}</Text>
              <Text style={styles.infoText}>{accountType}</Text>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Уровень</Text>
                  <Text style={styles.statValue}>{level}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>XP</Text>
                  <Text style={styles.statValue}>{xp}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>FinCoin</Text>
                  <Text style={styles.statValue}>{finCoin}</Text>
                </View>
              </View>

              <View style={styles.mortgageStatusBox}>
                <Text style={styles.statusTitle}>{mortgageStatusTitle}</Text>
                <Text style={styles.statusText}>{mortgageStatusText}</Text>
              </View>
            </>
          )}
        </View>

        {!isLoading ? (
          <TouchableOpacity
            style={[
              styles.tutorialButton,
              tutorialResetLoading && styles.buttonDisabled,
            ]}
            onPress={handleResetTutorial}
            activeOpacity={0.85}
            disabled={tutorialResetLoading}
          >
            <Text style={styles.tutorialButtonText}>
              {tutorialResetLoading
                ? 'Сбрасываем туториал...'
                : 'Сбросить туториал для теста'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {guestMode && !isLoading ? (
          <View style={styles.guestHintBox}>
            <Text style={styles.guestHintText}>
              В тестовом гостевом режиме можно сбрасывать туториал для проверки
              обучения.
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.primaryButton, logoutLoading && styles.buttonDisabled]}
          onPress={handleLogout}
          activeOpacity={0.85}
          disabled={logoutLoading}
        >
          <Text style={styles.primaryButtonText}>
            {logoutLoading
              ? 'Выход...'
              : guestMode
              ? 'Вернуться к авторизации'
              : 'Выйти'}
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
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
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFE7D6',
    marginBottom: 18,
    minHeight: 220,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#5E6E69',
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#5E6E69',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F3F7F4',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#72817D',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  mortgageStatusBox: {
    backgroundColor: '#EAF6F3',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D7EDE8',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#31433F',
  },
  tutorialButton: {
    backgroundColor: '#EAF6F2',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDCD5',
    marginBottom: 12,
  },
  tutorialButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.primary,
  },
  guestHintBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E6DFCF',
    marginBottom: 12,
  },
  guestHintText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#5E6E69',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});