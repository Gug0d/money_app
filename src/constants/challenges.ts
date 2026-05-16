export type Job = {
  id: string;
  title: string;
  description: string;
  requiredLevel: number;
  salary: number;
};

export type Property = {
  id: string;
  title: string;
  description: string;
  requiredLevel: number;
  price: number;
  bonus: string;
};

export type RiskDeal = {
  id: string;
  title: string;
  description: string;
  requiredLevel: number;
  cost: number;
  reward: number;
  failPenalty: number;
  successChance: number;
};

export type Boost = {
  id: string;
  title: string;
  description: string;
  requiredLevel: number;
  price: number;
  effect: string;
};

export const jobs: Job[] = [
  {
    id: 'intern',
    title: 'Стажёр',
    description: 'Первая работа с небольшим доходом.',
    requiredLevel: 1,
    salary: 25,
  },
  {
    id: 'courier',
    title: 'Курьер',
    description: 'Больше активности, больше стабильного дохода.',
    requiredLevel: 2,
    salary: 45,
  },
  {
    id: 'office_assistant',
    title: 'Офисный помощник',
    description: 'Работа с документами и базовыми финансовыми задачами.',
    requiredLevel: 3,
    salary: 70,
  },
  {
    id: 'analyst',
    title: 'Финансовый аналитик',
    description: 'Высокий доход за счёт финансовой грамотности.',
    requiredLevel: 5,
    salary: 120,
  },
  {
    id: 'consultant',
    title: 'Финансовый консультант',
    description: 'Профессиональная работа с крупным доходом.',
    requiredLevel: 7,
    salary: 190,
  },
];

export const properties: Property[] = [
  {
    id: 'room',
    title: 'Комната',
    description: 'Первое собственное пространство.',
    requiredLevel: 2,
    price: 500,
    bonus: '+5 к комфорту',
  },
  {
    id: 'small_flat',
    title: 'Маленькая квартира',
    description: 'Больше стабильности и меньше зависимости от аренды.',
    requiredLevel: 4,
    price: 1500,
    bonus: '-5% к бытовым расходам',
  },
  {
    id: 'family_flat',
    title: 'Семейная квартира',
    description: 'Крупная цель для уверенного игрока.',
    requiredLevel: 6,
    price: 3500,
    bonus: '+10 к комфорту',
  },
  {
    id: 'country_house',
    title: 'Загородный дом',
    description: 'Престижная покупка с большим бонусом к качеству жизни.',
    requiredLevel: 8,
    price: 7000,
    bonus: '+10% к доходу',
  },
];

export const riskDeals: RiskDeal[] = [
  {
    id: 'quick_trade',
    title: 'Быстрая сделка',
    description: 'Можно быстро заработать, но есть риск потерять вложение.',
    requiredLevel: 1,
    cost: 40,
    reward: 110,
    failPenalty: 20,
    successChance: 60,
  },
  {
    id: 'crypto_jump',
    title: 'Крипто-скачок',
    description: 'Высокая волатильность: прибыль выше, риск тоже.',
    requiredLevel: 3,
    cost: 120,
    reward: 320,
    failPenalty: 80,
    successChance: 45,
  },
  {
    id: 'business_scheme',
    title: 'Рискованный бизнес',
    description: 'Серьёзная авантюра для опытного игрока.',
    requiredLevel: 6,
    cost: 300,
    reward: 850,
    failPenalty: 200,
    successChance: 35,
  },
];

export const boosts: Boost[] = [
  {
    id: 'salary_boost',
    title: 'Буст зарплаты',
    description: 'Следующая выплата с работы станет выше.',
    requiredLevel: 1,
    price: 80,
    effect: '+50% к следующей зарплате',
  },
  {
    id: 'smart_budget',
    title: 'Умный бюджет',
    description: 'Помогает контролировать расходы.',
    requiredLevel: 2,
    price: 120,
    effect: 'Скидка на будущие расходы',
  },
  {
    id: 'risk_protection',
    title: 'Защита от риска',
    description: 'Снижает потери при неудачной сделке.',
    requiredLevel: 4,
    price: 180,
    effect: 'Меньше штраф при провале',
  },
];