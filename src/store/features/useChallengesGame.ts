import React, { useEffect } from 'react';
import {
  boosts,
  jobs,
  properties,
  riskDeals,
} from '../../constants/challenges';

import {
  getBoostRefreshSeconds,
  getSalaryCooldownSeconds,
  scaleFinCoinPrice,
} from '../gameConfig';

const BOOST_OFFERS_COUNT = 2;

export function getWorkEfficiency(params: {
  homeComfort: number;
  homeDiscipline: number;
}) {
  const { homeComfort, homeDiscipline } = params;

  if (homeDiscipline < 40 || homeComfort < 35) {
    return {
      multiplier: 0.6,
      percent: 60,
      title: 'Плохая работоспособность',
      description:
        'Из-за низкого комфорта или дисциплины герой работает хуже. Зарплата снижена на 40%.',
    };
  }

  if (homeDiscipline < 60 || homeComfort < 55) {
    return {
      multiplier: 0.75,
      percent: 75,
      title: 'Сниженная работоспособность',
      description:
        'Герою сложно работать эффективно. Зарплата снижена на 25%.',
    };
  }

  if (homeDiscipline < 80 || homeComfort < 70) {
    return {
      multiplier: 0.9,
      percent: 90,
      title: 'Небольшая усталость',
      description:
        'Герой немного теряет концентрацию. Зарплата снижена на 10%.',
    };
  }

  return {
    multiplier: 1,
    percent: 100,
    title: 'Отличная работоспособность',
    description:
      'Комфорт и дисциплина в норме. Герой получает полную зарплату.',
  };
}

type UseChallengesGameParams = {
  level: number;
  finCoin: number;
  homeComfort: number;
  homeDiscipline: number;

  activeJobId: string | null;
  ownedPropertyId: string | null;
  activeBoostIds: string[];
  boostOfferIds: string[];
  boostOffersRefreshAt: number | null;
  nextSalaryAvailableAt: number | null;
  hasActiveMortgage: boolean;

  setFinCoin: React.Dispatch<React.SetStateAction<number>>;
  setActiveJobId: React.Dispatch<React.SetStateAction<string | null>>;
  setOwnedPropertyId: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveBoostIds: React.Dispatch<React.SetStateAction<string[]>>;
  setBoostOfferIds: React.Dispatch<React.SetStateAction<string[]>>;
  setBoostOffersRefreshAt: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  setNextSalaryAvailableAt: React.Dispatch<
    React.SetStateAction<number | null>
  >;

  isGuest: boolean;
  userId: string | null;
  saveUserGameData: (data: Record<string, any>) => Promise<void>;
};

function getRandomBoostOfferIds(activeBoostIds: string[]) {
  const availableBoosts = boosts.filter(
    (boost) => !activeBoostIds.includes(boost.id)
  );

  if (availableBoosts.length === 0) {
    return [];
  }

  return [...availableBoosts]
    .sort(() => Math.random() - 0.5)
    .slice(0, BOOST_OFFERS_COUNT)
    .map((boost) => boost.id);
}

