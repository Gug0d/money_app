import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

type MortgageStatus = 'locked' | 'available' | 'active' | 'completed';

type MortgageState = {
  isActive: boolean;
  isCompleted: boolean;
  totalSeconds: number;
  remainingSeconds: number;
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
  isGuest: boolean;
  isGameLoading: boolean;

  addRewards: (xpToAdd: number, finCoinToAdd: number) => Promise<void>;
  spendFinCoin: (amount: number) => Promise<boolean>;
  startMortgage: () => Promise<boolean>;
  reduceMortgageTime: (seconds: number, cost: number) => Promise<boolean>;

  addTestXp: () => Promise<void>;
  addTestCoins: () => Promise<void>;

  getLevelByXp: (xpValue: number) => number;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const LEVELS = [
  { level: 1, minXp: 0, maxXp: 100 },
  { level: 2, minXp: 100, maxXp: 250 },
  { level: 3, minXp: 250, maxXp: 450 },
  { level: 4, minXp: 450, maxXp: 700 },
  { level: 5, minXp: 700, maxXp: 1000 },
];

const MORTGAGE_UNLOCK_LEVEL = 3;
const DEFAULT_MORTGAGE_SECONDS = 120;

const DEFAULT_MORTGAGE: MortgageState = {
  isActive: false,
  isCompleted: false,
  totalSeconds: DEFAULT_MORTGAGE_SECONDS,
  remainingSeconds: DEFAULT_MORTGAGE_SECONDS,
};

const getLevelDataByXp = (xp: number) => {
  const foundLevel =
    LEVELS.find((item) => xp >= item.minXp && xp < item.maxXp) ||
    LEVELS[LEVELS.length - 1];

  return foundLevel;
};

const resolveLevelByXp = (xp: number) => {
  return getLevelDataByXp(xp).level;
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXp] = useState(0);
  const [finCoin, setFinCoin] = useState(0);
  const [mortgage, setMortgage] = useState<MortgageState>(DEFAULT_MORTGAGE);
  const [isGuest, setIsGuest] = useState(true);
  const [isGameLoading, setIsGameLoading] = useState(true);

  const userIdRef = useRef<string | null>(null);

  const levelData = useMemo(() => getLevelDataByXp(xp), [xp]);
  const level = levelData.level;
  const currentLevelXp = levelData.minXp;
  const nextLevelXp = levelData.maxXp;

  const progressToNextLevel = useMemo(() => {
    const range = nextLevelXp - currentLevelXp;
    const passed = xp - currentLevelXp;

    if (range <= 0) return 1;

    return Math.max(0, Math.min(1, passed / range));
  }, [xp, currentLevelXp, nextLevelXp]);

  const mortgageStatus: MortgageStatus = useMemo(() => {
    if (level < MORTGAGE_UNLOCK_LEVEL) {
      return 'locked';
    }

    if (mortgage.isCompleted) {
      return 'completed';
    }

    if (mortgage.isActive) {
      return 'active';
    }

    return 'available';
  }, [level, mortgage]);

  const saveUserGameData = async (
    nextData: Partial<{
      xp: number;
      finCoin: number;
      mortgage: MortgageState;
      level: number;
    }>
  ) => {
    const uid = userIdRef.current;

    if (!uid) {
      return;
    }

    await updateDoc(doc(db, 'users', uid), nextData);
  };

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = undefined;
      }

      if (!user) {
        userIdRef.current = null;
        setIsGuest(true);
        setXp(0);
        setFinCoin(0);
        setMortgage(DEFAULT_MORTGAGE);
        setIsGameLoading(false);
        return;
      }

      userIdRef.current = user.uid;
      setIsGuest(false);
      setIsGameLoading(true);

      const userRef = doc(db, 'users', user.uid);

      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        setXp(0);
        setFinCoin(0);
        setMortgage(DEFAULT_MORTGAGE);
        setIsGameLoading(false);
        return;
      }

      unsubscribeUserDoc = onSnapshot(
        userRef,
        (userDoc) => {
          const data = userDoc.data();

          setXp(typeof data?.xp === 'number' ? data.xp : 0);
          setFinCoin(typeof data?.finCoin === 'number' ? data.finCoin : 0);

          const mortgageData = data?.mortgage;
          setMortgage({
            isActive: !!mortgageData?.isActive,
            isCompleted: !!mortgageData?.isCompleted,
            totalSeconds:
              typeof mortgageData?.totalSeconds === 'number'
                ? mortgageData.totalSeconds
                : DEFAULT_MORTGAGE_SECONDS,
            remainingSeconds:
              typeof mortgageData?.remainingSeconds === 'number'
                ? mortgageData.remainingSeconds
                : DEFAULT_MORTGAGE_SECONDS,
          });

          setIsGameLoading(false);
        },
        () => {
          setIsGameLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
      }
    };
  }, []);

  const addRewards = async (xpToAdd: number, finCoinToAdd: number) => {
    const nextXp = xp + xpToAdd;
    const nextFinCoin = finCoin + finCoinToAdd;

    setXp(nextXp);
    setFinCoin(nextFinCoin);

    if (!isGuest) {
      await saveUserGameData({
        xp: nextXp,
        finCoin: nextFinCoin,
        level: resolveLevelByXp(nextXp),
      });
    }
  };

  const spendFinCoin = async (amount: number) => {
    if (finCoin < amount) {
      return false;
    }

    const nextFinCoin = finCoin - amount;
    setFinCoin(nextFinCoin);

    if (!isGuest) {
      await saveUserGameData({ finCoin: nextFinCoin });
    }

    return true;
  };

  const startMortgage = async () => {
    if (level < MORTGAGE_UNLOCK_LEVEL) {
      return false;
    }

    if (mortgage.isActive || mortgage.isCompleted) {
      return false;
    }

    const nextMortgage: MortgageState = {
      isActive: true,
      isCompleted: false,
      totalSeconds: DEFAULT_MORTGAGE_SECONDS,
      remainingSeconds: DEFAULT_MORTGAGE_SECONDS,
    };

    setMortgage(nextMortgage);

    if (!isGuest) {
      await saveUserGameData({ mortgage: nextMortgage });
    }

    return true;
  };

  const reduceMortgageTime = async (seconds: number, cost: number) => {
    if (!mortgage.isActive || mortgage.isCompleted) {
      return false;
    }

    if (finCoin < cost) {
      return false;
    }

    const nextFinCoin = finCoin - cost;
    const nextRemaining = Math.max(0, mortgage.remainingSeconds - seconds);

    const nextMortgage: MortgageState =
      nextRemaining === 0
        ? {
            ...mortgage,
            isActive: false,
            isCompleted: true,
            remainingSeconds: 0,
          }
        : {
            ...mortgage,
            remainingSeconds: nextRemaining,
          };

    setFinCoin(nextFinCoin);
    setMortgage(nextMortgage);

    if (!isGuest) {
      await saveUserGameData({
        finCoin: nextFinCoin,
        mortgage: nextMortgage,
      });
    }

    return true;
  };

  const addTestXp = async () => {
    await addRewards(100, 0);
  };

  const addTestCoins = async () => {
    await addRewards(0, 50);
  };

  useEffect(() => {
    if (!mortgage.isActive || mortgage.isCompleted) {
      return;
    }

    const interval = setInterval(() => {
      setMortgage((prev) => {
        if (!prev.isActive || prev.isCompleted) {
          return prev;
        }

        const nextRemaining = Math.max(0, prev.remainingSeconds - 1);

        const nextMortgage =
          nextRemaining === 0
            ? {
                ...prev,
                isActive: false,
                isCompleted: true,
                remainingSeconds: 0,
              }
            : {
                ...prev,
                remainingSeconds: nextRemaining,
              };

        if (!isGuest && userIdRef.current) {
          updateDoc(doc(db, 'users', userIdRef.current), {
            mortgage: nextMortgage,
          }).catch(() => {});
        }

        return nextMortgage;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mortgage.isActive, mortgage.isCompleted, isGuest]);

  const value = useMemo(
    () => ({
      xp,
      finCoin,
      level,
      currentLevelXp,
      nextLevelXp,
      progressToNextLevel,
      mortgage,
      mortgageStatus,
      isGuest,
      isGameLoading,
      addRewards,
      spendFinCoin,
      startMortgage,
      reduceMortgageTime,
      addTestXp,
      addTestCoins,
      getLevelByXp: resolveLevelByXp,
    }),
    [
      xp,
      finCoin,
      level,
      currentLevelXp,
      nextLevelXp,
      progressToNextLevel,
      mortgage,
      mortgageStatus,
      isGuest,
      isGameLoading,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error('useGame must be used inside GameProvider');
  }

  return context;
}