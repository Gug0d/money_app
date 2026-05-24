// constants/depositProducts.ts

import { hours, minutes } from '../store/gameConfig';

export type EarlyWithdrawPolicy = 'none' | 'no_profit' | 'half_profit';

export type DepositProduct = {
  id: string;
  title: string;
  requiredLevel: number;
  minAmount: number;
  interestPercent: number;
  durationSeconds: number;
  earlyWithdraw: EarlyWithdrawPolicy;
};

export const depositProducts: DepositProduct[] = [
  {
    id: 'basic_deposit',
    title: 'Простой вклад',
    requiredLevel: 3,
    minAmount: 100,
    interestPercent: 5,
    durationSeconds: minutes(30),// 5 минут
    earlyWithdraw: 'no_profit',
  },
  {
    id: 'saving_deposit',
    title: 'Накопительный вклад',
    requiredLevel: 6,
    minAmount: 300,
    interestPercent: 8,
    durationSeconds: hours(1),// 10 минут
    earlyWithdraw: 'half_profit',
  },
  {
    id: 'long_deposit',
    title: 'Долгосрочный вклад',
    requiredLevel: 10,
    minAmount: 700,
    interestPercent: 12,
    durationSeconds: hours(3),// 20 минут
    earlyWithdraw: 'none',
  },
];