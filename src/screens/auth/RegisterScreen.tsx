import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'> & {
  onRegisterSuccess: () => void;
};

export default function RegisterScreen({
  navigation,
  onRegisterSuccess,
}: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Регистрация</Text>
        <Text style={styles.subtitle}>
          Создай аккаунт, чтобы сохранять прогресс и развивать персонажа
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Имя"
            placeholderTextColor="#80908B"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#80908B"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Пароль"
            placeholderTextColor="#80908B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={onRegisterSuccess}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Зарегистрироваться</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
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