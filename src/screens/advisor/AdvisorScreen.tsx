// src/screens/advisor/AdvisorScreen.tsx

import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

import colors from '../../constants/colors';
import TutorialTarget from '../../components/tutorial/TutorialTarget';
import { useGame } from '../../store/GameContext';
import { askAiAdvisor } from '../../services/ai';
import { AiChatMessage, AiGameState } from '../../types/ai';

export default function AdvisorScreen() {
  const game = useGame();

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'hello',
      role: 'assistant',
      text:
        'Привет! Я ИИ-помощник Finity. Можешь спросить меня, почему изменился баланс, как работает вклад, кредит, ипотека, счета дома или миссии.',
    },
  ]);

  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const listRef = useRef<FlatList<AiChatMessage>>(null);

  const gameState: AiGameState = useMemo(
    () => ({
      level: game.level,
      xp: game.xp,
      finCoin: game.finCoin,

      mortgageStatus: game.mortgageStatus,
      mortgage: game.mortgage,

      activeDeposit: game.activeDeposit,
      depositRemainingSeconds: game.depositRemainingSeconds,

      activeLoan: game.activeLoan,
      loanRemainingSeconds: game.loanRemainingSeconds,

      homeBills: game.homeBills,
      homeComfort: game.homeComfort,
      homeDiscipline: game.homeDiscipline,
      homeEvent: game.homeEvent,

      activeJobId: game.activeJobId,
      ownedPropertyId: game.ownedPropertyId,
      activeBoostIds: game.activeBoostIds,
      boostOfferIds: game.boostOfferIds,
      nextSalaryAvailableAt: game.nextSalaryAvailableAt,
    }),
    [
      game.level,
      game.xp,
      game.finCoin,
      game.mortgageStatus,
      game.mortgage,
      game.activeDeposit,
      game.depositRemainingSeconds,
      game.activeLoan,
      game.loanRemainingSeconds,
      game.homeBills,
      game.homeComfort,
      game.homeDiscipline,
      game.homeEvent,
      game.activeJobId,
      game.ownedPropertyId,
      game.activeBoostIds,
      game.boostOfferIds,
      game.nextSalaryAvailableAt,
    ]
  );

  const sendQuestion = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    const userMessage: AiChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: trimmedQuestion,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const answer = await askAiAdvisor(trimmedQuestion, gameState);

      const assistantMessage: AiChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        text: answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.log('[AdvisorScreen] AI error:', error);

      const errorMessage: AiChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        text:
          error?.message ||
          'Не получилось получить ответ от ИИ-помощника. Проверь, что локальный сервер запущен и IP-адрес указан правильно.',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);

      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = ({ item }: { item: AiChatMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Советник</Text>
            <Text style={styles.subtitle}>
              Задай вопрос о деньгах, миссиях или игровых транзакциях
            </Text>
          </View>

          <TutorialTarget id="advisor-screen">
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.avatarWrap}>
                  <FontAwesome5 name="robot" size={28} color={colors.primary} />
                </View>

                <View style={styles.heroTextBlock}>
                  <Text style={styles.heroName}>Fin Advisor</Text>
                  <Text style={styles.heroRole}>ИИ-помощник по финансам</Text>
                </View>
              </View>

              <Text style={styles.heroDescription}>
                Я анализирую твоё игровое состояние и объясняю, почему
                изменился баланс, как работают кредиты, вклады, ипотека, счета
                и миссии.
              </Text>

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatChip}>
                  <Ionicons name="wallet-outline" size={16} color="#D9A520" />
                  <Text style={styles.heroStatText}>{game.finCoin} FC</Text>
                </View>

                <View style={styles.heroStatChip}>
                  <Ionicons
                    name="star-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.heroStatText}>Уровень {game.level}</Text>
                </View>
              </View>
            </View>
          </TutorialTarget>

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              listRef.current?.scrollToEnd({ animated: true });
            }}
          />

          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Помощник думает...</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Например: почему уменьшился баланс?"
            placeholderTextColor="#8A9A95"
            style={styles.input}
            multiline
          />

          <Pressable
            style={[
              styles.sendButton,
              (!question.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={sendQuestion}
            disabled={!question.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E4',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
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
    marginBottom: 14,
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
    fontSize: 15,
    lineHeight: 22,
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
  messagesContainer: {
    paddingTop: 8,
    paddingBottom: 18,
  },
  messageBubble: {
    maxWidth: '86%',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
    marginBottom: 10,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#EFE7D6',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderTopRightRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#21312E',
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6A7975',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#F4EEDB',
    borderTopWidth: 1,
    borderTopColor: '#E6DFCF',
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DFCF',
    fontSize: 15,
    color: '#21312E',
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});