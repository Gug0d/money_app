// constants/economy.ts

export const PRICE_GROWTH_PER_LEVEL = 0.15;

export function getLevelPriceMultiplier(level: number): number {
  const safeLevel = Math.max(1, level);

  return 1 + (safeLevel - 1) * PRICE_GROWTH_PER_LEVEL;
}

export function scalePrice(basePrice: number, level: number): number {
  const multiplier = getLevelPriceMultiplier(level);

  return Math.round(basePrice * multiplier);
}

export function scaleRubPrice(basePrice: number, level: number): number {
  const multiplier = getLevelPriceMultiplier(level);

  return Math.round((basePrice * multiplier) / 1000) * 1000;
}