import React from 'react';
import { MortgageState } from '../gameTypes';

import { scaleDurationSeconds } from '../gameConfig';

type UseMortgageGameParams = {
  level: number;
  finCoin: number;

  mortgage: MortgageState;

  setMortgage: React.Dispatch<React.SetStateAction<MortgageState>>;
  setFinCoin: React.Dispatch<React.SetStateAction<number>>;
  setMortgageRemainingSeconds: React.Dispatch<
    React.SetStateAction<number>
  >;

  isGuest: boolean;
  userId: string | null;

  saveUserGameData: (data: Record<string, any>) => Promise<void>;

  mortgageCompletedRef: React.MutableRefObject<boolean>;
};

const MORTGAGE_UNLOCK_LEVEL = 3;

const DEFAULT_MORTGAGE: MortgageState = {
  isActive: false,
  isCompleted: false,
  totalSeconds: 120,
  durationSeconds: 120,
  startedAt: null,
};

export function useMortgageGame({
  level,
  finCoin,
  mortgage,
  setMortgage,
  setFinCoin,
  setMortgageRemainingSeconds,
  isGuest,
  userId,
  saveUserGameData,
  mortgageCompletedRef,
}: UseMortgageGameParams) {
  const startMortgage = async (options?: {
    totalSeconds?: number;
    downPayment?: number;
  }) => {
    if (level < MORTGAGE_UNLOCK_LEVEL) return false;
    if (mortgage.isActive) return false;

    const baseTotalSeconds =
      options?.totalSeconds ?? DEFAULT_MORTGAGE.totalSeconds;

    const totalSeconds = scaleDurationSeconds(baseTotalSeconds, level);

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

    if (!isGuest && userId) {
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

  const reduceMortgageTime = async (
    seconds: number,
    cost: number
  ) => {
    if (!mortgage.isActive) return false;
    if (finCoin < cost) return false;

    const nextFinCoin = finCoin - cost;

    const nextDuration = Math.max(
      0,
      mortgage.durationSeconds - seconds
    );

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

    if (!isGuest && userId) {
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

  return {
    startMortgage,
    reduceMortgageTime,
  };
}