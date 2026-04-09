import React, { createContext, useContext, useMemo, useState } from 'react';

type GameContextType = {
  xp: number;
  finCoin: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressToNextLevel: number;
  addRewards: (xpToAdd: number, finCoinToAdd: number) => void;
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

  const addRewards = (xpToAdd: number, finCoinToAdd: number) => {
    setXp((prev) => prev + xpToAdd);
    setFinCoin((prev) => prev + finCoinToAdd);
  };

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

  const value = useMemo(
    () => ({
      xp,
      finCoin,
      level,
      currentLevelXp,
      nextLevelXp,
      progressToNextLevel,
      addRewards,
      getLevelByXp: resolveLevelByXp,
    }),
    [xp, finCoin, level, currentLevelXp, nextLevelXp, progressToNextLevel]
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