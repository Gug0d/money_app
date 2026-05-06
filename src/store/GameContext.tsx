import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { auth, db } from '../services/firebase';
import { DepositProduct } from '../constants/depositProducts';
import { LoanProduct } from '../constants/loanProducts';

type MortgageStatus = 'locked' | 'available' | 'active' | 'completed';
type ActiveLoanStatus = 'active' | 'overdue' | 'closed';

type HomeBillStatus = 'pending' | 'paid' | 'warning' | 'overdue';

type HomeBill = {
  id: number;
  title: string;
  amount: number;
  due: string;
  status: HomeBillStatus;
  icon: string;

  dueAt: number;
  penalty: number;
  penaltyApplied: boolean;
};

type HomeEvent = {
  id: string;
  title: string;
  description: string;
  cost: number;
  comfortReward: number;
  disciplineReward: number;
  postponeComfortPenalty: number;
  postponeDisciplinePenalty: number;
  icon: string;
};

type MortgageState = {
  isActive: boolean;
  isCompleted: boolean;
  totalSeconds: number;
  durationSeconds: number;
  startedAt: number | null;
};

type ActiveDeposit = {
  productId: string;
  title: string;
  amount: number;
  interestPercent: number;
  payoutAmount: number;
  durationSeconds: number;
  startedAt: number;
  isCompleted: boolean;
};

type ActiveLoan = {
  productId: string;
  title: string;

  principal: number;
  remainingDebt: number;

  interestPercent: number;
  totalRepayment: number;

  monthlyPayment: number;
  paidPayments: number;
  totalPayments: number;

  nextPaymentAt: number;

  overdueDays: number;
  penaltyAmount: number;

  status: ActiveLoanStatus;
};


