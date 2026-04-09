import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { loginAsGuest } from '../../services/auth';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      await loginAsGuest();
    } catch (error: any) {
      Alert.alert(
        'Ошибка',
        'Не удалось войти как гость. Проверь, включена ли анонимная авторизация в Firebase.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logoIcon}>F</Text>
        <Text style={styles.logoText}>FINITY</Text>

        <Text style={styles.title}>
          Добро пожаловать{'\n'}в мир финансовой грамотности
        </Text>

        <Text style={styles.subtitle}>
          Войди в аккаунт или зарегистрируйся, чтобы начать развитие персонажа,
          проходить миссии и открывать новые возможности.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Войти</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Зарегистрироваться</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestButton}
          onPress={handleGuestLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.guestButtonText}>
            {loading ? 'Загрузка...' : 'Войти как гость'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A6A61',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoIcon: {
    fontSize: 44,
    fontWeight: '900',
    color: '#F2C84B',
    textAlign: 'center',
    marginBottom: 6,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 5,
    color: '#F2C84B',
    textAlign: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#F7F1E4',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#DDE9E6',
    textAlign: 'center',
    marginBottom: 36,
  },
  button: {
    width: '100%',
    backgroundColor: '#F2C84B',
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0A4F4A',
  },
  secondaryButton: {
    backgroundColor: '#F7F1E4',
  },
  secondaryButtonText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0A4F4A',
  },
  guestButton: {
    marginTop: 6,
    alignItems: 'center',
    paddingVertical: 14,
  },
  guestButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F7F1E4',
    textDecorationLine: 'underline',
  },
}); 