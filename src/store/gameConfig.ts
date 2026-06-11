import { HomeBill, HomeEvent, MortgageState } from './gameTypes';

export const PRICE_GROWTH_PER_LEVEL = 0.15;

export const MINUTE = 60;
export const HOUR = 60 * 60;

export const minutes = (value: number) => value * MINUTE;
export const hours = (value: number) => value * HOUR;

export const minutesMs = (value: number) => minutes(value) * 1000;
export const hoursMs = (value: number) => hours(value) * 1000;

export const TIME_GROWTH_PER_LEVEL = 0.12;
export const MAX_TIME_MULTIPLIER = 3;

export function getLevelPriceMultiplier(level: number): number {
  const safeLevel = Math.max(1, level);

  return 1 + (safeLevel - 1) * PRICE_GROWTH_PER_LEVEL;
}

export function scaleFinCoinPrice(basePrice: number, level: number): number {
  return Math.round(basePrice * getLevelPriceMultiplier(level));
}

export function scaleRubPrice(basePrice: number, level: number): number {
  return Math.round(
    (basePrice * getLevelPriceMultiplier(level)) / 1000
  ) * 1000;
}

export const ADVISOR_BASE_QUESTION_COST = 20;
export const ADVISOR_COST_GROWTH_PER_LEVEL = 0.18;
export const ADVISOR_COST_STEP_PER_QUESTION = 10;

export function getAdvisorQuestionCost(
  level: number,
  advisorQuestionsAsked = 0
): number {
  const safeLevel = Math.max(1, level);
  const safeQuestionsAsked = Math.max(0, advisorQuestionsAsked);

  const levelCost =
    ADVISOR_BASE_QUESTION_COST *
    (1 + (safeLevel - 1) * ADVISOR_COST_GROWTH_PER_LEVEL);

  const questionCost = safeQuestionsAsked * ADVISOR_COST_STEP_PER_QUESTION;
  const rawCost = levelCost + questionCost;

  return Math.max(ADVISOR_BASE_QUESTION_COST, Math.round(rawCost / 5) * 5);
}

export function getLevelTimeMultiplier(level: number): number {
  const safeLevel = Math.max(1, level);

  return Math.min(
    MAX_TIME_MULTIPLIER,
    1 + (safeLevel - 1) * TIME_GROWTH_PER_LEVEL
  );
}

export function scaleDurationSeconds(
  baseSeconds: number,
  level: number
): number {
  return Math.max(1, Math.round(baseSeconds * getLevelTimeMultiplier(level)));
}

export function scaleDurationMs(baseMs: number, level: number): number {
  return Math.max(1000, Math.round(baseMs * getLevelTimeMultiplier(level)));
}

export const GAME_TIMERS = {
  salaryCooldown: minutes(10),

  boostRefresh: minutes(20),

  loanPayment: hours(2),

  mortgageDuration: hours(6),

  homeBillsRefresh: hours(10),

  homeBillsDue: {
    electricity: hours(2),
    water: hours(3),
    internet: hours(4),
    rent: hours(5),
  },

  homeEventDelay: {
    min: hours(1),
    max: hours(3),
  },
};

export function getSalaryCooldownSeconds(level: number): number {
  return scaleDurationSeconds(GAME_TIMERS.salaryCooldown, level);
}

export function getBoostRefreshSeconds(level: number): number {
  return scaleDurationSeconds(GAME_TIMERS.boostRefresh, level);
}

export function getLoanPaymentDurationSeconds(
  level: number,
  baseSeconds = GAME_TIMERS.loanPayment
): number {
  return scaleDurationSeconds(baseSeconds, level);
}

export function getMortgageDurationSeconds(level: number): number {
  return scaleDurationSeconds(GAME_TIMERS.mortgageDuration, level);
}

export function getHomeBillsRefreshDuration(level: number): number {
  return scaleDurationMs(GAME_TIMERS.homeBillsRefresh * 1000, level);
}

export function getHomeBillDueMs(baseSeconds: number, level: number): number {
  return scaleDurationMs(baseSeconds * 1000, level);
}

