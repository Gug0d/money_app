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
import { auth, db } from '../../services/firebase';
import { logout } from '../../services/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import colors from '../../constants/colors';

type UserProfileData = {
  name?: string | null;
  email?: string | null;
  level?: number;
  xp?: number;
  finCoin?: number;
  isGuest?: boolean;
  onboardingCompleted?: boolean;
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
  const [resetLoading, setResetLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const currentUser = auth.currentUser;

  const loadUserData = async () => {
    if (guestMode) {
      setUserData({
        name: 'Тестовый гость',
        email: null,
        level: 1,
        xp: 0,
        finCoin: 0,
        isGuest: true,
        onboardingCompleted: true,
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

  const handleResetOnboarding = async () => {
    if (guestMode) {
      Alert.alert(
        'Тестовый режим',
        'В гостевом режиме онбординг отключён и не используется.'
      );
      return;
    }

    if (!currentUser) {
      Alert.alert('Ошибка', 'Пользователь не найден.');
      return;
    }

    try {
      setResetLoading(true);

      await updateDoc(doc(db, 'users', currentUser.uid), {
        onboardingCompleted: false,
      });

      Alert.alert(
        'Готово',
        'Онбординг сброшен. Сейчас выполнится выход, и при следующем входе откроется онбординг.',
        [
          {
            text: 'Ок',
            onPress: async () => {
              await logout();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сбросить онбординг.');
    } finally {
      setResetLoading(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Профиль</Text>
        <Text style={styles.subtitle}>
          Управляй аккаунтом и тестовыми настройками
        </Text>

        <View style={styles.card}>
          {loading ? (
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
                  <Text style={styles.statValue}>{userData?.level ?? 1}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>XP</Text>
                  <Text style={styles.statValue}>{userData?.xp ?? 0}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>FinCoin</Text>
                  <Text style={styles.statValue}>{userData?.finCoin ?? 0}</Text>
                </View>
              </View>

              <View style={styles.statusBox}>
                <Text style={styles.statusTitle}>Онбординг</Text>
                <Text style={styles.statusText}>
                  {guestMode
                    ? 'Отключён для тестового входа'
                    : userData?.onboardingCompleted
                    ? 'Пройден'
                    : 'Не пройден или был сброшен'}
                </Text>
              </View>
            </>
          )}
        </View>

        {!guestMode && !loading ? (
          <TouchableOpacity
            style={[styles.secondaryButton, resetLoading && styles.buttonDisabled]}
            onPress={handleResetOnboarding}
            activeOpacity={0.85}
            disabled={resetLoading}
          >
            <Text style={styles.secondaryButtonText}>
              {resetLoading ? 'Сбрасываем...' : 'Сбросить онбординг для теста'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {guestMode && !loading ? (
          <View style={styles.guestHintBox}>
            <Text style={styles.guestHintText}>
              В тестовом гостевом режиме онбординг не используется.
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
  statusBox: {
    backgroundColor: '#FFF7DE',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1E3B4',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 15,
    color: '#31433F',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '800',
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