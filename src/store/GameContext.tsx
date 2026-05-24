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

import { useDepositGame } from './features/useDepositGame';
import { useLoanGame } from './features/useLoanGame';
import { useGameTimers } from './features/useGameTimers';
import { useHouseholdGame } from './features/useHouseholdGame';
import { useRewardsGame } from './features/useRewardsGame';
import { useMortgageGame } from './features/useMortgageGame';
import { useChallengesGame } from './features/useChallengesGame';

import {
  ActiveDeposit,
  ActiveLoan,
  GameContextType,
  MortgageState,
} from './gameTypes';

import {
  DEFAULT_MORTGAGE,
  MORTGAGE_UNLOCK_LEVEL,
  createDefaultHomeBills,
  convertTotalXpToLevelProgress,
  getHomeBillsRefreshDuration,
  getLevelData,
  getRandomEventDelay,
} from './gameConfig';

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [finCoin, setFinCoin] = useState(0);
  const [mortgage, setMortgage] = useState<MortgageState>(DEFAULT_MORTGAGE);

  const [activeDeposit, setActiveDeposit] = useState<ActiveDeposit | null>(
    null
  );
  const [depositRemainingSeconds, setDepositRemainingSeconds] = useState(0);

  const [activeLoan, setActiveLoan] = useState<ActiveLoan | null>(null);
  const [loanRemainingSeconds, setLoanRemainingSeconds] = useState(0);

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [ownedPropertyId, setOwnedPropertyId] = useState<string | null>(null);

  const [activeBoostIds, setActiveBoostIds] = useState<string[]>([]);
  const [boostOfferIds, setBoostOfferIds] = useState<string[]>([]);
  const [boostOffersRefreshAt, setBoostOffersRefreshAt] = useState<
    number | null
  >(null);

  const [nextSalaryAvailableAt, setNextSalaryAvailableAt] = useState<
    number | null
  >(null);

  const [isGuest, setIsGuest] = useState(true);
  const [isGameLoading, setIsGameLoading] = useState(true);
  const [viewedTutorialIds, setViewedTutorialIds] = useState<string[]>([]);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [mortgageRemainingSeconds, setMortgageRemainingSeconds] = useState(0);

  const userIdRef = useRef<string | null>(null);
  const depositCompletedRef = useRef(false);
  const mortgageCompletedRef = useRef(false);

  const saveUserGameData = async (data: Record<string, any>) => {
    if (!userIdRef.current) return;

    await updateDoc(doc(db, 'users', userIdRef.current), data);
  };

  const levelData = useMemo(() => getLevelData(level), [level]);

  const getLevelByXp = () => {
    return level;
  };

  const householdGame = useHouseholdGame({
    level,
    finCoin,
    ownedPropertyId,
    setFinCoin,
    isGuest,
    userId: userIdRef.current,
    saveUserGameData,
  });

  const rewardsGame = useRewardsGame({
    level,
    xp,
    finCoin,
    setLevel,
    setXp,
    setFinCoin,
    isGuest,
    userId: userIdRef.current,
    saveUserGameData,
  });

