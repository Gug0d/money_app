export type TutorialActionTarget =
  | 'none'
  | 'home'
  | 'life'
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
        subtitle: 'Это игра про финансовую жизнь',
        description:
          'Здесь ты развиваешь персонажа, выполняешь задания, получаешь опыт, зарабатываешь FinCoin и постепенно открываешь новые финансовые механики.',
        actionText: 'Дальше',
        actionTarget: 'none',
      },
      {
        id: 'home-main',
        title: 'Главный экран',
        subtitle: 'Здесь видно текущее состояние игрока',
        description:
          'На главном экране отображается основная информация о персонаже: прогресс, деньги, уровень и текущие игровые показатели. С него удобно начинать игровой день.',
        actionText: 'Дальше',
        actionTarget: 'home',
        targetKey: 'home-main',
        targetPadding: 10,
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
        id: 'household-main',
        title: 'Дом и быт',
        subtitle: 'Раздел обязательных бытовых расходов',
        description:
          'В разделе «Дом» игрок следит за бытовыми расходами и состоянием жилья. Этот экран помогает понять, что в реальной жизни часть дохода постоянно уходит на обязательные платежи.',
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
          'Иногда в разделе «Дом» появляются случайные события: поломки, срочные покупки или бытовые проблемы. Они учат оставлять запас денег, потому что непредвиденные расходы могут появиться в любой момент.',
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
          'Ниже находятся счета за интернет, электричество, воду и другие услуги. Если долго не оплачивать счета, игрок может получить штраф или ухудшить своё финансовое положение.',
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
        title: 'Работа и челленджи',
        subtitle: 'Здесь игрок зарабатывает и принимает решения',
        description:
          'В разделе «Челленджи» игрок сталкивается с финансовыми ситуациями. Здесь можно работать, получать доход, покупать имущество и выбирать действия, которые влияют на развитие персонажа.',
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
        id: 'missions-list',
        title: 'Цели и миссии',
        subtitle: 'Основной способ получать опыт',
        description:
          'Миссии помогают получать XP. Когда опыта становится достаточно, уровень повышается. С каждым новым уровнем открываются новые игровые и финансовые возможности.',
        actionText: 'Дальше',
        actionTarget: 'missions',
        targetKey: 'mission-first-card',
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
        id: 'bank-locked',
        title: 'Раздел «Банк»',
        subtitle: 'Пока закрыт',
        description:
          'Банк — это раздел с финансовыми инструментами: вкладами, кредитами и ипотекой. Сейчас он закрыт, потому что игрок только начинает обучение. Сначала нужно получить базовый опыт.',
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
        id: 'advisor-screen',
        title: 'Раздел «Советы»',
        subtitle: 'Финансовый помощник',
        description:
          'Советы объясняют игровые механики, помогают понять, что делать дальше, и предупреждают о возможных ошибках. Этот раздел нужен, чтобы игрок лучше понимал свои финансовые решения.',
        actionText: 'Завершить обучение',
        actionTarget: 'advisor',
        targetKey: 'advisor-screen',
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