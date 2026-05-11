import React from 'react';

import { DepositProduct } from '../../constants/depositProducts';
import { ActiveDeposit } from '../gameTypes';

type Params = {
  level: number;
  finCoin: number;
  activeDeposit: ActiveDeposit | null;
  setFinCoin: React.Dispatch<React.SetStateAction<number>>;
  setActiveDeposit: React.Dispatch<React.SetStateAction<ActiveDeposit | null>>;
  setDepositRemainingSeconds: React.Dispatch<React.SetStateAction<number>>;
  isGuest: boolean;
  userId: string | null;
  saveUserGameData: (data: Record<string, any>) => Promise<void>;
  depositCompletedRef: React.MutableRefObject<boolean>;
};

export function useDepositGame({
  level,
  finCoin,
  activeDeposit,
  setFinCoin,
  setActiveDeposit,
  setDepositRemainingSeconds,
  isGuest,
  userId,
  saveUserGameData,
  depositCompletedRef,
}: Params) {
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

    if (!isGuest && userId) {
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

    if (!isGuest && userId) {
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

  return {
    openDeposit,
    reduceDepositTime,
  };
}