import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import OpenAI from 'openai';

const openAiApiKey = defineSecret('OPENAI_API_KEY');

const MODEL = 'gpt-4.1-mini';

type AiGameState = {
  level?: number;
  xp?: number;
  finCoin?: number;

  mortgageStatus?: string;
  mortgage?: unknown;

  activeDeposit?: unknown;
  depositRemainingSeconds?: number;

  activeLoan?: unknown;
  loanRemainingSeconds?: number;

  homeBills?: unknown;
  homeComfort?: number;
  homeDiscipline?: number;
  homeEvent?: unknown;

  activeJobId?: string | null;
  ownedPropertyId?: string | null;
  activeBoostIds?: string[];
  boostOfferIds?: string[];
  nextSalaryAvailableAt?: number | null;
};

type AskAdvisorRequest = {
  question?: string;
  gameState?: AiGameState;
};

type MissionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  xp?: number;
  finCoin?: number;
};

type Mission = {
  id: string;
  title: string;
  description: string;
  difficulty: 'Легко' | 'Средне' | 'Сложно';
  xpReward: number;
  finCoinReward: number;
  type: 'quiz' | 'decision';
  question?: string;
  options?: MissionOption[];
};

type GenerateMissionRequest = {
  level?: number;
  topic?: string;
  difficulty?: 'Легко' | 'Средне' | 'Сложно';
  gameState?: AiGameState;
};

function createOpenAiClient() {
  return new OpenAI({
    apiKey: openAiApiKey.value(),
  });
}

function safeJsonStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '{}';
  }
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('JSON object not found');
  }

  return trimmed.slice(start, end + 1);
}

function normalizeMission(rawMission: any, level: number): Mission {
  const difficulty =
    rawMission?.difficulty === 'Средне' ||
    rawMission?.difficulty === 'Сложно' ||
    rawMission?.difficulty === 'Легко'
      ? rawMission.difficulty
      : 'Легко';

  const options: MissionOption[] = Array.isArray(rawMission?.options)
    ? rawMission.options.slice(0, 4).map((option: any, index: number) => ({
        id: String(option?.id || String.fromCharCode(97 + index)),
        text: String(option?.text || `Вариант ${index + 1}`),
        isCorrect: Boolean(option?.isCorrect),
        explanation:
          typeof option?.explanation === 'string'
            ? option.explanation
            : undefined,
        xp: typeof option?.xp === 'number' ? option.xp : undefined,
        finCoin:
          typeof option?.finCoin === 'number' ? option.finCoin : undefined,
      }))
    : [];

  const hasCorrectAnswer = options.some((option) => option.isCorrect);

  if (!hasCorrectAnswer && options.length > 0) {
    options[0].isCorrect = true;
  }

  return {
    id: `ai_mission_${Date.now()}`,
    title: String(rawMission?.title || 'Финансовый выбор'),
    description: String(
      rawMission?.description ||
        'Ответь на вопрос и выбери финансово грамотное решение.'
    ),
    difficulty,
    xpReward:
      typeof rawMission?.xpReward === 'number'
        ? rawMission.xpReward
        : Math.max(20, level * 15),
    finCoinReward:
      typeof rawMission?.finCoinReward === 'number'
        ? rawMission.finCoinReward
        : Math.max(10, level * 8),
    type: rawMission?.type === 'decision' ? 'decision' : 'quiz',
    question: String(
      rawMission?.question || 'Какое решение будет более финансово грамотным?'
    ),
    options:
      options.length >= 2
        ? options
        : [
            {
              id: 'a',
              text: 'Сначала оценить бюджет и последствия решения',
              isCorrect: true,
              explanation:
                'Перед финансовым решением важно понять, хватит ли денег и какие будут последствия.',
            },
            {
              id: 'b',
              text: 'Потратить деньги сразу, не думая о будущем',
              isCorrect: false,
              explanation:
                'Импульсивные траты могут привести к нехватке денег на важные расходы.',
            },
          ],
  };
}