export function useChallengesGame({
  level,
  finCoin,
  homeComfort,
  homeDiscipline,

  activeJobId,
  ownedPropertyId,
  activeBoostIds,
  boostOfferIds,
  boostOffersRefreshAt,
  nextSalaryAvailableAt,
  hasActiveMortgage,

  setFinCoin,
  setActiveJobId,
  setOwnedPropertyId,
  setActiveBoostIds,
  setBoostOfferIds,
  setBoostOffersRefreshAt,
  setNextSalaryAvailableAt,

  isGuest,
  userId,
  saveUserGameData,
}: UseChallengesGameParams) {
  useEffect(() => {
    const now = Date.now();

    if (boostOfferIds.length > 0) {
      return;
    }

    if (boostOffersRefreshAt && now < boostOffersRefreshAt) {
      return;
    }

    const nextOfferIds = getRandomBoostOfferIds(activeBoostIds);

    setBoostOfferIds(nextOfferIds);
    setBoostOffersRefreshAt(null);

    if (!isGuest && userId) {
      saveUserGameData({
        boostOfferIds: nextOfferIds,
        boostOffersRefreshAt: null,
      });
    }
  }, [
    boostOfferIds,
    boostOffersRefreshAt,
    activeBoostIds,
    isGuest,
    userId,
    saveUserGameData,
    setBoostOfferIds,
    setBoostOffersRefreshAt,
  ]);

  const applyJob = async (jobId: string) => {
    const job = jobs.find((item) => item.id === jobId);

    if (!job) {
      return {
        success: false,
        message: 'Работа не найдена.',
      };
    }

    if (level < job.requiredLevel) {
      return {
        success: false,
        message: `Нужен ${job.requiredLevel} уровень. Сейчас у тебя ${level}.`,
      };
    }

    setActiveJobId(job.id);

    if (!isGuest && userId) {
      await saveUserGameData({
        activeJobId: job.id,
      });
    }

    return {
      success: true,
      message: `Ты устроился на работу: ${job.title}.`,
    };
  };

  const receiveSalary = async () => {
    const job = jobs.find((item) => item.id === activeJobId);

    if (!job) {
      return {
        success: false,
        message: 'Сначала устройся на работу.',
      };
    }

    const now = Date.now();

    if (nextSalaryAvailableAt && now < nextSalaryAvailableAt) {
      const remainingSeconds = Math.ceil((nextSalaryAvailableAt - now) / 1000);

      return {
        success: false,
        message: `Зарплата ещё не готова. Осталось ${remainingSeconds} сек.`,
      };
    }

    const hasSalaryBoost = activeBoostIds.includes('salary_boost');

    const baseSalary = scaleFinCoinPrice(job.salary, level);

    const workEfficiency = getWorkEfficiency({
      homeComfort,
      homeDiscipline,
    });

    const salaryAfterHomePenalty = Math.round(
      baseSalary * workEfficiency.multiplier
    );

    const finalSalary = hasSalaryBoost
      ? Math.round(salaryAfterHomePenalty * 1.5)
      : salaryAfterHomePenalty;

    const nextFinCoin = finCoin + finalSalary;
    const nextBoostIds = hasSalaryBoost
      ? activeBoostIds.filter((id) => id !== 'salary_boost')
      : activeBoostIds;

    const salaryCooldownSeconds = getSalaryCooldownSeconds(level);

    const nextAvailableAt = now + salaryCooldownSeconds * 1000;

    setFinCoin(nextFinCoin);
    setActiveBoostIds(nextBoostIds);
    setNextSalaryAvailableAt(nextAvailableAt);

    if (!isGuest && userId) {
      await saveUserGameData({
        finCoin: nextFinCoin,
        activeBoostIds: nextBoostIds,
        nextSalaryAvailableAt: nextAvailableAt,
      });
    }

    return {
      success: true,
      message:
        workEfficiency.multiplier < 1
          ? `Ты получил зарплату: ${finalSalary} FC. Базовая зарплата была ${baseSalary} FC, но из-за низких показателей дома эффективность работы составила ${workEfficiency.percent}%. Следующая зарплата будет доступна через ${Math.ceil(
              salaryCooldownSeconds / 60
            )} мин.`
          : `Ты получил зарплату: ${finalSalary} FC. Следующая будет доступна через ${Math.ceil(
              salaryCooldownSeconds / 60
            )} мин.`,
    };
  };

  const buyProperty = async (propertyId: string) => {
    const property = properties.find((item) => item.id === propertyId);

    if (!property) {
      return {
        success: false,
        message: 'Недвижимость не найдена.',
      };
    }

    if (level < property.requiredLevel) {
      return {
        success: false,
        message: `Нужен ${property.requiredLevel} уровень. Сейчас у тебя ${level}.`,
      };
    }

    if (ownedPropertyId === property.id) {
      return {
        success: false,
        message: 'Эта недвижимость уже куплена.',
      };
    }

    if (hasActiveMortgage) {
      return {
        success: false,
        message:
          'Сначала заверши текущую ипотеку, а потом покупай новое жильё.',
      };
    }

    const price = scaleFinCoinPrice(property.price, level);

    if (finCoin < price) {
      return {
        success: false,
        message: `Недостаточно FC. Нужно ${price} FC.`,
      };
    }

    const nextFinCoin = finCoin - price;

    setFinCoin(nextFinCoin);
    setOwnedPropertyId(property.id);

    if (!isGuest && userId) {
      await saveUserGameData({
        finCoin: nextFinCoin,
        ownedPropertyId: property.id,
      });
    }

    return {
      success: true,
      message: `Ты купил: ${property.title}. Бонус: ${property.bonus}.`,
    };
  };

  const buyBoost = async (boostId: string) => {
    const boost = boosts.find((item) => item.id === boostId);

    if (!boost) {
      return {
        success: false,
        message: 'Буст не найден.',
      };
    }

    if (!boostOfferIds.includes(boost.id)) {
      return {
        success: false,
        message: 'Этого буста сейчас нет в предложениях.',
      };
    }

    if (level < boost.requiredLevel) {
      return {
        success: false,
        message: `Нужен ${boost.requiredLevel} уровень. Сейчас у тебя ${level}.`,
      };
    }

    if (activeBoostIds.includes(boost.id)) {
      return {
        success: false,
        message: 'Этот буст уже активен.',
      };
    }

    const price = scaleFinCoinPrice(boost.price, level);

    if (finCoin < price) {
      return {
        success: false,
        message: `Недостаточно FC. Нужно ${price} FC.`,
      };
    }

    const nextFinCoin = finCoin - price;
    const nextBoostIds = [...activeBoostIds, boost.id];
    const nextOfferIds = boostOfferIds.filter((id) => id !== boost.id);
    const boostRefreshSeconds = getBoostRefreshSeconds(level);
    const nextRefreshAt =
      nextOfferIds.length === 0
        ? Date.now() + boostRefreshSeconds * 1000
        : boostOffersRefreshAt;

    setFinCoin(nextFinCoin);
    setActiveBoostIds(nextBoostIds);
    setBoostOfferIds(nextOfferIds);
    setBoostOffersRefreshAt(nextRefreshAt);

    if (!isGuest && userId) {
      await saveUserGameData({
        finCoin: nextFinCoin,
        activeBoostIds: nextBoostIds,
        boostOfferIds: nextOfferIds,
        boostOffersRefreshAt: nextRefreshAt,
      });
    }

    return {
      success: true,
      message: `Буст активирован: ${boost.title}.`,
    };
  };

  const skipBoostOffer = async (boostId: string) => {
    const boostRefreshSeconds = getBoostRefreshSeconds(level);

    if (!boostOfferIds.includes(boostId)) {
      return {
        success: false,
        message: 'Этого буста уже нет в предложениях.',
      };
    }

    const nextOfferIds = boostOfferIds.filter((id) => id !== boostId);
    const nextRefreshAt =
      nextOfferIds.length === 0
        ? Date.now() + boostRefreshSeconds * 1000
        : boostOffersRefreshAt;

    setBoostOfferIds(nextOfferIds);
    setBoostOffersRefreshAt(nextRefreshAt);

    if (!isGuest && userId) {
      await saveUserGameData({
        boostOfferIds: nextOfferIds,
        boostOffersRefreshAt: nextRefreshAt,
      });
    }

    return {
      success: true,
      message:
        nextOfferIds.length === 0
          ? 'Предложение пропущено. Новые бусты появятся позже.'
          : 'Предложение пропущено.',
    };
  };

  const runRiskDeal = async (dealId: string) => {
    const deal = riskDeals.find((item) => item.id === dealId);

    if (!deal) {
      return {
        success: false,
        message: 'Сделка не найдена.',
      };
    }

    if (level < deal.requiredLevel) {
      return {
        success: false,
        message: `Нужен ${deal.requiredLevel} уровень. Сейчас у тебя ${level}.`,
      };
    }

    const cost = scaleFinCoinPrice(deal.cost, level);

    if (finCoin < cost) {
      return {
        success: false,
        message: `Недостаточно FC. Для сделки нужно ${cost} FC.`,
      };
    }

    const hasRiskProtection = activeBoostIds.includes('risk_protection');

    const reward = scaleFinCoinPrice(deal.reward, level);
    const basePenalty = scaleFinCoinPrice(deal.failPenalty, level);
    const failPenalty = hasRiskProtection
      ? Math.round(basePenalty * 0.5)
      : basePenalty;

    const roll = Math.random() * 100;
    const isSuccess = roll <= deal.successChance;

    if (isSuccess) {
      const nextFinCoin = finCoin - cost + reward;

      setFinCoin(nextFinCoin);

      if (!isGuest && userId) {
        await saveUserGameData({
          finCoin: nextFinCoin,
        });
      }

      return {
        success: true,
        message: `Сделка успешна. Ты вложил ${cost} FC и получил ${reward} FC.`,
      };
    }

    const nextFinCoin = Math.max(0, finCoin - cost - failPenalty);
    const nextBoostIds = hasRiskProtection
      ? activeBoostIds.filter((id) => id !== 'risk_protection')
      : activeBoostIds;

    setFinCoin(nextFinCoin);
    setActiveBoostIds(nextBoostIds);

    if (!isGuest && userId) {
      await saveUserGameData({
        finCoin: nextFinCoin,
        activeBoostIds: nextBoostIds,
      });
    }

    return {
      success: false,
      message: `Сделка провалилась. Ты потерял ${cost} FC${
        failPenalty > 0 ? ` и получил штраф ${failPenalty} FC.` : '.'
      }`,
    };
  };

  return {
    applyJob,
    receiveSalary,
    buyProperty,
    buyBoost,
    skipBoostOffer,
    runRiskDeal,
  };
}