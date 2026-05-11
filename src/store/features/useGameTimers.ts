import { useEffect } from 'react';
import { ActiveDeposit, MortgageState } from '../gameTypes';

type Params = {
  finCoin: number;
  isGuest: boolean;
  userId: string | null;

  mortgage: MortgageState;
  setMortgage: React.Dispatch<React.SetStateAction<MortgageState>>;
  mortgageCompletedRef: React.MutableRefObject<boolean>;
  setMortgageRemainingSeconds: React.Dispatch<React.SetStateAction<number>>;

  activeDeposit: ActiveDeposit | null;
  setActiveDeposit: React.Dispatch<React.SetStateAction<ActiveDeposit | null>>;
  depositCompletedRef: React.MutableRefObject<boolean>;
  setDepositRemainingSeconds: React.Dispatch<React.SetStateAction<number>>;

  setFinCoin: React.Dispatch<React.SetStateAction<number>>;

  saveUserGameData: (data: Record<string, any>) => Promise<void>;
};

export function useGameTimers({
  finCoin,
  isGuest,
  userId,

  mortgage,
  setMortgage,
  mortgageCompletedRef,
  setMortgageRemainingSeconds,

  activeDeposit,
  setActiveDeposit,
  depositCompletedRef,
  setDepositRemainingSeconds,

  setFinCoin,

  saveUserGameData,
}: Params) {
  useEffect(() => {
    const updateMortgageRemaining = () => {
      if (!mortgage.isActive || !mortgage.startedAt) {
        setMortgageRemainingSeconds(0);
        return;
      }

      const now = Date.now();
      const passedSeconds = Math.floor((now - mortgage.startedAt) / 1000);
      const remaining = Math.max(0, mortgage.durationSeconds - passedSeconds);

      setMortgageRemainingSeconds(remaining);
    };

    updateMortgageRemaining();

    if (!mortgage.isActive || !mortgage.startedAt) return;

    const interval = setInterval(updateMortgageRemaining, 1000);
    return () => clearInterval(interval);
  }, [mortgage, setMortgageRemainingSeconds]);

  useEffect(() => {
    const completeMortgage = async () => {
      if (!mortgage.isActive || mortgage.isCompleted || !mortgage.startedAt) {
        return;
      }

      const now = Date.now();
      const passedSeconds = Math.floor((now - mortgage.startedAt) / 1000);
      const remaining = mortgage.durationSeconds - passedSeconds;

      if (remaining > 0) return;
      if (mortgageCompletedRef.current) return;

      mortgageCompletedRef.current = true;

      const nextMortgage: MortgageState = {
        ...mortgage,
        isActive: false,
        isCompleted: true,
      };

      setMortgage(nextMortgage);
      setMortgageRemainingSeconds(0);

      if (!isGuest && userId) {
        try {
          await saveUserGameData({
            mortgage: nextMortgage,
          });
        } catch (error) {
          console.log('Ошибка завершения ипотеки:', error);
        }
      }
    };

    completeMortgage();
  }, [
    mortgage,
    isGuest,
    userId,
    setMortgage,
    setMortgageRemainingSeconds,
    mortgageCompletedRef,
    saveUserGameData,
  ]);

  useEffect(() => {
    if (!mortgage.isActive) {
      mortgageCompletedRef.current = false;
    }
  }, [mortgage.isActive, mortgageCompletedRef]);

  useEffect(() => {
    const updateDepositRemaining = () => {
      if (!activeDeposit || activeDeposit.isCompleted) {
        setDepositRemainingSeconds(0);
        return;
      }

      const now = Date.now();
      const passedSeconds = Math.floor((now - activeDeposit.startedAt) / 1000);
      const remaining = Math.max(
        0,
        activeDeposit.durationSeconds - passedSeconds
      );

      setDepositRemainingSeconds(remaining);
    };

    updateDepositRemaining();

    if (!activeDeposit || activeDeposit.isCompleted) return;

    const interval = setInterval(updateDepositRemaining, 1000);
    return () => clearInterval(interval);
  }, [activeDeposit, setDepositRemainingSeconds]);

  useEffect(() => {
    const completeDeposit = async () => {
      if (!activeDeposit || activeDeposit.isCompleted) return;

      const now = Date.now();
      const passedSeconds = Math.floor((now - activeDeposit.startedAt) / 1000);
      const remaining = activeDeposit.durationSeconds - passedSeconds;

      if (remaining > 0) return;
      if (depositCompletedRef.current) return;

      depositCompletedRef.current = true;

      const nextFinCoin = finCoin + activeDeposit.payoutAmount;

      setFinCoin(nextFinCoin);
      setActiveDeposit(null);
      setDepositRemainingSeconds(0);

      if (!isGuest && userId) {
        try {
          await saveUserGameData({
            finCoin: nextFinCoin,
            activeDeposit: null,
          });
        } catch (error) {
          console.log('Ошибка завершения вклада:', error);
        }
      }
    };

    completeDeposit();
  }, [
    activeDeposit,
    finCoin,
    isGuest,
    userId,
    setFinCoin,
    setActiveDeposit,
    setDepositRemainingSeconds,
    depositCompletedRef,
    saveUserGameData,
  ]);

  useEffect(() => {
    if (!activeDeposit) {
      depositCompletedRef.current = false;
    }
  }, [activeDeposit, depositCompletedRef]);
}