type GameContextType = {
  xp: number;
  finCoin: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressToNextLevel: number;

  mortgage: MortgageState;
  mortgageStatus: MortgageStatus;
  mortgageRemainingSeconds: number;

  activeDeposit: ActiveDeposit | null;
  depositRemainingSeconds: number;

  activeLoan: ActiveLoan | null;
  loanRemainingSeconds: number;

  homeBills: HomeBill[];
  homeComfort: number;
  homeDiscipline: number;
  homeEvent: HomeEvent | null;
  homeEventAvailableAt: number | null;

  payHomeBill: (billId: number) => Promise<boolean>;
  repairHomeProblem: () => Promise<boolean>;
  postponeHomeProblem: () => Promise<boolean>;
  resetHomeBillsForTest: () => Promise<void>;
  triggerHomeEventForTest: () => Promise<void>;
  
  isGuest: boolean;
  isGameLoading: boolean;
  onboardingCompleted: boolean;
  userDataLoaded: boolean;

  setOnboardingCompleted: (value: boolean) => void;

  addRewards: (xpToAdd: number, finCoinToAdd: number) => Promise<void>;
  addTestXp: (amount: number) => Promise<void>;
  addTestCoins: (amount: number) => Promise<void>;
  spendFinCoin: (amount: number) => Promise<boolean>;

  openDeposit: (
    product: DepositProduct,
    amount?: number
  ) => Promise<{ success: boolean; message: string }>;

  reduceDepositTime: (seconds: number, cost?: number) => Promise<boolean>;

  takeLoan: (
    product: LoanProduct
  ) => Promise<{ success: boolean; message: string }>;

  payLoan: () => Promise<boolean>;
  closeLoan: () => Promise<boolean>;
  forceOverdue: () => void;

  startMortgage: (options?: {
    totalSeconds?: number;
    downPayment?: number;
  }) => Promise<boolean>;

  reduceMortgageTime: (seconds: number, cost: number) => Promise<boolean>;
  reloadUserData: () => Promise<void>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const LEVELS = [
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

const MORTGAGE_UNLOCK_LEVEL = 3;

const DEFAULT_MORTGAGE: MortgageState = {
  isActive: false,
  isCompleted: false,
  totalSeconds: 120,
  durationSeconds: 120,
  startedAt: null,
};

const HOME_EVENTS: HomeEvent[] = [
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

const getRandomHomeEvent = () =>
  HOME_EVENTS[Math.floor(Math.random() * HOME_EVENTS.length)];

const getRandomEventDelay = () => {
  const minSeconds = 30;
  const maxSeconds = 90;

  return (
    minSeconds + Math.floor(Math.random() * (maxSeconds - minSeconds))
  ) * 1000;
};

const createDefaultHomeBills = (): HomeBill[] => {
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

const getLevelDataByXp = (xp: number) =>
  LEVELS.find((l) => xp >= l.minXp && xp < l.maxXp) ||
  LEVELS[LEVELS.length - 1];

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXp] = useState(0);
  const [finCoin, setFinCoin] = useState(0);
  const [mortgage, setMortgage] = useState<MortgageState>(DEFAULT_MORTGAGE);

  const [activeDeposit, setActiveDeposit] = useState<ActiveDeposit | null>(null);
  const [depositRemainingSeconds, setDepositRemainingSeconds] = useState(0);

  const [activeLoan, setActiveLoan] = useState<ActiveLoan | null>(null);
  const [loanRemainingSeconds, setLoanRemainingSeconds] = useState(0);

  const [homeBills, setHomeBills] = useState<HomeBill[]>(() =>
    createDefaultHomeBills()
  );
  const [homeComfort, setHomeComfort] = useState(70);
  const [homeDiscipline, setHomeDiscipline] = useState(80);
  const [homeEvent, setHomeEvent] = useState<HomeEvent | null>(null);
  const [homeEventAvailableAt, setHomeEventAvailableAt] = useState<number | null>(
    Date.now() + getRandomEventDelay()
  );

  const [isGuest, setIsGuest] = useState(true);
  const [isGameLoading, setIsGameLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [mortgageRemainingSeconds, setMortgageRemainingSeconds] = useState(0);

  const userIdRef = useRef<string | null>(null);
  const depositCompletedRef = useRef(false);
  const mortgageCompletedRef = useRef(false);

  const levelData = useMemo(() => getLevelDataByXp(xp), [xp]);
  const level = levelData.level;

  const progressToNextLevel = useMemo(() => {
    const range = levelData.maxXp - levelData.minXp;
    if (range <= 0) return 1;

    return Math.max(0, Math.min(1, (xp - levelData.minXp) / range));
  }, [xp, levelData]);

  const mortgageStatus: MortgageStatus = useMemo(() => {
    if (level < MORTGAGE_UNLOCK_LEVEL) return 'locked';
    if (mortgage.isCompleted) return 'completed';
    if (mortgage.isActive) return 'active';
    return 'available';
  }, [level, mortgage]);

  const resetLocalState = () => {
    setXp(0);
    setFinCoin(0);
    setMortgage(DEFAULT_MORTGAGE);
    setMortgageRemainingSeconds(0);
    setActiveDeposit(null);
    setDepositRemainingSeconds(0);
    setActiveLoan(null);
    setLoanRemainingSeconds(0);
    setOnboardingCompleted(false);
    setHomeBills(createDefaultHomeBills());
    setHomeComfort(70);
    setHomeDiscipline(80);
    setHomeEvent(null);
    setHomeEventAvailableAt(Date.now() + getRandomEventDelay());
    depositCompletedRef.current = false;
    mortgageCompletedRef.current = false;
  };

  const saveUserGameData = async (data: Record<string, any>) => {
    if (!userIdRef.current) return;
    await updateDoc(doc(db, 'users', userIdRef.current), data);
  };

  const loadUserData = async (
    userOverride?: {
      uid: string;
      email: string | null;
      displayName: string | null;
      isAnonymous: boolean;
    }
  ) => {
    const currentUid = userOverride?.uid ?? userIdRef.current;

    if (!currentUid) {
      resetLocalState();
      setUserDataLoaded(false);
      setIsGameLoading(false);
      return;
    }

    const currentEmail = userOverride?.email ?? auth.currentUser?.email ?? null;
    const currentName =
      userOverride?.displayName ?? auth.currentUser?.displayName ?? null;
    const currentIsAnonymous =
      userOverride?.isAnonymous ?? auth.currentUser?.isAnonymous ?? true;

    try {
      setIsGameLoading(true);
      setUserDataLoaded(false);

      const userRef = doc(db, 'users', currentUid);
      let snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(
          userRef,
          {
            name: currentName || '',
            email: currentEmail || '',
            xp: 0,
            finCoin: 0,
            onboardingCompleted: false,

            mortgage: DEFAULT_MORTGAGE,
            activeDeposit: null,
            activeLoan: null,

            homeBills: createDefaultHomeBills(),
            homeComfort: 70,
            homeDiscipline: 80,
            homeEventResolved: false,

            role: currentIsAnonymous ? 'guest' : 'user',
            createdAt: Date.now(),
          },
          { merge: true }
        );

        snap = await getDoc(userRef);
      }

      if (!snap.exists()) {
        resetLocalState();
        setUserDataLoaded(true);
        setIsGameLoading(false);
        return;
      }

      const data = snap.data();

      setXp(typeof data.xp === 'number' ? data.xp : 0);
      setFinCoin(typeof data.finCoin === 'number' ? data.finCoin : 0);
      setMortgage(data.mortgage || DEFAULT_MORTGAGE);
      setActiveDeposit(data.activeDeposit || null);
      setActiveLoan(data.activeLoan || null);
      setHomeBills(Array.isArray(data.homeBills) ? data.homeBills : createDefaultHomeBills());
      setHomeComfort(typeof data.homeComfort === 'number' ? data.homeComfort : 70);
      setHomeDiscipline(
        typeof data.homeDiscipline === 'number' ? data.homeDiscipline : 80
      );
      setHomeEvent(data.homeEvent || null);

      setHomeEventAvailableAt(
        typeof data.homeEventAvailableAt === 'number'
          ? data.homeEventAvailableAt
          : Date.now() + getRandomEventDelay()
      );
      setOnboardingCompleted(
        typeof data.onboardingCompleted === 'boolean'
          ? data.onboardingCompleted
          : false
      );

      setUserDataLoaded(true);
      setIsGameLoading(false);
    } catch (error) {
      console.log('Ошибка инициализации профиля:', error);
      resetLocalState();
      setUserDataLoaded(true);
      setIsGameLoading(false);
    }
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        userIdRef.current = null;
        setIsGuest(true);
        resetLocalState();
        setUserDataLoaded(false);
        setIsGameLoading(false);
        return;
      }

      userIdRef.current = user.uid;
      setIsGuest(user.isAnonymous);

      await loadUserData({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        isAnonymous: user.isAnonymous,
      });
    });

    return unsubAuth;
  }, []);

  useEffect(() => {
    const updateMortgageRemaining = () => {
      if (!mortgage.isActive || !mortgage.startedAt) {
        setMortgageRemainingSeconds(0);
        return;
      }

      const now = Date.now();
      const passedSeconds = Math.floor((now - mortgage.startedAt) / 1000);
      const remaining = Math.max(0, mortgage.durationSeconds - passedSeconds);

      setMortgageRemainingSeconds(remaining);
    };

    updateMortgageRemaining();

    if (!mortgage.isActive || !mortgage.startedAt) return;

    const interval = setInterval(updateMortgageRemaining, 1000);
    return () => clearInterval(interval);
  }, [mortgage]);

  useEffect(() => {
    const completeMortgage = async () => {
      if (!mortgage.isActive || mortgage.isCompleted || !mortgage.startedAt) {
        return;
      }

      const now = Date.now();
      const passedSeconds = Math.floor((now - mortgage.startedAt) / 1000);
      const remaining = mortgage.durationSeconds - passedSeconds;

      if (remaining > 0) return;
      if (mortgageCompletedRef.current) return;

      mortgageCompletedRef.current = true;

      const nextMortgage: MortgageState = {
        ...mortgage,
        isActive: false,
        isCompleted: true,
      };

      setMortgage(nextMortgage);
      setMortgageRemainingSeconds(0);

      if (!isGuest && userIdRef.current) {
        try {
          await saveUserGameData({
            mortgage: nextMortgage,
          });
        } catch (error) {
          console.log('Ошибка завершения ипотеки:', error);
        }
      }
    };

    completeMortgage();
  }, [mortgageRemainingSeconds, mortgage, isGuest]);

  useEffect(() => {
    if (!mortgage.isActive) {
      mortgageCompletedRef.current = false;
    }
  }, [mortgage.isActive]);

  useEffect(() => {
    const updateDepositRemaining = () => {
      if (!activeDeposit || activeDeposit.isCompleted) {
        setDepositRemainingSeconds(0);
        return;
      }

      const now = Date.now();
      const passedSeconds = Math.floor((now - activeDeposit.startedAt) / 1000);
      const remaining = Math.max(
        0,
        activeDeposit.durationSeconds - passedSeconds
      );

      setDepositRemainingSeconds(remaining);
    };

    updateDepositRemaining();

    if (!activeDeposit || activeDeposit.isCompleted) return;

    const interval = setInterval(updateDepositRemaining, 1000);
    return () => clearInterval(interval);
  }, [activeDeposit]);

  useEffect(() => {
    const completeDeposit = async () => {
      if (!activeDeposit || activeDeposit.isCompleted) return;

      const now = Date.now();
      const passedSeconds = Math.floor((now - activeDeposit.startedAt) / 1000);
      const remaining = activeDeposit.durationSeconds - passedSeconds;

      if (remaining > 0) return;
      if (depositCompletedRef.current) return;

      depositCompletedRef.current = true;

      const nextFinCoin = finCoin + activeDeposit.payoutAmount;

      setFinCoin(nextFinCoin);
      setActiveDeposit(null);
      setDepositRemainingSeconds(0);

      if (!isGuest && userIdRef.current) {
        try {
          await saveUserGameData({
            finCoin: nextFinCoin,
            activeDeposit: null,
          });
        } catch (error) {
          console.log('Ошибка завершения вклада:', error);
        }
      }
    };

    completeDeposit();
  }, [depositRemainingSeconds, activeDeposit, finCoin, isGuest]);

  useEffect(() => {
    if (!activeDeposit) {
      depositCompletedRef.current = false;
    }
  }, [activeDeposit]);

  useEffect(() => {
    if (!activeLoan) return;

    const interval = setInterval(async () => {
      const now = Date.now();

      if (now <= activeLoan.nextPaymentAt) return;

      const penalty = Math.ceil(activeLoan.monthlyPayment * 0.001);
      const nextXp = Math.max(0, xp - 10);

      const updatedLoan: ActiveLoan = {
        ...activeLoan,
        status: 'overdue',
        overdueDays: activeLoan.overdueDays + 1,
        penaltyAmount: activeLoan.penaltyAmount + penalty,
        remainingDebt: activeLoan.remainingDebt + penalty,
        nextPaymentAt: now + 60 * 1000,
      };

      setXp(nextXp);
      setActiveLoan(updatedLoan);

      if (!isGuest && userIdRef.current) {
        try {
          await saveUserGameData({
            xp: nextXp,
            activeLoan: updatedLoan,
          });
        } catch (error) {
          console.log('Ошибка начисления просрочки:', error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeLoan, xp, isGuest]);

  const addRewards = async (xpToAdd: number, finCoinToAdd: number) => {
    const nextXp = xp + xpToAdd;
    const nextFinCoin = finCoin + finCoinToAdd;

    setXp(nextXp);
    setFinCoin(nextFinCoin);

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
          xp: nextXp,
          finCoin: nextFinCoin,
        });
      } catch (error) {
        console.log('Ошибка сохранения награды:', error);
      }
    }
  };

  const addTestXp = async (amount: number) => {
    await addRewards(amount, 0);
  };

  const addTestCoins = async (amount: number) => {
    await addRewards(0, amount);
  };

  const spendFinCoin = async (amount: number) => {
    if (amount <= 0) return true;
    if (finCoin < amount) return false;

    const nextFinCoin = finCoin - amount;
    setFinCoin(nextFinCoin);

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
          finCoin: nextFinCoin,
        });
      } catch (error) {
        console.log('Ошибка списания FinCoin:', error);
        return false;
      }
    }

    return true;
  };

  const openDeposit = async (
    product: DepositProduct,
    amount?: number
  ): Promise<{ success: boolean; message: string }> => {
    if (level < product.requiredLevel) {
      return {
        success: false,
        message: `Этот вклад откроется на ${product.requiredLevel} уровне.`,
      };
    }

    if (activeDeposit && !activeDeposit.isCompleted) {
      return {
        success: false,
        message: 'У вас уже есть активный вклад.',
      };
    }

    const depositAmount = amount ?? product.minAmount;

    if (depositAmount < product.minAmount) {
      return {
        success: false,
        message: `Минимальная сумма вклада: ${product.minAmount} FinCoin.`,
      };
    }

    if (finCoin < depositAmount) {
      return {
        success: false,
        message: 'Недостаточно FinCoin для открытия вклада.',
      };
    }

    const payoutAmount = Math.floor(
      depositAmount + depositAmount * (product.interestPercent / 100)
    );

    const nextFinCoin = finCoin - depositAmount;

    const nextDeposit: ActiveDeposit = {
      productId: product.id,
      title: product.title,
      amount: depositAmount,
      interestPercent: product.interestPercent,
      payoutAmount,
      durationSeconds: product.durationSeconds,
      startedAt: Date.now(),
      isCompleted: false,
    };

    depositCompletedRef.current = false;

    setFinCoin(nextFinCoin);
    setActiveDeposit(nextDeposit);
    setDepositRemainingSeconds(product.durationSeconds);

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
          finCoin: nextFinCoin,
          activeDeposit: nextDeposit,
        });
      } catch (error) {
        console.log('Ошибка открытия вклада:', error);
        return {
          success: false,
          message: 'Не удалось сохранить вклад.',
        };
      }
    }

    return {
      success: true,
      message: `Вклад "${product.title}" успешно открыт.`,
    };
  };

  const reduceDepositTime = async (seconds: number, cost = 0) => {
    if (!activeDeposit || activeDeposit.isCompleted) return false;
    if (cost > 0 && finCoin < cost) return false;

    const now = Date.now();
    const passedSeconds = Math.floor((now - activeDeposit.startedAt) / 1000);

    const currentRemaining = Math.max(
      0,
      activeDeposit.durationSeconds - passedSeconds
    );

    const nextRemaining = Math.max(0, currentRemaining - seconds);
    const nextDurationSeconds = passedSeconds + nextRemaining;
    const nextFinCoin = cost > 0 ? finCoin - cost : finCoin;

    const nextDeposit: ActiveDeposit = {
      ...activeDeposit,
      durationSeconds: nextDurationSeconds,
    };

    setFinCoin(nextFinCoin);
    setActiveDeposit(nextDeposit);
    setDepositRemainingSeconds(nextRemaining);

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
          finCoin: nextFinCoin,
          activeDeposit: nextDeposit,
        });
      } catch (error) {
        console.log('Ошибка ускорения вклада:', error);
        return false;
      }
    }

    return true;
  };

  const takeLoan = async (
    product: LoanProduct
  ): Promise<{ success: boolean; message: string }> => {
    if (level < product.requiredLevel) {
      return {
        success: false,
        message: `Этот кредит откроется на ${product.requiredLevel} уровне.`,
      };
    }

    if (activeLoan && activeLoan.status !== 'closed') {
      return {
        success: false,
        message: 'У вас уже есть активный кредит.',
      };
    }

    const totalPayments = 5;

    const totalRepayment = Math.floor(
      product.amount + product.amount * (product.interestPercent / 100)
    );

    const monthlyPayment = Math.ceil(totalRepayment / totalPayments);
    const nextFinCoin = finCoin + product.amount;

    const nextLoan: ActiveLoan = {
      productId: product.id,
      title: product.title,
      principal: product.amount,
      remainingDebt: totalRepayment,
      interestPercent: product.interestPercent,
      totalRepayment,
      monthlyPayment,
      paidPayments: 0,
      totalPayments,
      nextPaymentAt: Date.now() + 60 * 1000,
      overdueDays: 0,
      penaltyAmount: 0,
      status: 'active',
    };

    setFinCoin(nextFinCoin);
    setActiveLoan(nextLoan);
    setLoanRemainingSeconds(0);

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
          finCoin: nextFinCoin,
          activeLoan: nextLoan,
        });
      } catch (error) {
        console.log('Ошибка оформления кредита:', error);
        return {
          success: false,
          message: 'Не удалось сохранить кредит.',
        };
      }
    }

    return {
      success: true,
      message: `Кредит "${product.title}" оформлен. Следующий платёж: ${monthlyPayment} FinCoin.`,
    };
  };

  const payLoan = async () => {
    if (!activeLoan) return false;

    const paymentAmount = Math.min(
      activeLoan.monthlyPayment,
      activeLoan.remainingDebt
    );

    if (finCoin < paymentAmount) return false;

    const nextFinCoin = finCoin - paymentAmount;
    const nextDebt = Math.max(0, activeLoan.remainingDebt - paymentAmount);
    const nextPaidPayments = activeLoan.paidPayments + 1;

    if (nextDebt <= 0 || nextPaidPayments >= activeLoan.totalPayments) {
      setFinCoin(nextFinCoin);
      setActiveLoan(null);
      setLoanRemainingSeconds(0);

      if (!isGuest && userIdRef.current) {
        try {
          await saveUserGameData({
            finCoin: nextFinCoin,
            activeLoan: null,
          });
        } catch (error) {
          console.log('Ошибка закрытия кредита после платежа:', error);
          return false;
        }
      }

      return true;
    }

    const nextLoan: ActiveLoan = {
      ...activeLoan,
      remainingDebt: nextDebt,
      paidPayments: nextPaidPayments,
      nextPaymentAt: Date.now() + 60 * 1000,
      overdueDays: 0,
      penaltyAmount: activeLoan.penaltyAmount,
      status: 'active',
    };

    setFinCoin(nextFinCoin);
    setActiveLoan(nextLoan);

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
          finCoin: nextFinCoin,
          activeLoan: nextLoan,
        });
      } catch (error) {
        console.log('Ошибка внесения платежа:', error);
        return false;
      }
    }

    return true;
  };

  const closeLoan = async () => {
    if (!activeLoan) return false;
    if (finCoin < activeLoan.remainingDebt) return false;

    const nextFinCoin = finCoin - activeLoan.remainingDebt;

    setFinCoin(nextFinCoin);
    setActiveLoan(null);
    setLoanRemainingSeconds(0);

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
          finCoin: nextFinCoin,
          activeLoan: null,
        });
      } catch (error) {
        console.log('Ошибка полного закрытия кредита:', error);
        return false;
      }
    }

    return true;
  };

  const forceOverdue = () => {
    if (!activeLoan) return;

    const updatedLoan: ActiveLoan = {
      ...activeLoan,
      nextPaymentAt: Date.now() - 1000,
    };

    setActiveLoan(updatedLoan);

    if (!isGuest && userIdRef.current) {
      saveUserGameData({
        activeLoan: updatedLoan,
      }).catch((error) => {
        console.log('Ошибка тестовой просрочки:', error);
      });
    }
  };

  const startMortgage = async (options?: {
    totalSeconds?: number;
    downPayment?: number;
  }) => {
    if (level < MORTGAGE_UNLOCK_LEVEL) return false;
    if (mortgage.isActive) return false;

    const totalSeconds = options?.totalSeconds ?? DEFAULT_MORTGAGE.totalSeconds;
    const downPayment = options?.downPayment ?? 0;

    if (finCoin < downPayment) return false;

    const nextFinCoin = finCoin - downPayment;

    const nextMortgage: MortgageState = {
      isActive: true,
      isCompleted: false,
      totalSeconds,
      durationSeconds: totalSeconds,
      startedAt: Date.now(),
    };

    mortgageCompletedRef.current = false;

    setFinCoin(nextFinCoin);
    setMortgage(nextMortgage);
    setMortgageRemainingSeconds(totalSeconds);

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
          finCoin: nextFinCoin,
          mortgage: nextMortgage,
        });
      } catch (error) {
        console.log('Ошибка запуска ипотеки:', error);
        return false;
      }
    }

    return true;
  };

  const reduceMortgageTime = async (seconds: number, cost: number) => {
    if (!mortgage.isActive) return false;
    if (finCoin < cost) return false;

    const nextFinCoin = finCoin - cost;
    const nextDuration = Math.max(0, mortgage.durationSeconds - seconds);
    const isCompleted = nextDuration === 0;

    const nextMortgage: MortgageState = {
      ...mortgage,
      durationSeconds: nextDuration,
      isActive: !isCompleted,
      isCompleted,
    };

    setFinCoin(nextFinCoin);
    setMortgage(nextMortgage);

    if (isCompleted) {
      setMortgageRemainingSeconds(0);
    }

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
          finCoin: nextFinCoin,
          mortgage: nextMortgage,
        });
      } catch (error) {
        console.log('Ошибка уменьшения времени ипотеки:', error);
        return false;
      }
    }

    return true;
  };
  

    const payHomeBill = async (billId: number) => {
    const bill = homeBills.find((item) => item.id === billId);

    if (!bill || bill.status === 'paid') {
      return false;
    }

    if (finCoin < bill.amount) {
      return false;
    }

    const nextFinCoin = finCoin - bill.amount;

    const nextHomeBills = homeBills.map((item) =>
      item.id === billId ? { ...item, status: 'paid' as const } : item
    );

    const nextHomeDiscipline = Math.min(homeDiscipline + 4, 100);
    const nextHomeComfort = Math.min(homeComfort + 1, 100);

    setFinCoin(nextFinCoin);
    setHomeBills(nextHomeBills);
    setHomeDiscipline(nextHomeDiscipline);
    setHomeComfort(nextHomeComfort);

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
          finCoin: nextFinCoin,
          homeBills: nextHomeBills,
          homeDiscipline: nextHomeDiscipline,
          homeComfort: nextHomeComfort,
        });
      } catch (error) {
        console.log('Ошибка оплаты домашнего счёта:', error);
        return false;
      }
    }

    return true;
  };

  const repairHomeProblem = async () => {
    const repairCost = 150;

    if (!homeEvent) {
      return false;
    }

    if (finCoin < repairCost) {
      return false;
    }

    const nextFinCoin = finCoin - repairCost;
    const nextHomeComfort = Math.min(homeComfort + 12, 100);
    const nextHomeDiscipline = Math.min(homeDiscipline + 3, 100);

    setFinCoin(nextFinCoin);
    setHomeComfort(nextHomeComfort);
    setHomeDiscipline(nextHomeDiscipline);
    setHomeEvent(null);
    setHomeEventAvailableAt(Date.now() + getRandomEventDelay());

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
          finCoin: nextFinCoin,
          homeComfort: nextHomeComfort,
          homeDiscipline: nextHomeDiscipline,
          homeEventResolved: true,
        });
      } catch (error) {
        console.log('Ошибка ремонта дома:', error);
        return false;
      }
    }

    return true;
  };

  const postponeHomeProblem = async () => {
    if (!homeEvent) {
      return false;
    }

    const nextHomeComfort = Math.max(homeComfort - 15, 0);
    const nextHomeDiscipline = Math.max(homeDiscipline - 5, 0);

    setHomeComfort(nextHomeComfort);
    setHomeDiscipline(nextHomeDiscipline);
    setHomeEvent(null);
    setHomeEventAvailableAt(Date.now() + getRandomEventDelay());

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
          homeComfort: nextHomeComfort,
          homeDiscipline: nextHomeDiscipline,
          homeEventResolved: true,
        });
      } catch (error) {
        console.log('Ошибка откладывания ремонта:', error);
        return false;
      }
    }

    return true;
  };


  const resetHomeBillsForTest = async () => {
  const nextHomeBills = createDefaultHomeBills();

  setHomeBills(nextHomeBills);

  if (!isGuest && userIdRef.current) {
    try {
      await saveUserGameData({
        homeBills: nextHomeBills,
      });
    } catch (error) {
      console.log('Ошибка сброса счетов:', error);
    }
  }
};

  const triggerHomeEventForTest = async () => {
    const nextEvent = getRandomHomeEvent();

    setHomeEvent(nextEvent);
    setHomeEventAvailableAt(null);

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
          homeEvent: nextEvent,
          homeEventAvailableAt: null,
        });
      } catch (error) {
        console.log('Ошибка тестового события:', error);
      }
    }
  };
  const reloadUserData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    await loadUserData({
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      isAnonymous: currentUser.isAnonymous,
    });
  };

  const value: GameContextType = {
    xp,
    finCoin,
    level,
    currentLevelXp: levelData.minXp,
    nextLevelXp: levelData.maxXp,
    progressToNextLevel,

    mortgage,
    mortgageStatus,
    mortgageRemainingSeconds,

    activeDeposit,
    depositRemainingSeconds,

    activeLoan,
    loanRemainingSeconds,

    homeBills,
    homeComfort,
    homeDiscipline,
    homeEvent,
    homeEventAvailableAt,

    payHomeBill,
    repairHomeProblem,
    postponeHomeProblem,
    resetHomeBillsForTest,
    triggerHomeEventForTest,

    isGuest,
    isGameLoading,
    onboardingCompleted,
    userDataLoaded,

    setOnboardingCompleted,

    addRewards,
    addTestXp,
    addTestCoins,
    spendFinCoin,

    openDeposit,
    reduceDepositTime,

    takeLoan,
    payLoan,
    closeLoan,
    forceOverdue,

    startMortgage,
    reduceMortgageTime,
    reloadUserData,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);

  if (!ctx) {
    throw new Error('useGame must be used inside GameProvider');
  }

  return ctx;
}