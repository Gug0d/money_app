import React from 'react';

import { LoanProduct, loanProducts } from '../../constants/loanProducts';
import { getLoanPaymentDurationSeconds } from '../gameConfig';
import { ActiveLoan } from '../gameTypes';

type Params = {
  level: number;
  xp: number;
  finCoin: number;
  activeLoan: ActiveLoan | null;

  setXp: React.Dispatch<React.SetStateAction<number>>;
  setFinCoin: React.Dispatch<React.SetStateAction<number>>;
  setActiveLoan: React.Dispatch<React.SetStateAction<ActiveLoan | null>>;
  setLoanRemainingSeconds: React.Dispatch<React.SetStateAction<number>>;

  isGuest: boolean;
  userId: string | null;

  saveUserGameData: (data: Record<string, any>) => Promise<void>;
};

const TOTAL_LOAN_PAYMENTS = 5;

const OVERDUE_XP_PENALTY = 10;
const OVERDUE_PENALTY_PERCENT = 0.15;
const MIN_OVERDUE_PENALTY = 5;

function formatDurationText(seconds: number) {
  const minutes = Math.ceil(seconds / 60);

  if (minutes < 60) {
    return `${minutes} мин.`;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (restMinutes === 0) {
    return `${hours} ч.`;
  }

  return `${hours} ч. ${restMinutes} мин.`;
}

function getPaymentDurationByProduct(product: LoanProduct, level: number) {
  return getLoanPaymentDurationSeconds(level, product.durationSeconds);
}

function getPaymentDurationByActiveLoan(
  loan: ActiveLoan,
  level: number
): number {
  const product = loanProducts.find((item) => item.id === loan.productId);

  if (product) {
    return getPaymentDurationByProduct(product, level);
  }

  return loan.paymentDurationSeconds ?? getLoanPaymentDurationSeconds(level);
}

function getPenaltyAmount(loan: ActiveLoan) {
  return Math.max(
    MIN_OVERDUE_PENALTY,
    Math.ceil(loan.monthlyPayment * OVERDUE_PENALTY_PERCENT)
  );
}

function getLoanPaymentAmount(loan: ActiveLoan) {
  const basePayment = Math.min(loan.monthlyPayment, loan.remainingDebt);

  if (loan.status !== 'overdue') {
    return basePayment;
  }

  return Math.min(basePayment + loan.penaltyAmount, loan.remainingDebt);
}

export function useLoanGame({
  level,
  xp,
  finCoin,
  activeLoan,
  setXp,
  setFinCoin,
  setActiveLoan,
  setLoanRemainingSeconds,
  isGuest,
  userId,
  saveUserGameData,
}: Params) {
  const takeLoan = async (
    product: LoanProduct
  ): Promise<{ success: boolean; message: string }> => {
    if (level < product.requiredLevel) {
      return {
        success: false,
        message: `Этот кредит откроется на ${product.requiredLevel} уровне.`,
      };
    }

    if (activeLoan && activeLoan.status !== 'closed') {
      return {
        success: false,
        message: 'У тебя уже есть активный кредит.',
      };
    }

    const totalRepayment = Math.floor(
      product.amount + product.amount * (product.interestPercent / 100)
    );

    const monthlyPayment = Math.ceil(totalRepayment / TOTAL_LOAN_PAYMENTS);
    const nextFinCoin = finCoin + product.amount;

    const paymentDurationSeconds = getPaymentDurationByProduct(product, level);

    const nextLoan: ActiveLoan = {
      productId: product.id,
      title: product.title,
      principal: product.amount,
      remainingDebt: totalRepayment,
      interestPercent: product.interestPercent,
      totalRepayment,
      monthlyPayment,
      paidPayments: 0,
      totalPayments: TOTAL_LOAN_PAYMENTS,
      nextPaymentAt: Date.now() + paymentDurationSeconds * 1000,
      paymentDurationSeconds,
      overdueDays: 0,
      penaltyAmount: 0,
      status: 'active',
    };

    setFinCoin(nextFinCoin);
    setActiveLoan(nextLoan);
    setLoanRemainingSeconds(paymentDurationSeconds);

    if (!isGuest && userId) {
      try {
        await saveUserGameData({
          finCoin: nextFinCoin,
          activeLoan: nextLoan,
        });
      } catch (error) {
        console.log('Ошибка оформления кредита:', error);

        return {
          success: false,
          message: 'Не удалось сохранить кредит.',
        };
      }
    }

    return {
      success: true,
      message: `Кредит "${product.title}" оформлен. Платёж: ${monthlyPayment} FinCoin. До первого платежа: ${formatDurationText(
        paymentDurationSeconds
      )}`,
    };
  };

  const payLoan = async () => {
    if (!activeLoan) return false;

    const paymentAmount = getLoanPaymentAmount(activeLoan);

    if (finCoin < paymentAmount) return false;

    const paymentDurationSeconds = getPaymentDurationByActiveLoan(
      activeLoan,
      level
    );

    const nextFinCoin = finCoin - paymentAmount;
    const nextDebt = Math.max(0, activeLoan.remainingDebt - paymentAmount);
    const nextPaidPayments = activeLoan.paidPayments + 1;

    if (nextDebt <= 0 || nextPaidPayments >= activeLoan.totalPayments) {
      setFinCoin(nextFinCoin);
      setActiveLoan(null);
      setLoanRemainingSeconds(0);

      if (!isGuest && userId) {
        try {
          await saveUserGameData({
            finCoin: nextFinCoin,
            activeLoan: null,
          });
        } catch (error) {
          console.log('Ошибка закрытия кредита после платежа:', error);
          return false;
        }
      }

      return true;
    }

    const nextLoan: ActiveLoan = {
      ...activeLoan,
      remainingDebt: nextDebt,
      paidPayments: nextPaidPayments,
      nextPaymentAt: Date.now() + paymentDurationSeconds * 1000,
      paymentDurationSeconds,
      overdueDays: 0,
      penaltyAmount: 0,
      status: 'active',
    };

    setFinCoin(nextFinCoin);
    setActiveLoan(nextLoan);
    setLoanRemainingSeconds(paymentDurationSeconds);

    if (!isGuest && userId) {
      try {
        await saveUserGameData({
          finCoin: nextFinCoin,
          activeLoan: nextLoan,
        });
      } catch (error) {
        console.log('Ошибка внесения платежа:', error);
        return false;
      }
    }

    return true;
  };

  const closeLoan = async () => {
    if (!activeLoan) return false;
    if (finCoin < activeLoan.remainingDebt) return false;

    const nextFinCoin = finCoin - activeLoan.remainingDebt;

    setFinCoin(nextFinCoin);
    setActiveLoan(null);
    setLoanRemainingSeconds(0);

    if (!isGuest && userId) {
      try {
        await saveUserGameData({
          finCoin: nextFinCoin,
          activeLoan: null,
        });
      } catch (error) {
        console.log('Ошибка полного закрытия кредита:', error);
        return false;
      }
    }

    return true;
  };

  const forceOverdue = () => {
    if (!activeLoan) return;

    if (activeLoan.status === 'overdue') {
      setLoanRemainingSeconds(0);
      return;
    }

    const penalty = getPenaltyAmount(activeLoan);
    const nextXp = Math.max(0, xp - OVERDUE_XP_PENALTY);

    const updatedLoan: ActiveLoan = {
      ...activeLoan,
      status: 'overdue',
      overdueDays: activeLoan.overdueDays + 1,
      penaltyAmount: activeLoan.penaltyAmount + penalty,
      remainingDebt: activeLoan.remainingDebt + penalty,
      nextPaymentAt: Date.now(),
    };

    setXp(nextXp);
    setActiveLoan(updatedLoan);
    setLoanRemainingSeconds(0);

    if (!isGuest && userId) {
      saveUserGameData({
        xp: nextXp,
        activeLoan: updatedLoan,
      }).catch((error) => {
        console.log('Ошибка тестовой просрочки:', error);
      });
    }
  };

  const applyLoanOverduePenalty = async () => {
    if (!activeLoan) {
      setLoanRemainingSeconds(0);
      return;
    }

    const now = Date.now();

    if (activeLoan.status === 'overdue') {
      setLoanRemainingSeconds(0);
      return;
    }

    const remainingSeconds = Math.max(
      0,
      Math.ceil((activeLoan.nextPaymentAt - now) / 1000)
    );

    if (remainingSeconds > 0) {
      setLoanRemainingSeconds(remainingSeconds);
      return;
    }

    const penalty = getPenaltyAmount(activeLoan);
    const nextXp = Math.max(0, xp - OVERDUE_XP_PENALTY);

    const updatedLoan: ActiveLoan = {
      ...activeLoan,
      status: 'overdue',
      overdueDays: activeLoan.overdueDays + 1,
      penaltyAmount: activeLoan.penaltyAmount + penalty,
      remainingDebt: activeLoan.remainingDebt + penalty,
      nextPaymentAt: now,
    };

    setXp(nextXp);
    setActiveLoan(updatedLoan);
    setLoanRemainingSeconds(0);

    if (!isGuest && userId) {
      try {
        await saveUserGameData({
          xp: nextXp,
          activeLoan: updatedLoan,
        });
      } catch (error) {
        console.log('Ошибка начисления просрочки:', error);
      }
    }
  };

  return {
    takeLoan,
    payLoan,
    closeLoan,
    forceOverdue,
    applyLoanOverduePenalty,
  };
}