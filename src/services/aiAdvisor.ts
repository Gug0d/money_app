import { AiAdviceRequest, AiAdviceResponse } from '../types/finance';

export async function getMortgageAdvice(
  payload: AiAdviceRequest
): Promise<AiAdviceResponse> {
  // Временная заглушка для проверки UI
  const bestOffer = [...payload.offers].sort(
    (a, b) => a.overpayment - b.overpayment
  )[0];

  return {
    summary:
      'Если тебе важно меньше переплатить по ипотеке, лучше выбрать предложение с самой низкой общей переплатой.',
    recommendedOfferId: bestOffer.id,
    recommendationReason: `${bestOffer.bankName} выглядит наиболее выгодно по суммарной переплате. Ежемесячный платёж выше, но в долгую это предложение экономичнее.`,
    tradeoffs: [
      'Низкий ежемесячный платёж обычно означает более долгий срок кредита.',
      'Чем ниже переплата, тем выше может быть нагрузка на бюджет каждый месяц.',
      'Небольшой первоначальный взнос удобен в начале, но часто делает ипотеку дороже.',
    ],
  };
}