const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

console.log('OPENROUTER_API_KEY loaded:', Boolean(process.env.OPENROUTER_API_KEY));

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3001',
    'X-OpenRouter-Title': 'Finity',
  },
});

const MODEL = 'openrouter/free';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

function safeJsonStringify(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '{}';
  }
}

function extractJsonArray(text) {
  const trimmed = String(text || '').trim();

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed;
  }

  const start = trimmed.indexOf('[');
  const end = trimmed.lastIndexOf(']');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('JSON array not found');
  }

  return trimmed.slice(start, end + 1);
}

function normalizeMission(rawMission, level, index = 0) {
  const difficulty = ['Легко', 'Средне', 'Сложно'].includes(
    rawMission?.difficulty
  )
    ? rawMission.difficulty
    : index < 2
    ? 'Легко'
    : index < 4
    ? 'Средне'
    : 'Сложно';

  const options = Array.isArray(rawMission?.options)
    ? rawMission.options.slice(0, 4).map((option, optionIndex) => ({
        id: String(option?.id || String.fromCharCode(97 + optionIndex)),
        text: String(option?.text || `Вариант ${optionIndex + 1}`),
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

  const correctOptions = options.filter((option) => option.isCorrect);

  if (correctOptions.length === 0 && options.length > 0) {
    options[0].isCorrect = true;
  }

  if (correctOptions.length > 1) {
    let firstCorrectFound = false;

    options.forEach((option) => {
      if (option.isCorrect && !firstCorrectFound) {
        firstCorrectFound = true;
        return;
      }

      if (option.isCorrect && firstCorrectFound) {
        option.isCorrect = false;
      }
    });
  }

  const rewardByDifficulty = {
    Легко: {
      xp: Math.max(20, level * 12),
      finCoin: Math.max(10, level * 6),
    },
    Средне: {
      xp: Math.max(35, level * 16),
      finCoin: Math.max(18, level * 8),
    },
    Сложно: {
      xp: Math.max(50, level * 22),
      finCoin: Math.max(25, level * 12),
    },
  };

  return {
    id: `ai_mission_${Date.now()}_${index}`,
    title: String(rawMission?.title || 'Финансовый выбор'),
    description: String(
      rawMission?.description ||
        'Ответь на вопрос и выбери финансово грамотное решение.'
    ),
    difficulty,
    xpReward:
      typeof rawMission?.xpReward === 'number'
        ? rawMission.xpReward
        : rewardByDifficulty[difficulty].xp,
    finCoinReward:
      typeof rawMission?.finCoinReward === 'number'
        ? rawMission.finCoinReward
        : rewardByDifficulty[difficulty].finCoin,
    type: rawMission?.type === 'decision' ? 'decision' : 'quiz',
    question: String(
      rawMission?.question || 'Какое решение будет более финансово грамотным?'
    ),
    options:
      options.length >= 3
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
            {
              id: 'c',
              text: 'Взять долг, даже если нет плана возврата',
              isCorrect: false,
              explanation:
                'Заёмные деньги требуют плана возврата, иначе можно получить просрочку.',
            },
          ],
  };
}

function createLocalAdvisorAnswer(question, gameState) {
  const lowerQuestion = String(question || '').toLowerCase();

  const level = gameState?.level ?? 1;
  const xp = gameState?.xp ?? 0;
  const finCoin = gameState?.finCoin ?? 0;
  const activeDeposit = gameState?.activeDeposit;
  const activeLoan = gameState?.activeLoan;
  const homeBills = Array.isArray(gameState?.homeBills)
    ? gameState.homeBills
    : [];
  const homeEvent = gameState?.homeEvent;

  if (lowerQuestion.includes('вклад')) {
    if (activeDeposit) {
      return `У тебя уже есть активный вклад "${activeDeposit.title}". Вклад временно замораживает часть FinCoin, а после окончания срока возвращает выплату с процентом. Сейчас твой баланс: ${finCoin} FC.`;
    }

    return `Вклад — это способ отложить FinCoin и получить больше после окончания срока. Сейчас у тебя уровень ${level}, опыт ${xp} и баланс ${finCoin} FC.`;
  }

  if (
    lowerQuestion.includes('кредит') ||
    lowerQuestion.includes('долг') ||
    lowerQuestion.includes('платеж')
  ) {
    if (activeLoan) {
      return `У тебя есть активный кредит "${activeLoan.title}". Остаток долга: ${activeLoan.remainingDebt} FC, платёж: ${activeLoan.monthlyPayment} FC. Если не платить вовремя, могут появиться штрафы и просрочка.`;
    }

    return `Кредит в игре даёт FinCoin сразу, но потом его нужно возвращать с процентами. Это полезно, когда срочно нужны деньги, но важно помнить о будущих платежах.`;
  }

  if (
    lowerQuestion.includes('баланс') ||
    lowerQuestion.includes('уменьш') ||
    lowerQuestion.includes('почему спис')
  ) {
    const unpaidBills = homeBills.filter((bill) => bill.status !== 'paid');

    const possibleReasons = [];

    if (activeLoan) {
      possibleReasons.push('платёж по кредиту');
    }

    if (activeDeposit) {
      possibleReasons.push('открытие вклада');
    }

    if (unpaidBills.length > 0) {
      possibleReasons.push('оплата домашних счетов или штрафы за просрочку');
    }

    if (homeEvent) {
      possibleReasons.push('ремонт случайного события дома');
    }

    if (possibleReasons.length === 0) {
      return `Точный источник списания по текущим данным определить нельзя. Сейчас у тебя ${finCoin} FC. Баланс обычно уменьшается из-за оплаты счетов, кредита, вклада, покупки бустов, недвижимости или ремонта дома.`;
    }

    return `Баланс мог уменьшиться из-за следующих действий: ${possibleReasons.join(
      ', '
    )}. Сейчас у тебя ${finCoin} FC.`;
  }

  if (
    lowerQuestion.includes('счета') ||
    lowerQuestion.includes('дом') ||
    lowerQuestion.includes('аренд') ||
    lowerQuestion.includes('электр')
  ) {
    const unpaidBills = homeBills.filter((bill) => bill.status !== 'paid');

    if (unpaidBills.length === 0) {
      return `Сейчас все домашние счета выглядят оплаченными. Это хорошо: регулярная оплата помогает сохранять дисциплину и комфорт.`;
    }

    const billNames = unpaidBills.map(
      (bill) => `${bill.title}: ${bill.amount} FC`
    );

    return `У тебя есть неоплаченные домашние счета: ${billNames.join(
      ', '
    )}. Лучше оплачивать их заранее, чтобы не получить штраф и не потерять дисциплину.`;
  }

  if (lowerQuestion.includes('ипотек')) {
    return `Ипотека — это крупное обязательство. В игре важно сравнивать первоначальный взнос, ежемесячный платёж, срок и переплату. Чем меньше переплата, тем обычно выше нагрузка на бюджет.`;
  }

  if (lowerQuestion.includes('мисси') || lowerQuestion.includes('цели')) {
    return `Миссии помогают получать опыт и FinCoin. Лучше проходить их регулярно: так ты быстрее повышаешь уровень и открываешь новые финансовые возможности.`;
  }

  return `Я могу помочь с игровыми финансами. Сейчас у тебя уровень ${level}, опыт ${xp} и баланс ${finCoin} FC. Спроси, например: "почему уменьшился баланс?", "как работает вклад?", "что делать с кредитом?" или "какие счета оплатить?".`;
}

function createFallbackMissions(level, count = 5) {
  const templates = [
    {
      title: 'Планирование расходов',
      description: 'Выбери финансово грамотное решение перед важной покупкой.',
      difficulty: 'Легко',
      type: 'quiz',
      question: 'Что лучше сделать перед незапланированной крупной покупкой?',
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
          explanation: 'Импульсивная покупка может привести к нехватке денег.',
        },
        {
          id: 'c',
          text: 'Потратить все FinCoin',
          isCorrect: false,
          explanation: 'Полная трата баланса оставляет игрока без резерва.',
        },
      ],
    },
    {
      title: 'Домашние счета',
      description: 'Разберись, почему важно оплачивать обязательные расходы.',
      difficulty: 'Легко',
      type: 'quiz',
      question: 'Почему лучше оплачивать счета дома вовремя?',
      options: [
        {
          id: 'a',
          text: 'Чтобы избежать штрафов и сохранить дисциплину',
          isCorrect: true,
          explanation:
            'Своевременная оплата помогает избежать дополнительных расходов.',
        },
        {
          id: 'b',
          text: 'Чтобы быстрее потратить все деньги',
          isCorrect: false,
          explanation: 'Цель не в трате денег, а в контроле обязательств.',
        },
        {
          id: 'c',
          text: 'Потому что счета никогда не влияют на игру',
          isCorrect: false,
          explanation: 'В игре счета могут влиять на баланс и показатели дома.',
        },
      ],
    },
    {
      title: 'Вклад или трата',
      description: 'Определи, когда лучше отложить деньги.',
      difficulty: 'Средне',
      type: 'decision',
      question:
        'У игрока есть свободные FinCoin. Что будет более разумным решением?',
      options: [
        {
          id: 'a',
          text: 'Оценить обязательные расходы и только потом открыть вклад',
          isCorrect: true,
          explanation:
            'Сначала важно убедиться, что денег хватит на обязательные платежи.',
        },
        {
          id: 'b',
          text: 'Открыть вклад на все деньги без проверки счетов',
          isCorrect: false,
          explanation:
            'Если вложить всё, может не хватить денег на важные расходы.',
        },
        {
          id: 'c',
          text: 'Потратить всё на случайную покупку',
          isCorrect: false,
          explanation: 'Такая трата не помогает создать финансовую устойчивость.',
        },
      ],
    },
    {
      title: 'Ответственный кредит',
      description: 'Проверь понимание кредитной нагрузки.',
      difficulty: 'Средне',
      type: 'quiz',
      question: 'Что важно учитывать перед оформлением кредита?',
      options: [
        {
          id: 'a',
          text: 'Размер платежа, срок и общую переплату',
          isCorrect: true,
          explanation:
            'Кредит нужно оценивать не только по сумме, но и по будущим платежам.',
        },
        {
          id: 'b',
          text: 'Только сумму, которую дают сразу',
          isCorrect: false,
          explanation:
            'Важно помнить, что кредит нужно возвращать с процентами.',
        },
        {
          id: 'c',
          text: 'Можно ли не возвращать долг',
          isCorrect: false,
          explanation: 'Просрочки приводят к штрафам и ухудшают положение игрока.',
        },
      ],
    },
    {
      title: 'Финансовая стратегия',
      description: 'Выбери решение для долгосрочной стабильности.',
      difficulty: 'Сложно',
      type: 'decision',
      question:
        'У игрока есть кредит, неоплаченные счета и возможность купить буст. Что лучше сделать сначала?',
      options: [
        {
          id: 'a',
          text: 'Сначала закрыть обязательные платежи и оценить остаток бюджета',
          isCorrect: true,
          explanation:
            'Обязательные платежи важнее дополнительных покупок и снижают риск штрафов.',
        },
        {
          id: 'b',
          text: 'Купить буст, не проверяя счета и кредит',
          isCorrect: false,
          explanation:
            'Буст может быть полезен, но обязательства обычно важнее.',
        },
        {
          id: 'c',
          text: 'Игнорировать платежи и ждать',
          isCorrect: false,
          explanation:
            'Ожидание может привести к штрафам и ухудшению состояния игрока.',
        },
      ],
    },
  ];

  return templates
    .slice(0, count)
    .map((mission, index) => normalizeMission(mission, level, index));
}

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'AI server is running',
    provider: 'openrouter',
    model: MODEL,
  });
});

