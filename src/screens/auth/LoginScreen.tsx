import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { loginWithEmail } from '../../services/auth';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      Alert.alert('Ошибка', 'Введи email и пароль.');
      return;
    }

    try {
      setLoading(true);
      await loginWithEmail(trimmedEmail, password);
    } catch (error: any) {
      let message = 'Не удалось войти. Попробуй ещё раз.';

      if (error?.code === 'auth/invalid-email') {
        message = 'Неверный формат email.';
      } else if (
        error?.code === 'auth/invalid-credential' ||
        error?.code === 'auth/user-not-found' ||
        error?.code === 'auth/wrong-password'
      ) {
        message = 'Неверный email или пароль.';
      } else if (error?.code === 'auth/too-many-requests') {
        message = 'Слишком много попыток входа. Попробуй позже.';
      }

      Alert.alert('Ошибка входа', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Вход</Text>
        <Text style={styles.subtitle}>
          Войди в аккаунт, чтобы продолжить игру
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#80908B"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Пароль"
            placeholderTextColor="#80908B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Загрузка...' : 'Войти'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.linkText}>Нет аккаунта? Зарегистрироваться</Text>
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
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A6A61',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0A6A61',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5E6E69',
    marginBottom: 28,
  },
  form: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#21312E',
    borderWidth: 1,
    borderColor: '#E6DFCF',
    marginBottom: 14,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#F2C84B',
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A4F4A',
  },
  linkText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A6A61',
    textAlign: 'center',
  },
});