function scaleHomeBill(bill: HomeBill, level: number): HomeBill {
  return {
    ...bill,
    amount: scaleFinCoinPrice(bill.amount, level),
    penalty: scaleFinCoinPrice(bill.penalty, level),
  };
}

function scaleHomeEvent(event: HomeEvent, level: number): HomeEvent {
  return {
    ...event,
    cost: scaleFinCoinPrice(event.cost, level),
  };
}

export const LEVELS = [
  { level: 1, xpToNextLevel: 250 },
  { level: 2, xpToNextLevel: 400 },
  { level: 3, xpToNextLevel: 600 },
  { level: 4, xpToNextLevel: 850 },
  { level: 5, xpToNextLevel: 1150 },
  { level: 6, xpToNextLevel: 1500 },
  { level: 7, xpToNextLevel: 1900 },
  { level: 8, xpToNextLevel: 2350 },
  { level: 9, xpToNextLevel: 2850 },
  { level: 10, xpToNextLevel: 3400 },
  { level: 11, xpToNextLevel: 4000 },
  { level: 12, xpToNextLevel: 4700 },
];

export function getLevelData(level: number) {
  return LEVELS.find((item) => item.level === level) || LEVELS[0];
}

export function getNextLevelXp(level: number) {
  return getLevelData(level).xpToNextLevel;
}

export function getMaxLevel() {
  return LEVELS[LEVELS.length - 1].level;
}

export function convertTotalXpToLevelProgress(totalXp: number) {
  let nextLevel = 1;
  let nextXp = Math.max(0, totalXp);

  const maxLevel = getMaxLevel();

  while (nextLevel < maxLevel) {
    const xpToNextLevel = getNextLevelXp(nextLevel);

    if (nextXp < xpToNextLevel) {
      break;
    }

    nextXp -= xpToNextLevel;
    nextLevel += 1;
  }

  if (nextLevel >= maxLevel) {
    nextLevel = maxLevel;
    nextXp = Math.min(nextXp, getNextLevelXp(maxLevel));
  }

  return {
    level: nextLevel,
    xp: nextXp,
  };
}

export type XpRewardDifficulty = 'Легко' | 'Средне' | 'Сложно';

export const XP_REWARD_BY_DIFFICULTY: Record<XpRewardDifficulty, number> = {
  Легко: 80,
  Средне: 140,
  Сложно: 220,
};

export const XP_GROWTH_PER_LEVEL = 0.12;
export const MAX_XP_REWARD_MULTIPLIER = 2.5;

export function getLevelXpMultiplier(level: number): number {
  const safeLevel = Math.max(1, level);

  return Math.min(
    MAX_XP_REWARD_MULTIPLIER,
    1 + (safeLevel - 1) * XP_GROWTH_PER_LEVEL
  );
}

export function getMissionXpReward(
  difficulty: string,
  level: number
): number {
  const safeDifficulty: XpRewardDifficulty =
    difficulty === 'Средне' || difficulty === 'Сложно'
      ? difficulty
      : 'Легко';

  const baseReward = XP_REWARD_BY_DIFFICULTY[safeDifficulty];
  const scaledReward = baseReward * getLevelXpMultiplier(level);

  return Math.round(scaledReward / 5) * 5;
}

export function getWrongAnswerXpPenalty(level: number): number {
  return Math.min(30, Math.max(5, Math.round(level * 2)));
}

export const MORTGAGE_UNLOCK_LEVEL = 3;

export const HOME_BILLS_REFRESH_DURATION = hoursMs(10);

export const DEFAULT_MORTGAGE: MortgageState = {
  isActive: false,
  isCompleted: false,
  totalSeconds: GAME_TIMERS.mortgageDuration,
  durationSeconds: GAME_TIMERS.mortgageDuration,
  startedAt: null,
  propertyId: null,
  propertyTitle: null,
  offerId: null,
  bankName: null,
  downPayment: 0,
  monthlyPayment: 0,
  totalPayment: 0,
  overpayment: 0,
};