app.post('/ask-advisor', async (req, res) => {
  const question = String(req.body?.question || '').trim();
  const gameState = req.body?.gameState || {};

  try {
    if (!question) {
      return res.status(400).json({
        error: 'Вопрос не должен быть пустым.',
      });
    }

    if (question.length > 800) {
      return res.status(400).json({
        error: 'Вопрос слишком длинный. Сократи его.',
      });
    }

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `
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
        },
        {
          role: 'user',
          content: `
Вопрос игрока:
${question}

Текущее игровое состояние:
${safeJsonStringify(gameState)}
          `,
        },
      ],
      stream: false,
    });

    const answer = completion.choices?.[0]?.message?.content;

    return res.json({
      answer: answer || createLocalAdvisorAnswer(question, gameState),
    });
  } catch (error) {
    console.error('[ask-advisor] error:', error);

    return res.json({
      answer: createLocalAdvisorAnswer(question, gameState),
      fallback: true,
    });
  }
});

app.post('/generate-missions', async (req, res) => {
  const level = Math.max(1, Math.min(12, Number(req.body?.level || 1)));
  const count = Math.max(3, Math.min(8, Number(req.body?.count || 5)));
  const gameState = req.body?.gameState || {};

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `
Ты генерируешь набор миссий для мобильной игры Finity.

Нужно вернуть только JSON-массив без Markdown и без пояснений вокруг.

Верни ровно ${count} миссий.

Формат каждой миссии:
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
    },
    {
      "id": "c",
      "text": "string",
      "isCorrect": false,
      "explanation": "string"
    }
  ]
}

