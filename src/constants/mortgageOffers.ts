import { MortgageOffer } from '../types/finance';

export const mortgageOffers: MortgageOffer[] = [
  {
    id: 'offer_1',
    bankName: 'Fin Bank',
    rate: 8.4,
    years: 20,
    monthlyPayment: 45,
    totalPayment: 1650,
    overpayment: 450,
    downPayment: 350,
    description:
      'Сбалансированный вариант: умеренный первый взнос и комфортный платёж.',
    gameDurationSeconds: 120,
  },
  {
    id: 'offer_2',
    bankName: 'Capital House',
    rate: 7.9,
    years: 15,
    monthlyPayment: 65,
    totalPayment: 1450,
    overpayment: 250,
    downPayment: 550,
    description:
      'Платёж выше, зато переплата меньше и ипотека закроется быстрее.',
    gameDurationSeconds: 90,
  },
  {
    id: 'offer_3',
    bankName: 'Start Home',
    rate: 9.3,
    years: 25,
    monthlyPayment: 30,
    totalPayment: 1900,
    overpayment: 700,
    downPayment: 200,
    description:
      'Небольшой первый взнос, но более долгий срок и высокая переплата.',
    gameDurationSeconds: 150,
  },
];