export const askAdvisor = onCall(
  {
    region: 'europe-west1',
    secrets: [openAiApiKey],
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request) => {
    const data = request.data as AskAdvisorRequest;

    const question = data.question?.trim();
    const gameState = data.gameState ?? {};

    if (!question) {
      throw new HttpsError('invalid-argument', 'Вопрос не должен быть пустым.');
    }

    if (question.length > 800) {
      throw new HttpsError(
        'invalid-argument',
        'Вопрос слишком длинный. Сократи его.'
      );
    }

    const client = createOpenAiClient();

    const response = await client.responses.create({
      model: MODEL,
      instructions: `
Ты ИИ-помощник в мобильной игре Finity.

Игра обучает финансовой грамотности.
Отвечай на русском языке.
Стиль: простой, дружелюбный, короткий.
Объясняй игровые денежные действия, транзакции и последствия решений.

Можно объяснять:
- почему изменился баланс FinCoin;
- как работают игровые расходы;
- как работают вклады;
- как работают кредиты;
- как работает ипотека;
- что означают счета дома;
- как проходить миссии;
- почему важно планировать бюджет.

Нельзя:
- давать реальные инвестиционные гарантии;
- обещать заработок;
- давать юридические или банковские консультации как профессиональный совет;
- просить личные данные игрока.

Если точной причины изменения баланса не видно из состояния игрока, честно скажи, что точную причину определить нельзя, и перечисли возможные причины.
      `,
      input: `
Вопрос игрока:
${question}

Текущее игровое состояние:
${safeJsonStringify(gameState)}
      `,
    });

    return {
      answer:
        response.output_text ||
        'Не получилось сформировать ответ. Попробуй задать вопрос иначе.',
    };
  }
);

export const generateMission = onCall(
  {
    region: 'europe-west1',
    secrets: [openAiApiKey],
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request) => {
    const data = request.data as GenerateMissionRequest;

    const level = Math.max(1, Math.min(12, Number(data.level || 1)));
    const topic = data.topic?.trim() || 'финансовая грамотность';
    const difficulty = data.difficulty || 'Легко';
    const gameState = data.gameState ?? {};

    const client = createOpenAiClient();

    const response = await client.responses.create({
      model: MODEL,
      instructions: `
Ты генерируешь миссии для мобильной игры Finity.

Нужно вернуть только JSON-объект без Markdown и без пояснений вокруг.

Формат:
{
  "title": "string",
  "description": "string",
  "difficulty": "Легко" | "Средне" | "Сложно",
  "xpReward": number,
  "finCoinReward": number,
  "type": "quiz" | "decision",
  "question": "string",
  "options": [
    {
      "id": "a",
      "text": "string",
      "isCorrect": true,
      "explanation": "string"
    },
    {
      "id": "b",
      "text": "string",
      "isCorrect": false,
      "explanation": "string"
    }
  ]
}

Правила:
- язык: русский;
- тема должна быть понятна игроку;
- вопрос должен обучать финансовой грамотности;
- должно быть от 3 до 4 вариантов ответа;
- правильный вариант должен быть ровно один;
- explanations должны объяснять, почему вариант правильный или неправильный;
- не используй реальные банки и реальные инвестиционные обещания;
- награды должны быть умеренными;
- миссия должна подходить уровню игрока.
      `,
      input: `
Уровень игрока: ${level}
Желаемая сложность: ${difficulty}
Тема миссии: ${topic}

Игровое состояние:
${safeJsonStringify(gameState)}
      `,
    });

    try {
      const jsonText = extractJsonObject(response.output_text || '');
      const rawMission = JSON.parse(jsonText);
      const mission = normalizeMission(rawMission, level);

      return {
        mission,
      };
    } catch (error) {
      console.log('generateMission parse error:', error);

      const fallbackMission = normalizeMission(
        {
          title: 'Планирование расходов',
          description:
            'Выбери финансово грамотное решение перед важной покупкой.',
          difficulty,
          xpReward: Math.max(20, level * 15),
          finCoinReward: Math.max(10, level * 8),
          type: 'quiz',
          question:
            'Что лучше сделать перед незапланированной крупной покупкой?',
          options: [
            {
              id: 'a',
              text: 'Сначала проверить бюджет и обязательные расходы',
              isCorrect: true,
              explanation:
                'Так игрок понимает, не навредит ли покупка важным платежам.',
            },
            {
              id: 'b',
              text: 'Купить сразу, пока хочется',
              isCorrect: false,
              explanation:
                'Импульсивная покупка может привести к нехватке денег.',
            },
            {
              id: 'c',
              text: 'Потратить все FinCoin',
              isCorrect: false,
              explanation:
                'Полная трата баланса оставляет игрока без резерва.',
            },
          ],
        },
        level
      );

      return {
        mission: fallbackMission,
      };
    }
  }
);