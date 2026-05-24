import React from 'react';
import { getMaxLevel, getNextLevelXp } from '../gameConfig';

type UseRewardsGameParams = {
  level: number;
  xp: number;
  finCoin: number;

  setLevel: React.Dispatch<React.SetStateAction<number>>;
  setXp: React.Dispatch<React.SetStateAction<number>>;
  setFinCoin: React.Dispatch<React.SetStateAction<number>>;

  isGuest: boolean;
  userId: string | null;
  saveUserGameData: (data: Record<string, any>) => Promise<void>;
};

export function useRewardsGame({
  level,
  xp,
  finCoin,
  setLevel,
  setXp,
  setFinCoin,
  isGuest,
  userId,
  saveUserGameData,
}: UseRewardsGameParams) {
  const addRewards = async (xpToAdd: number, finCoinToAdd: number) => {
    let nextLevel = level;
    let nextXp = Math.max(0, xp + xpToAdd);
    const nextFinCoin = Math.max(0, finCoin + finCoinToAdd);

    const maxLevel = getMaxLevel();

    while (nextLevel < maxLevel) {
      const xpToNextLevel = getNextLevelXp(nextLevel);

      if (nextXp < xpToNextLevel) {
        break;
      }

      nextXp -= xpToNextLevel;
      nextLevel += 1;
    }

    if (nextLevel >= maxLevel) {
      nextLevel = maxLevel;
      nextXp = Math.min(nextXp, getNextLevelXp(maxLevel));
    }

    setLevel(nextLevel);
    setXp(nextXp);
    setFinCoin(nextFinCoin);

    if (!isGuest && userId) {
      try {
        await saveUserGameData({
          level: nextLevel,
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

    if (!isGuest && userId) {
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

  const resetLevelForTest = async () => {
    setLevel(1);
    setXp(0);

    if (!isGuest && userId) {
      try {
        await saveUserGameData({
          level: 1,
          xp: 0,
        });
      } catch (error) {
        console.log('Ошибка сброса уровня:', error);
      }
    }
  };

  return {
    addRewards,
    addTestXp,
    addTestCoins,
    resetLevelForTest,
    spendFinCoin,
  };
}