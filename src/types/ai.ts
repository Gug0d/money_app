// src/types/ai.ts

import { Mission } from './Mission';

export type AiChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export type AiGameState = {
  level: number;
  xp: number;
  finCoin: number;

  mortgageStatus?: string;
  mortgage?: unknown;

  activeDeposit?: unknown;
  depositRemainingSeconds?: number;

  activeLoan?: unknown;
  loanRemainingSeconds?: number;

  homeBills?: unknown;
  homeComfort?: number;
  homeDiscipline?: number;
  homeEvent?: unknown;

  activeJobId?: string | null;
  ownedPropertyId?: string | null;
  activeBoostIds?: string[];
  boostOfferIds?: string[];
  nextSalaryAvailableAt?: number | null;
};

export type GenerateMissionsRequest = {
  level: number;
  count?: number;
  gameState: AiGameState;
};

export type GenerateMissionsResponse = {
  missions: Mission[];
};