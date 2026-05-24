import React, { useEffect, useRef, useState } from 'react';
import {
  createDefaultHomeBills,
  getHomeBillsRefreshDuration,
  getRandomEventDelay,
  getRandomHomeEvent,
} from '../gameConfig';
import { HomeBill, HomeEvent } from '../gameTypes';

type UseHouseholdGameParams = {
  level: number;
  finCoin: number;
  ownedPropertyId: string | null;
  setFinCoin: React.Dispatch<React.SetStateAction<number>>;
  isGuest: boolean;
  userId: string | null;
  saveUserGameData: (data: Record<string, any>) => Promise<void>;
};

export function useHouseholdGame({
  level,
  finCoin,
  ownedPropertyId,
  setFinCoin,
  isGuest,
  userId,
  saveUserGameData,
}: UseHouseholdGameParams) {
  const homeBillsRefreshDuration = getHomeBillsRefreshDuration(level);
  const homeBillsRefreshDurationSeconds = Math.ceil(
    homeBillsRefreshDuration / 1000
  );

  const [homeBills, setHomeBills] = useState<HomeBill[]>(() =>
    createDefaultHomeBills(level, ownedPropertyId)
  );

  const [homeComfort, setHomeComfort] = useState(70);
  const [homeDiscipline, setHomeDiscipline] = useState(80);

  const [homeEvent, setHomeEvent] = useState<HomeEvent | null>(null);

  const [homeEventAvailableAt, setHomeEventAvailableAt] = useState<
    number | null
  >(Date.now() + getRandomEventDelay(level));

  const [homeBillsRefreshAt, setHomeBillsRefreshAt] = useState(
    Date.now() + homeBillsRefreshDuration
  );

  const [
    homeBillsRefreshRemainingSeconds,
    setHomeBillsRefreshRemainingSeconds,
  ] = useState(homeBillsRefreshDurationSeconds);

  const previousLevelRef = useRef(level);
  const previousPropertyRef = useRef(ownedPropertyId);

  useEffect(() => {
    if (previousLevelRef.current === level) {
      return;
    }

    previousLevelRef.current = level;

    const nextHomeBills = createDefaultHomeBills(
      level,
      ownedPropertyId
    ).map((newBill) => {
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
  }, [
    level,
    ownedPropertyId,
    homeBills,
    homeEvent,
    isGuest,
    userId,
    saveUserGameData,
  ]);

  useEffect(() => {
    if (previousPropertyRef.current === ownedPropertyId) {
      return;
    }

    previousPropertyRef.current = ownedPropertyId;

    const nextRefreshAt = Date.now() + homeBillsRefreshDuration;
    const nextHomeBills = createDefaultHomeBills(level, ownedPropertyId);

    setHomeBills(nextHomeBills);
    setHomeBillsRefreshAt(nextRefreshAt);
    setHomeBillsRefreshRemainingSeconds(homeBillsRefreshDurationSeconds);

    if (!isGuest && userId) {
      saveUserGameData({
        homeBills: nextHomeBills,
        homeBillsRefreshAt: nextRefreshAt,
      });
    }
  }, [
    ownedPropertyId,
    level,
    homeBillsRefreshDuration,
    homeBillsRefreshDurationSeconds,
    isGuest,
    userId,
    saveUserGameData,
  ]);

  const resetHouseholdState = () => {
    setHomeBills(createDefaultHomeBills(level, ownedPropertyId));
    setHomeComfort(70);
    setHomeDiscipline(80);
    setHomeEvent(null);
    setHomeEventAvailableAt(Date.now() + getRandomEventDelay(level));
    setHomeBillsRefreshAt(Date.now() + homeBillsRefreshDuration);
    setHomeBillsRefreshRemainingSeconds(homeBillsRefreshDurationSeconds);
  };

  const loadHouseholdState = (data: any) => {
    setHomeBills(
      Array.isArray(data.homeBills)
        ? data.homeBills
        : createDefaultHomeBills(level, ownedPropertyId)
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
        : Date.now() + getRandomEventDelay(level)
    );

    setHomeBillsRefreshAt(
      typeof data.homeBillsRefreshAt === 'number'
        ? data.homeBillsRefreshAt
        : Date.now() + homeBillsRefreshDuration
    );

    setHomeBillsRefreshRemainingSeconds(
      typeof data.homeBillsRefreshAt === 'number'
        ? Math.max(
            0,
            Math.ceil((data.homeBillsRefreshAt - Date.now()) / 1000)
          )
        : homeBillsRefreshDurationSeconds
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
    const nextEventAvailableAt = Date.now() + getRandomEventDelay(level);

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
    const nextEventAvailableAt = Date.now() + getRandomEventDelay(level);

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
    const nextHomeBills = createDefaultHomeBills(level, ownedPropertyId);
    const nextRefreshAt = Date.now() + homeBillsRefreshDuration;

    const nextHomeDiscipline =
      totalPenalty > 0 ? Math.max(homeDiscipline - 8, 0) : homeDiscipline;

    const nextHomeComfort =
      totalPenalty > 0 ? Math.max(homeComfort - 4, 0) : homeComfort;

    setFinCoin(nextFinCoin);
    setHomeBills(nextHomeBills);
    setHomeBillsRefreshAt(nextRefreshAt);
    setHomeBillsRefreshRemainingSeconds(homeBillsRefreshDurationSeconds);

    if (totalPenalty > 0) {
      setHomeDiscipline(nextHomeDiscipline);
      setHomeComfort(nextHomeComfort);
    }

    if (!isGuest && userId) {
      await saveUserGameData({
        finCoin: nextFinCoin,
        homeBills: nextHomeBills,
        homeBillsRefreshAt: nextRefreshAt,
        homeDiscipline: nextHomeDiscipline,
        homeComfort: nextHomeComfort,
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
  }, [
    homeBillsRefreshAt,
    homeBills,
    finCoin,
    isGuest,
    userId,
    level,
    ownedPropertyId,
    homeComfort,
    homeDiscipline,
    homeBillsRefreshDuration,
    homeBillsRefreshDurationSeconds,
  ]);

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
  }, [
    homeEvent,
    homeEventAvailableAt,
    isGuest,
    userId,
    level,
    saveUserGameData,
  ]);

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