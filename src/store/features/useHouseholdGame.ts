import { useEffect, useRef, useState } from 'react';
import {
  HOME_BILLS_REFRESH_DURATION,
  createDefaultHomeBills,
  getRandomEventDelay,
  getRandomHomeEvent,
} from '../gameConfig';
import { HomeBill, HomeEvent } from '../gameTypes';

type UseHouseholdGameParams = {
  level: number;
  finCoin: number;
  setFinCoin: React.Dispatch<React.SetStateAction<number>>;
  isGuest: boolean;
  userId: string | null;
  saveUserGameData: (data: Record<string, any>) => Promise<void>;
};

export function useHouseholdGame({
  level,
  finCoin,
  setFinCoin,
  isGuest,
  userId,
  saveUserGameData,
}: UseHouseholdGameParams) {
  const [homeBills, setHomeBills] = useState<HomeBill[]>(() =>
    createDefaultHomeBills(level)
  );

  const [homeComfort, setHomeComfort] = useState(70);
  const [homeDiscipline, setHomeDiscipline] = useState(80);

  const [homeEvent, setHomeEvent] = useState<HomeEvent | null>(null);

  const [homeEventAvailableAt, setHomeEventAvailableAt] = useState<
    number | null
  >(Date.now() + getRandomEventDelay());

  const [homeBillsRefreshAt, setHomeBillsRefreshAt] = useState(
    Date.now() + HOME_BILLS_REFRESH_DURATION
  );

  const [
    homeBillsRefreshRemainingSeconds,
    setHomeBillsRefreshRemainingSeconds,
  ] = useState(Math.ceil(HOME_BILLS_REFRESH_DURATION / 1000));

  const previousLevelRef = useRef(level);

  useEffect(() => {
    if (previousLevelRef.current === level) {
      return;
    }

    previousLevelRef.current = level;

    const nextHomeBills = createDefaultHomeBills(level).map((newBill) => {
      const oldBill = homeBills.find((bill) => bill.id === newBill.id);

      if (!oldBill) {
        return newBill;
      }

      return {
        ...newBill,
        status: oldBill.status,
        dueAt: oldBill.dueAt,
        penaltyApplied: oldBill.penaltyApplied,
      };
    });

    const nextHomeEvent = homeEvent
      ? {
          ...getRandomHomeEvent(level),
          id: homeEvent.id,
          title: homeEvent.title,
          description: homeEvent.description,
          comfortReward: homeEvent.comfortReward,
          disciplineReward: homeEvent.disciplineReward,
          postponeComfortPenalty: homeEvent.postponeComfortPenalty,
          postponeDisciplinePenalty: homeEvent.postponeDisciplinePenalty,
          icon: homeEvent.icon,
        }
      : null;

    setHomeBills(nextHomeBills);

    if (nextHomeEvent) {
      setHomeEvent(nextHomeEvent);
    }

    if (!isGuest && userId) {
      saveUserGameData({
        homeBills: nextHomeBills,
        homeEvent: nextHomeEvent,
      });
    }
  }, [level]);

  const resetHouseholdState = () => {
    setHomeBills(createDefaultHomeBills(level));
    setHomeComfort(70);
    setHomeDiscipline(80);
    setHomeEvent(null);
    setHomeEventAvailableAt(Date.now() + getRandomEventDelay());
    setHomeBillsRefreshAt(Date.now() + HOME_BILLS_REFRESH_DURATION);
    setHomeBillsRefreshRemainingSeconds(
      Math.ceil(HOME_BILLS_REFRESH_DURATION / 1000)
    );
  };

  const loadHouseholdState = (data: any) => {
    setHomeBills(
      Array.isArray(data.homeBills)
        ? data.homeBills
        : createDefaultHomeBills(level)
    );

    setHomeComfort(
      typeof data.homeComfort === 'number' ? data.homeComfort : 70
    );

    setHomeDiscipline(
      typeof data.homeDiscipline === 'number' ? data.homeDiscipline : 80
    );

    setHomeEvent(data.homeEvent || null);

    setHomeEventAvailableAt(
      typeof data.homeEventAvailableAt === 'number'
        ? data.homeEventAvailableAt
        : Date.now() + getRandomEventDelay()
    );

    setHomeBillsRefreshAt(
      typeof data.homeBillsRefreshAt === 'number'
        ? data.homeBillsRefreshAt
        : Date.now() + HOME_BILLS_REFRESH_DURATION
    );
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

    if (!isGuest && userId) {
      await saveUserGameData({
        finCoin: nextFinCoin,
        homeBills: nextHomeBills,
        homeDiscipline: nextHomeDiscipline,
        homeComfort: nextHomeComfort,
      });
    }

    return true;
  };

  const repairHomeProblem = async () => {
    if (!homeEvent) {
      return false;
    }

    if (finCoin < homeEvent.cost) {
      return false;
    }

    const nextFinCoin = Math.max(0, finCoin - homeEvent.cost);
    const nextHomeComfort = Math.min(
      homeComfort + homeEvent.comfortReward,
      100
    );
    const nextHomeDiscipline = Math.min(
      homeDiscipline + homeEvent.disciplineReward,
      100
    );
    const nextEventAvailableAt = Date.now() + getRandomEventDelay();

    setFinCoin(nextFinCoin);
    setHomeComfort(nextHomeComfort);
    setHomeDiscipline(nextHomeDiscipline);
    setHomeEvent(null);
    setHomeEventAvailableAt(nextEventAvailableAt);

    if (!isGuest && userId) {
      await saveUserGameData({
        finCoin: nextFinCoin,
        homeComfort: nextHomeComfort,
        homeDiscipline: nextHomeDiscipline,
        homeEvent: null,
        homeEventAvailableAt: nextEventAvailableAt,
      });
    }

    return true;
  };

  const postponeHomeProblem = async () => {
    if (!homeEvent) {
      return false;
    }

    const nextHomeComfort = Math.max(
      homeComfort - homeEvent.postponeComfortPenalty,
      0
    );
    const nextHomeDiscipline = Math.max(
      homeDiscipline - homeEvent.postponeDisciplinePenalty,
      0
    );
    const nextEventAvailableAt = Date.now() + getRandomEventDelay();

    setHomeComfort(nextHomeComfort);
    setHomeDiscipline(nextHomeDiscipline);
    setHomeEvent(null);
    setHomeEventAvailableAt(nextEventAvailableAt);

    if (!isGuest && userId) {
      await saveUserGameData({
        homeComfort: nextHomeComfort,
        homeDiscipline: nextHomeDiscipline,
        homeEvent: null,
        homeEventAvailableAt: nextEventAvailableAt,
      });
    }

    return true;
  };

  const resetHomeBillsForTest = async () => {
    const unpaidBills = homeBills.filter((bill) => bill.status !== 'paid');

    const totalPenalty = unpaidBills.reduce(
      (sum, bill) => sum + bill.penalty,
      0
    );

    const nextFinCoin = Math.max(0, finCoin - totalPenalty);
    const nextHomeBills = createDefaultHomeBills(level);
    const nextRefreshAt = Date.now() + HOME_BILLS_REFRESH_DURATION;

    setFinCoin(nextFinCoin);
    setHomeBills(nextHomeBills);
    setHomeBillsRefreshAt(nextRefreshAt);
    setHomeBillsRefreshRemainingSeconds(
      Math.ceil(HOME_BILLS_REFRESH_DURATION / 1000)
    );

    if (totalPenalty > 0) {
      setHomeDiscipline((prev) => Math.max(prev - 8, 0));
      setHomeComfort((prev) => Math.max(prev - 4, 0));
    }

    if (!isGuest && userId) {
      await saveUserGameData({
        finCoin: nextFinCoin,
        homeBills: nextHomeBills,
        homeBillsRefreshAt: nextRefreshAt,
      });
    }
  };

  const triggerHomeEventForTest = async () => {
    const nextEvent = getRandomHomeEvent(level);

    setHomeEvent(nextEvent);
    setHomeEventAvailableAt(null);

    if (!isGuest && userId) {
      await saveUserGameData({
        homeEvent: nextEvent,
        homeEventAvailableAt: null,
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remainingMs = homeBillsRefreshAt - now;
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      setHomeBillsRefreshRemainingSeconds(remainingSeconds);

      if (remainingMs > 0) {
        return;
      }

      resetHomeBillsForTest();
    }, 1000);

    return () => clearInterval(interval);
  }, [homeBillsRefreshAt, homeBills, finCoin, isGuest, level]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (homeEvent) return;
      if (!homeEventAvailableAt) return;

      const now = Date.now();

      if (now < homeEventAvailableAt) return;

      const nextEvent = getRandomHomeEvent(level);

      setHomeEvent(nextEvent);
      setHomeEventAvailableAt(null);

      if (!isGuest && userId) {
        await saveUserGameData({
          homeEvent: nextEvent,
          homeEventAvailableAt: null,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [homeEvent, homeEventAvailableAt, isGuest, userId, level]);

  return {
    homeBills,
    homeComfort,
    homeDiscipline,
    homeEvent,
    homeEventAvailableAt,
    homeBillsRefreshRemainingSeconds,

    resetHouseholdState,
    loadHouseholdState,

    payHomeBill,
    repairHomeProblem,
    postponeHomeProblem,
    resetHomeBillsForTest,
    triggerHomeEventForTest,
  };
}