Правила:
- язык: русский;
- темы выбирай сам;
- темы должны быть разными;
- используй темы: расходы, накопления, вклады, кредиты, домашние счета, ипотека, финансовая подушка, рискованные сделки, бюджет;
- должны быть миссии разной сложности;
- минимум одна миссия должна быть "Легко";
- минимум одна миссия должна быть "Средне";
- минимум одна миссия должна быть "Сложно";
- в каждой миссии должно быть 3 или 4 варианта ответа;
- правильный вариант должен быть ровно один;
- explanations должны объяснять, почему вариант правильный или неправильный;
- не используй реальные банки и реальные инвестиционные обещания;
- награды должны быть умеренными;
- миссии должны подходить уровню игрока.
          `,
        },
        {
          role: 'user',
          content: `
Уровень игрока: ${level}

Текущее игровое состояние:
${safeJsonStringify(gameState)}
          `,
        },
      ],
      stream: false,
    });

    const content = completion.choices?.[0]?.message?.content || '';
    const jsonText = extractJsonArray(content);
    const rawMissions = JSON.parse(jsonText);

    const missions = Array.isArray(rawMissions)
      ? rawMissions
          .slice(0, count)
          .map((mission, index) => normalizeMission(mission, level, index))
      : createFallbackMissions(level, count);

    if (missions.length === 0) {
      return res.json({
        missions: createFallbackMissions(level, count),
        fallback: true,
      });
    }

    return res.json({
      missions,
    });
  } catch (error) {
    console.error('[generate-missions] error:', error);

    return res.json({
      missions: createFallbackMissions(level, count),
      fallback: true,
    });
  }
});

app.post('/generate-mission', async (req, res) => {
  const level = Math.max(1, Math.min(12, Number(req.body?.level || 1)));

  return res.json({
    mission: createFallbackMissions(level, 1)[0],
    fallback: true,
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`AI server started: http://localhost:${port}`);
});