const challengesGame = useChallengesGame({
  level,
  finCoin,
  homeComfort: householdGame.homeComfort,
  homeDiscipline: householdGame.homeDiscipline,

  activeJobId,
  ownedPropertyId,
  activeBoostIds,
  boostOfferIds,
  boostOffersRefreshAt,
  nextSalaryAvailableAt,

  setFinCoin,
  setActiveJobId,
  setOwnedPropertyId,
  setActiveBoostIds,
  setBoostOfferIds,
  setBoostOffersRefreshAt,
  setNextSalaryAvailableAt,

  isGuest,
  userId: userIdRef.current,
  saveUserGameData,
});

  const mortgageGame = useMortgageGame({
    level,
    finCoin,
    mortgage,
    setMortgage,
    setFinCoin,
    setMortgageRemainingSeconds,
    isGuest,
    userId: userIdRef.current,
    saveUserGameData,
    mortgageCompletedRef,
  });

  const depositGame = useDepositGame({
    level,
    finCoin,
    activeDeposit,
    setFinCoin,
    setActiveDeposit,
    setDepositRemainingSeconds,
    isGuest,
    userId: userIdRef.current,
    saveUserGameData,
    depositCompletedRef,
  });

  const loanGame = useLoanGame({
    level,
    xp,
    finCoin,
    activeLoan,
    setXp,
    setFinCoin,
    setActiveLoan,
    setLoanRemainingSeconds,
    isGuest,
    userId: userIdRef.current,
    saveUserGameData,
  });

  useGameTimers({
    finCoin,
    isGuest,
    userId: userIdRef.current,

    mortgage,
    setMortgage,
    mortgageCompletedRef,
    setMortgageRemainingSeconds,

    activeDeposit,
    setActiveDeposit,
    depositCompletedRef,
    setDepositRemainingSeconds,

    setFinCoin,

    saveUserGameData,
  });

  const progressToNextLevel = useMemo(() => {
    if (levelData.xpToNextLevel <= 0) return 1;

    return Math.max(0, Math.min(1, xp / levelData.xpToNextLevel));
  }, [xp, levelData]);

  const mortgageStatus = useMemo(() => {
    if (level < MORTGAGE_UNLOCK_LEVEL) return 'locked';
    if (mortgage.isCompleted) return 'completed';
    if (mortgage.isActive) return 'active';

    return 'available';
  }, [level, mortgage]);

  const resetLocalState = () => {
    setLevel(1);
    setXp(0);
    setFinCoin(0);
    setMortgage(DEFAULT_MORTGAGE);
    setMortgageRemainingSeconds(0);

    setActiveDeposit(null);
    setDepositRemainingSeconds(0);

    setActiveLoan(null);
    setLoanRemainingSeconds(0);

    setActiveJobId(null);
    setOwnedPropertyId(null);

    setActiveBoostIds([]);
    setBoostOfferIds([]);
    setBoostOffersRefreshAt(null);

    setNextSalaryAvailableAt(null);

    setViewedTutorialIds([]);

    householdGame.resetHouseholdState();

    depositCompletedRef.current = false;
    mortgageCompletedRef.current = false;
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
            level: 1,
            xp: 0,
            finCoin: 0,
            viewedTutorialIds: [],

            mortgage: DEFAULT_MORTGAGE,
            activeDeposit: null,
            activeLoan: null,

            homeBills: createDefaultHomeBills(1),
            homeComfort: 70,
            homeDiscipline: 80,
            homeEvent: null,
            homeEventAvailableAt: Date.now() + getRandomEventDelay(1),
            homeBillsRefreshAt: Date.now() + getHomeBillsRefreshDuration(1),

            activeJobId: null,
            ownedPropertyId: null,
            activeBoostIds: [],
            boostOfferIds: [],
            boostOffersRefreshAt: null,
            nextSalaryAvailableAt: null,

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


      setLevel(typeof data.level === 'number' ? data.level : 1);
      setXp(typeof data.xp === 'number' ? data.xp : 0);
      setFinCoin(typeof data.finCoin === 'number' ? data.finCoin : 0);
      setMortgage(data.mortgage || DEFAULT_MORTGAGE);
      setActiveDeposit(data.activeDeposit || null);
      setActiveLoan(data.activeLoan || null);

      setActiveJobId(
        typeof data.activeJobId === 'string' ? data.activeJobId : null
      );

      setOwnedPropertyId(
        typeof data.ownedPropertyId === 'string' ? data.ownedPropertyId : null
      );

      setActiveBoostIds(
        Array.isArray(data.activeBoostIds) ? data.activeBoostIds : []
      );

      setBoostOfferIds(
        Array.isArray(data.boostOfferIds) ? data.boostOfferIds : []
      );

      setBoostOffersRefreshAt(
        typeof data.boostOffersRefreshAt === 'number'
          ? data.boostOffersRefreshAt
          : null
      );

      setNextSalaryAvailableAt(
        typeof data.nextSalaryAvailableAt === 'number'
          ? data.nextSalaryAvailableAt
          : null
      );

      householdGame.loadHouseholdState(data);

      setViewedTutorialIds(
        Array.isArray(data.viewedTutorialIds) ? data.viewedTutorialIds : []
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
    if (!activeLoan) return;

    const interval = setInterval(() => {
      loanGame.applyLoanOverduePenalty();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeLoan, loanGame]);

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

  const markTutorialViewed = async (tutorialId: string) => {
    const nextViewedTutorialIds = viewedTutorialIds.includes(tutorialId)
      ? viewedTutorialIds
      : [...viewedTutorialIds, tutorialId];

    setViewedTutorialIds(nextViewedTutorialIds);

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
          viewedTutorialIds: nextViewedTutorialIds,
        });
      } catch (error) {
        console.log('Ошибка сохранения обучающей подсказки:', error);
      }
    }
  };

  const resetTutorialProgress = async () => {
  setViewedTutorialIds([]);

    if (!isGuest && userIdRef.current) {
      try {
        await saveUserGameData({
          viewedTutorialIds: [],
        });
      } catch (error) {
        console.log('Ошибка сброса обучения:', error);
      }
    }
  };

  const value: GameContextType = {
    xp,
    finCoin,
    level,
    currentLevelXp: xp,
    nextLevelXp: levelData.xpToNextLevel,
    progressToNextLevel,

    mortgage,
    mortgageStatus,
    mortgageRemainingSeconds,

    activeDeposit,
    depositRemainingSeconds,

    activeLoan,
    loanRemainingSeconds,

    getLevelByXp,

    homeBills: householdGame.homeBills,
    homeComfort: householdGame.homeComfort,
    homeDiscipline: householdGame.homeDiscipline,
    homeEvent: householdGame.homeEvent,
    homeEventAvailableAt: householdGame.homeEventAvailableAt,
    homeBillsRefreshRemainingSeconds:
    householdGame.homeBillsRefreshRemainingSeconds,

    activeJobId,
    ownedPropertyId,
    activeBoostIds,
    boostOfferIds,
    boostOffersRefreshAt,
    nextSalaryAvailableAt,

    applyJob: challengesGame.applyJob,
    receiveSalary: challengesGame.receiveSalary,
    buyProperty: challengesGame.buyProperty,
    buyBoost: challengesGame.buyBoost,
    skipBoostOffer: challengesGame.skipBoostOffer,
    runRiskDeal: challengesGame.runRiskDeal,

    payHomeBill: householdGame.payHomeBill,
    repairHomeProblem: householdGame.repairHomeProblem,
    postponeHomeProblem: householdGame.postponeHomeProblem,
    resetHomeBillsForTest: householdGame.resetHomeBillsForTest,
    triggerHomeEventForTest: householdGame.triggerHomeEventForTest,

    isGuest,
    isGameLoading,

    userDataLoaded,
    viewedTutorialIds,

    markTutorialViewed,

    resetTutorialProgress,

    addRewards: rewardsGame.addRewards,
    addTestXp: rewardsGame.addTestXp,
    addTestCoins: rewardsGame.addTestCoins,
    resetLevelForTest: rewardsGame.resetLevelForTest,
    spendFinCoin: rewardsGame.spendFinCoin,

    openDeposit: depositGame.openDeposit,
    reduceDepositTime: depositGame.reduceDepositTime,

    takeLoan: loanGame.takeLoan,
    payLoan: loanGame.payLoan,
    closeLoan: loanGame.closeLoan,
    forceOverdue: loanGame.forceOverdue,

    startMortgage: mortgageGame.startMortgage,
    reduceMortgageTime: mortgageGame.reduceMortgageTime,

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