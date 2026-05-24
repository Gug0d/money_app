import React from 'react';

import { LoanProduct } from '../../constants/loanProducts';
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
        message: 'У вас уже есть активный кредит.',
      };
    }

    const totalPayments = 5;

    const totalRepayment = Math.floor(
      product.amount + product.amount * (product.interestPercent / 100)
    );

    const monthlyPayment = Math.ceil(totalRepayment / totalPayments);
    const nextFinCoin = finCoin + product.amount;
    const paymentDurationSeconds = getLoanPaymentDurationSeconds(level);

    const nextLoan: ActiveLoan = {
      productId: product.id,
      title: product.title,
      principal: product.amount,
      remainingDebt: totalRepayment,
      interestPercent: product.interestPercent,
      totalRepayment,
      monthlyPayment,
      paidPayments: 0,
      totalPayments,
      nextPaymentAt: Date.now() + paymentDurationSeconds * 1000,
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
      message: `Кредит "${product.title}" оформлен. Следующий платёж: ${monthlyPayment} FinCoin.`,
    };
  };

  const payLoan = async () => {
    if (!activeLoan) return false;

    const paymentAmount = Math.min(
      activeLoan.monthlyPayment,
      activeLoan.remainingDebt
    );

    if (finCoin < paymentAmount) return false;

    const paymentDurationSeconds = getLoanPaymentDurationSeconds(level);

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
      overdueDays: 0,
      penaltyAmount: activeLoan.penaltyAmount,
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

    const updatedLoan: ActiveLoan = {
      ...activeLoan,
      nextPaymentAt: Date.now() - 1000,
    };

    setActiveLoan(updatedLoan);
    setLoanRemainingSeconds(0);

    if (!isGuest && userId) {
      saveUserGameData({
        activeLoan: updatedLoan,
      }).catch((error) => {
        console.log('Ошибка тестовой просрочки:', error);
      });
    }
  };

  const applyLoanOverduePenalty = async () => {
    if (!activeLoan) return;

    const now = Date.now();

    if (now <= activeLoan.nextPaymentAt) return;

    const paymentDurationSeconds = getLoanPaymentDurationSeconds(level);
    const penalty = Math.ceil(activeLoan.monthlyPayment * 0.001);
    const nextXp = Math.max(0, xp - 10);

    const updatedLoan: ActiveLoan = {
      ...activeLoan,
      status: 'overdue',
      overdueDays: activeLoan.overdueDays + 1,
      penaltyAmount: activeLoan.penaltyAmount + penalty,
      remainingDebt: activeLoan.remainingDebt + penalty,
      nextPaymentAt: now + paymentDurationSeconds * 1000,
    };

    setXp(nextXp);
    setActiveLoan(updatedLoan);
    setLoanRemainingSeconds(paymentDurationSeconds);

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