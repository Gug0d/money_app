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

type MortgageStatus = 'locked' | 'available' | 'active' | 'completed';

type MortgageState = {
  isActive: boolean;
  isCompleted: boolean;
  totalSeconds: number;
  durationSeconds: number;
  startedAt: number | null;

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

  isGuest: boolean;
  isGameLoading: boolean;
  onboardingCompleted: boolean;
  userDataLoaded: boolean;

  setOnboardingCompleted: (value: boolean) => void;

  addRewards: (xpToAdd: number, finCoinToAdd: number) => Promise<void>;
  addTestXp: (amount: number) => Promise<void>;
  addTestCoins: (amount: number) => Promise<void>;
  spendFinCoin: (amount: number) => Promise<boolean>;
  startMortgage: (options?: { totalSeconds?: number }) => Promise<boolean>;
  reduceMortgageTime: (seconds: number, cost: number) => Promise<boolean>;
  reloadUserData: () => Promise<void>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const LEVELS = [
  { level: 1, minXp: 0, maxXp: 100 },
  { level: 2, minXp: 100, maxXp: 250 },
  { level: 3, minXp: 250, maxXp: 450 },
];

const MORTGAGE_UNLOCK_LEVEL = 3;

const DEFAULT_MORTGAGE: MortgageState = {
  isActive: false,
  isCompleted: false,
  totalSeconds: 120,
  durationSeconds: 120,
  startedAt: null,
};

const getLevelDataByXp = (xp: number) =>
  LEVELS.find((l) => xp >= l.minXp && xp < l.maxXp) ||
  LEVELS[LEVELS.length - 1];

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXp] = useState(0);
  const [finCoin, setFinCoin] = useState(0);
  const [mortgage, setMortgage] = useState<MortgageState>(DEFAULT_MORTGAGE);

  const [isGuest, setIsGuest] = useState(true);
  const [isGameLoading, setIsGameLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [mortgageRemainingSeconds, setMortgageRemainingSeconds] = useState(0);

  const addTestXp = async (amount: number) => {
    await addRewards(amount, 0);
  };

  const addTestCoins = async (amount: number) => {
    await addRewards(0, amount);
  };
  const userIdRef = useRef<string | null>(null);

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
    setOnboardingCompleted(false);
  };

  const saveUserGameData = async (data: Record<string, any>) => {
    if (!userIdRef.current) return;

    await updateDoc(doc(db, 'users', userIdRef.current), data);
  };

  const loadUserData = async (userOverride?: { uid: string; email: string | null; displayName: string | null; isAnonymous: boolean }) => {
    const currentUid = userOverride?.uid ?? userIdRef.current;

    if (!currentUid) {
      resetLocalState();
      setUserDataLoaded(false);
      setIsGameLoading(false);
      return;
    }

    const currentEmail = userOverride?.email ?? auth.currentUser?.email ?? null;
    const currentName = userOverride?.displayName ?? auth.currentUser?.displayName ?? null;
    const currentIsAnonymous = userOverride?.isAnonymous ?? auth.currentUser?.isAnonymous ?? true;

    try {
      setIsGameLoading(true);
      setUserDataLoaded(false);

      const userRef = doc(db, 'users', currentUid);

      console.log('Пробуем прочитать Firestore...');
      let snap = await getDoc(userRef);
      console.log('Firestore прочитан, exists =', snap.exists());

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
    const updateRemaining = () => {
      if (!mortgage.isActive || !mortgage.startedAt) {
        setMortgageRemainingSeconds(0);
        return;
      }

      const now = Date.now();
      const passedSeconds = Math.floor((now - mortgage.startedAt) / 1000);
      const remaining = Math.max(0, mortgage.durationSeconds - passedSeconds);

      setMortgageRemainingSeconds(remaining);
    };

    updateRemaining();

    if (!mortgage.isActive || !mortgage.startedAt) return;

    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [mortgage]);

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

  const spendFinCoin = async (amount: number) => {
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

  const startMortgage = async (options?: { totalSeconds?: number }) => {
    if (level < MORTGAGE_UNLOCK_LEVEL) return false;
    if (mortgage.isActive) return false;

    const totalSeconds = options?.totalSeconds ?? DEFAULT_MORTGAGE.totalSeconds;

    const nextMortgage: MortgageState = {
      isActive: true,
      isCompleted: false,
      totalSeconds,
      durationSeconds: totalSeconds,
      startedAt: Date.now(),
    };

    setMortgage(nextMortgage);

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
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
    addTestXp,
    addTestCoins,

    mortgage,
    mortgageStatus,
    mortgageRemainingSeconds,

    isGuest,
    isGameLoading,
    onboardingCompleted,
    userDataLoaded,

    setOnboardingCompleted,

    addRewards,
    spendFinCoin,
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