export const HOME_EVENTS: HomeEvent[] = [
  {
    id: 'boiler',
    title: 'Сломался бойлер',
    description: 'Можно починить сейчас или отложить и потерять комфорт.',
    cost: 150,
    comfortReward: 12,
    disciplineReward: 3,
    postponeComfortPenalty: 15,
    postponeDisciplinePenalty: 5,
    icon: '💥',
  },
  {
    id: 'internet',
    title: 'Проблемы с интернетом',
    description: 'Провайдер предлагает срочный ремонт линии.',
    cost: 80,
    comfortReward: 7,
    disciplineReward: 2,
    postponeComfortPenalty: 10,
    postponeDisciplinePenalty: 3,
    icon: '🌐',
  },
  {
    id: 'pipes',
    title: 'Протекает труба',
    description: 'Если не решить проблему сейчас, дома станет менее комфортно.',
    cost: 120,
    comfortReward: 10,
    disciplineReward: 4,
    postponeComfortPenalty: 14,
    postponeDisciplinePenalty: 4,
    icon: '💧',
  },
];

export const getRandomHomeEvent = (level = 1) =>
  scaleHomeEvent(
    HOME_EVENTS[Math.floor(Math.random() * HOME_EVENTS.length)],
    level
  );

export const getRandomEventDelay = (level = 1) => {
  const minSeconds = scaleDurationSeconds(
    GAME_TIMERS.homeEventDelay.min,
    level
  );

  const maxSeconds = scaleDurationSeconds(
    GAME_TIMERS.homeEventDelay.max,
    level
  );

  return (
    minSeconds + Math.floor(Math.random() * (maxSeconds - minSeconds))
  ) * 1000;
};

export function getPropertyBillsMultiplier(ownedPropertyId: string | null) {
  switch (ownedPropertyId) {
    case 'room':
      return 0.8;

    case 'small_flat':
      return 0.9;

    case 'family_flat':
      return 1.15;

    case 'country_house':
      return 1.4;

    default:
      return 1;
  }
}

export const createDefaultHomeBills = (
  level = 1,
  ownedPropertyId: string | null = null
): HomeBill[] => {
  const now = Date.now();
  const propertyMultiplier = getPropertyBillsMultiplier(ownedPropertyId);

  const bills: HomeBill[] = [
    {
      id: 1,
      title: 'Электричество',
      amount: Math.round(45 * propertyMultiplier),
      due: 'до 5 числа',
      status: 'pending',
      icon: '⚡',
      dueAt:
        now + getHomeBillDueMs(GAME_TIMERS.homeBillsDue.electricity, level),
      penalty: Math.round(15 * propertyMultiplier),
      penaltyApplied: false,
    },
    {
      id: 2,
      title: 'Вода',
      amount: Math.round(25 * propertyMultiplier),
      due: 'до 7 числа',
      status: 'pending',
      icon: '💧',
      dueAt: now + getHomeBillDueMs(GAME_TIMERS.homeBillsDue.water, level),
      penalty: Math.round(10 * propertyMultiplier),
      penaltyApplied: false,
    },
    {
      id: 3,
      title: 'Интернет',
      amount: Math.round(30 * propertyMultiplier),
      due: 'до 10 числа',
      status: 'pending',
      icon: '🌐',
      dueAt: now + getHomeBillDueMs(GAME_TIMERS.homeBillsDue.internet, level),
      penalty: Math.round(12 * propertyMultiplier),
      penaltyApplied: false,
    },
    {
      id: 4,
      title: ownedPropertyId ? 'Содержание жилья' : 'Аренда',
      amount: Math.round((ownedPropertyId ? 220 : 350) * propertyMultiplier),
      due: 'до 1 числа',
      status: 'pending',
      icon: '🏠',
      dueAt: now + getHomeBillDueMs(GAME_TIMERS.homeBillsDue.rent, level),
      penalty: Math.round(50 * propertyMultiplier),
      penaltyApplied: false,
    },
  ];

  return bills.map((bill) => scaleHomeBill(bill, level));
};