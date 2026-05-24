export type TutorialActionTarget =
  | 'none'
  | 'home'
  | 'life'
  | 'profile'
  | 'missions'
  | 'advisor'
  | 'household'
  | 'challenges'
  | 'bank';

export type TutorialHighlight = {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius?: number;
  cardPosition?: 'top' | 'bottom';
};

export type TutorialStep = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  actionText?: string;
  actionTarget?: TutorialActionTarget;
  locked?: boolean;
  lockedText?: string;

  targetKey?: string;
  targetPadding?: number;
  highlight?: TutorialHighlight;
};

export type TutorialFlow = {
  id: string;
  unlockLevel: number;
  title: string;
  description: string;
  steps: TutorialStep[];
};

export const BANK_UNLOCK_LEVEL = 2;
export const MORTGAGE_UNLOCK_LEVEL = 3;
export const CHALLENGES_ADVANCED_UNLOCK_LEVEL = 4;
export const LOAN_UNLOCK_LEVEL = 5;

export const TUTORIAL_FLOWS: TutorialFlow[] = [
  {
    id: 'first-start',
    unlockLevel: 1,
    title: 'Первое знакомство',
    description: 'Обучение основным разделам игры.',
    steps: [
      {
        id: 'welcome',
        title: 'Добро пожаловать в Finity!',
        subtitle: 'Начинаем обучение',
        description:
          'Ты нажал «Играть» и попал в режим жизни. Сейчас я покажу основные разделы: Дом, Челленджи, Миссии, Советы и Банк.',
        actionText: 'Дальше',
        actionTarget: 'none',
      },
      {
        id: 'life-main',
        title: 'Карта жизни',
        subtitle: 'Главный экран',
        description:
          'Здесь находятся основные разделы: Дом, Челленджи, Банк, Советы и Миссии. Переходы выполняются через кружки на карте.',
        actionText: 'Дальше',
        actionTarget: 'life',
        targetKey: 'life-main',
        targetPadding: 8,
        highlight: {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderRadius: 30,
          cardPosition: 'top',
        },
      },
      {
        id: 'life-profile',
        title: 'Профиль игрока',
        subtitle: 'Теперь он находится сверху слева',
        description:
          'Кнопка профиля перенесена в верхний левый угол. Здесь игрок может открыть профиль, посмотреть данные аккаунта и использовать тестовые функции.',
        actionText: 'Дальше',
        actionTarget: 'life',
        targetKey: 'life-profile-button',
        targetPadding: 10,
        highlight: {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderRadius: 24,
          cardPosition: 'bottom',
        },
      },
      {
        id: 'household-main',
        title: 'Дом',
        subtitle: 'Раздел бытовых расходов',
        description:
          'В разделе «Дом» игрок следит за счетами, комфортом и бытовыми проблемами. Этот экран показывает, что часть денег всегда уходит на обязательные расходы.',
        actionText: 'Дальше',
        actionTarget: 'household',
        targetKey: 'household-main',
        targetPadding: 8,
        highlight: {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderRadius: 28,
          cardPosition: 'bottom',
        },
      },
      {
        id: 'household-events',
        title: 'Случайные события',
        subtitle: 'Не все расходы можно предсказать',
        description:
          'Иногда появляются случайные события: поломки, срочные покупки или бытовые проблемы. Они учат оставлять запас денег на непредвиденные ситуации.',
        actionText: 'Дальше',
        actionTarget: 'household',
        targetKey: 'household-events',
        targetPadding: 8,
        highlight: {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderRadius: 24,
          cardPosition: 'bottom',
        },
      },
      {
        id: 'household-payments',
        title: 'Оплата счетов',
        subtitle: 'Плати вовремя, чтобы избежать штрафов',
        description:
          'Счета за интернет, электричество, воду и другие услуги нужно оплачивать вовремя. Если откладывать оплату, игрок может получить штраф.',
        actionText: 'Дальше',
        actionTarget: 'household',
        targetKey: 'household-payments',
        targetPadding: 8,
        highlight: {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderRadius: 24,
          cardPosition: 'top',
        },
      },
      {
        id: 'challenges-status',
        title: 'Челленджи',
        subtitle: 'Работа и финансовые решения',
        description:
          'В разделе «Челленджи» игрок зарабатывает деньги, получает работу и сталкивается с финансовыми ситуациями, которые влияют на развитие персонажа.',
        actionText: 'Дальше',
        actionTarget: 'challenges',
        targetKey: 'challenges-status',
        targetPadding: 8,
        highlight: {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderRadius: 26,
          cardPosition: 'bottom',
        },
      },
      {
        id: 'missions-on-map',
        title: 'Миссии',
        subtitle: 'Проверяй знания и развивай персонажа',
        description:
          'В миссиях игрок отвечает на вопросы. За правильные ответы начисляются XP и FinCoin, которые помогают повышать уровень и открывать новые разделы игры.',
        actionText: 'Дальше',
        actionTarget: 'life',
        targetKey: 'life-missions-button',
        targetPadding: 10,
        highlight: {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderRadius: 36,
          cardPosition: 'top',
        },
      },
      {
        id: 'bank-locked',
        title: 'Банк',
        subtitle: 'Откроется позже',
        description:
          'Банк пока закрыт. Он станет доступен на 2 уровне. В банке игрок сможет открывать вклады, брать кредиты и пользоваться финансовыми инструментами.',
        actionText: 'Дальше',
        actionTarget: 'life',
        targetKey: 'life-bank-button',
        targetPadding: 10,
        locked: true,
        lockedText: 'Банк откроется на 2 уровне',
        highlight: {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderRadius: 36,
          cardPosition: 'top',
        },
      },
      {
        id: 'advisor-on-map',
        title: 'Советы',
        subtitle: 'Финансовый помощник',
        description:
          'Раздел «Советы» помогает понять игровые механики, объясняет финансовые решения и подсказывает, что можно сделать дальше.',
        actionText: 'Завершить обучение',
        actionTarget: 'life',
        targetKey: 'life-advice-button',
        targetPadding: 10,
        highlight: {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderRadius: 36,
          cardPosition: 'top',
        },
      },
    ],
  },
];

export function getNextTutorialFlowForLevel(
  level: number,
  viewedTutorialIds: string[]
) {
  return (
    TUTORIAL_FLOWS.find(
      (flow) =>
        flow.unlockLevel <= level && !viewedTutorialIds.includes(flow.id)
    ) ?? null
  );
}

export function isBankUnlocked(level: number) {
  return level >= BANK_UNLOCK_LEVEL;
}

export function isMortgageUnlocked(level: number) {
  return level >= MORTGAGE_UNLOCK_LEVEL;
}