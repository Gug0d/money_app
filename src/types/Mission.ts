export type MissionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  xp?: number;
  finCoin?: number;
};

export type MissionDifficulty = 'Легко' | 'Средне' | 'Сложно';
export type MissionType = 'quiz' | 'decision';

export type Mission = {
  id: string;
  title: string;
  description: string;
  difficulty: MissionDifficulty;
  xpReward: number;
  finCoinReward: number;
  type: MissionType;
  question?: string;
  options?: MissionOption[];
};