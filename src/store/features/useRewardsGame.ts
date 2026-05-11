import React from 'react';

type UseRewardsGameParams = {
  xp: number;
  finCoin: number;
  setXp: React.Dispatch<React.SetStateAction<number>>;
  setFinCoin: React.Dispatch<React.SetStateAction<number>>;
  isGuest: boolean;
  userId: string | null;
  saveUserGameData: (data: Record<string, any>) => Promise<void>;
};

export function useRewardsGame({
  xp,
  finCoin,
  setXp,
  setFinCoin,
  isGuest,
  userId,
  saveUserGameData,
}: UseRewardsGameParams) {
  const addRewards = async (xpToAdd: number, finCoinToAdd: number) => {
    const nextXp = xp + xpToAdd;
    const nextFinCoin = finCoin + finCoinToAdd;

    setXp(nextXp);
    setFinCoin(nextFinCoin);

    if (!isGuest && userId) {
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

  return {
    addRewards,
    addTestXp,
    addTestCoins,
    spendFinCoin,
  };
}