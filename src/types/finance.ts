export type MortgageOffer = {
  id: string;
  bankName: string;
  rate: number;
  years: number;
  monthlyPayment: number;
  totalPayment: number;
  overpayment: number;
  downPayment: number;
  description: string;

  gameDurationSeconds: number;
};

export type AiAdviceRequest = {
  playerLevel: number;
  playerCoins: number;
  offers: MortgageOffer[];
};

export type AiAdviceResponse = {
  summary: string;
  recommendedOfferId: string;
  recommendationReason: string;
  tradeoffs: string[];
};