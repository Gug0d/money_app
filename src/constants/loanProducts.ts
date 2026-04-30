// constants/loanProducts.ts

export type LoanProduct = {
  id: string;
  title: string;
  requiredLevel: number;
  amount: number;
  interestPercent: number;
  durationSeconds: number;
};

export const loanProducts: LoanProduct[] = [
  {
    id: 'mini_loan',
    title: 'Мини-кредит',
    requiredLevel: 4,
    amount: 200,
    interestPercent: 10,
    durationSeconds: 300, // 5 минут
  },
  {
    id: 'consumer_loan',
    title: 'Потребительский кредит',
    requiredLevel: 7,
    amount: 500,
    interestPercent: 18,
    durationSeconds: 600, // 10 минут
  },
  {
    id: 'big_loan',
    title: 'Крупный кредит',
    requiredLevel: 10,
    amount: 1000,
    interestPercent: 25,
    durationSeconds: 900, // 15 минут
  },
];