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
import { registerWithEmail } from '../../services/auth';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      Alert.alert('Ошибка', 'Заполни имя, email и пароль.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть не короче 6 символов.');
      return;
    }

    try {
      setLoading(true);
      await registerWithEmail(trimmedName, trimmedEmail, password);
    } catch (error: any) {
      let message = 'Не удалось зарегистрироваться. Попробуй ещё раз.';

      if (error?.code === 'auth/email-already-in-use') {
        message = 'Этот email уже используется.';
      } else if (error?.code === 'auth/invalid-email') {
        message = 'Неверный формат email.';
      } else if (error?.code === 'auth/weak-password') {
        message = 'Слишком слабый пароль.';
      }

      Alert.alert('Ошибка регистрации', message);
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

        <Text style={styles.title}>Регистрация</Text>
        <Text style={styles.subtitle}>
          Создай аккаунт, чтобы начать играть и развивать персонажа
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Имя"
            placeholderTextColor="#80908B"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />

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
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Загрузка...' : 'Зарегистрироваться'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.linkText}>Уже есть аккаунт? Войти</Text>
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