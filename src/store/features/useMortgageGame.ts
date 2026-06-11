import React from 'react';
import { properties } from '../../constants/challenges';
import { MortgageState } from '../gameTypes';
import { scaleDurationSeconds } from '../gameConfig';


type UseMortgageGameParams = {
  level: number;
  finCoin: number;

  mortgage: MortgageState;
  ownedPropertyId: string | null;

  setMortgage: React.Dispatch<React.SetStateAction<MortgageState>>;
  setFinCoin: React.Dispatch<React.SetStateAction<number>>;
  setOwnedPropertyId: React.Dispatch<React.SetStateAction<string | null>>;
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
  propertyId: null,
  propertyTitle: null,
  offerId: null,
  bankName: null,
  downPayment: 0,
  monthlyPayment: 0,
  totalPayment: 0,
  overpayment: 0,
};

export function useMortgageGame({
  level,
  finCoin,
  mortgage,
  ownedPropertyId,
  setMortgage,
  setFinCoin,
  setOwnedPropertyId,
  setMortgageRemainingSeconds,
  isGuest,
  userId,
  saveUserGameData,
  mortgageCompletedRef,
}: UseMortgageGameParams) {
  const startMortgage = async (options?: {
  totalSeconds?: number;
  downPayment?: number;
  propertyId?: string;
  propertyTitle?: string;
  offerId?: string;
  bankName?: string;
  monthlyPayment?: number;
  totalPayment?: number;
  overpayment?: number;
}) => {
  if (level < MORTGAGE_UNLOCK_LEVEL) return false;
  if (mortgage.isActive) return false;

  const property = properties.find(
    (item) => item.id === options?.propertyId
  );

  if (!property) return false;

  if (level < property.requiredLevel) return false;

  if (ownedPropertyId === property.id) return false;

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

    propertyId: property.id,
    propertyTitle: options?.propertyTitle ?? property.title,

    offerId: options?.offerId ?? null,
    bankName: options?.bankName ?? null,
    downPayment,
    monthlyPayment: options?.monthlyPayment ?? 0,
    totalPayment: options?.totalPayment ?? 0,
    overpayment: options?.overpayment ?? 0,
  };

  mortgageCompletedRef.current = false;

  setFinCoin(nextFinCoin);
  setOwnedPropertyId(property.id);
  setMortgage(nextMortgage);
  setMortgageRemainingSeconds(totalSeconds);

  if (!isGuest && userId) {
    try {
      await saveUserGameData({
        finCoin: nextFinCoin,
        ownedPropertyId: property.id,
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