import { HomeBill, HomeEvent, MortgageState } from './gameTypes';

export const LEVELS = [
  { level: 1, minXp: 0, maxXp: 100 },
  { level: 2, minXp: 100, maxXp: 250 },
  { level: 3, minXp: 250, maxXp: 450 },
  { level: 4, minXp: 450, maxXp: 700 },
  { level: 5, minXp: 700, maxXp: 1000 },
  { level: 6, minXp: 1000, maxXp: 1350 },
  { level: 7, minXp: 1350, maxXp: 1750 },
  { level: 8, minXp: 1750, maxXp: 2200 },
  { level: 9, minXp: 2200, maxXp: 2700 },
  { level: 10, minXp: 2700, maxXp: 3250 },
  { level: 11, minXp: 3250, maxXp: 3850 },
  { level: 12, minXp: 3850, maxXp: 4500 },
];

export const MORTGAGE_UNLOCK_LEVEL = 3;

export const HOME_BILLS_REFRESH_DURATION = 10 * 60 * 60 * 1000;

export const DEFAULT_MORTGAGE: MortgageState = {
  isActive: false,
  isCompleted: false,
  totalSeconds: 120,
  durationSeconds: 120,
  startedAt: null,
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

export const getRandomHomeEvent = () =>
  HOME_EVENTS[Math.floor(Math.random() * HOME_EVENTS.length)];

export const getRandomEventDelay = () => {
  const minSeconds = 30;
  const maxSeconds = 90;

  return (
    minSeconds + Math.floor(Math.random() * (maxSeconds - minSeconds))
  ) * 1000;
};

export const createDefaultHomeBills = (): HomeBill[] => {
  const now = Date.now();

  return [
    {
      id: 1,
      title: 'Электричество',
      amount: 45,
      due: 'до 5 числа',
      status: 'pending',
      icon: '⚡',
      dueAt: now + 45 * 1000,
      penalty: 15,
      penaltyApplied: false,
    },
    {
      id: 2,
      title: 'Вода',
      amount: 25,
      due: 'до 7 числа',
      status: 'pending',
      icon: '💧',
      dueAt: now + 60 * 1000,
      penalty: 10,
      penaltyApplied: false,
    },
    {
      id: 3,
      title: 'Интернет',
      amount: 30,
      due: 'до 10 числа',
      status: 'pending',
      icon: '🌐',
      dueAt: now + 75 * 1000,
      penalty: 12,
      penaltyApplied: false,
    },
    {
      id: 4,
      title: 'Аренда',
      amount: 350,
      due: 'до 1 числа',
      status: 'pending',
      icon: '🏠',
      dueAt: now + 90 * 1000,
      penalty: 50,
      penaltyApplied: false,
    },
  ];
};

export const getLevelDataByXp = (xp: number) =>
  LEVELS.find((level) => xp >= level.minXp && xp < level.maxXp) ||
  LEVELS[LEVELS.length - 1];