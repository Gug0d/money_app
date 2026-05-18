import { DepositProduct } from '../constants/depositProducts';
import { LoanProduct } from '../constants/loanProducts';

export type MortgageStatus = 'locked' | 'available' | 'active' | 'completed';
export type ActiveLoanStatus = 'active' | 'overdue' | 'closed';

export type HomeBillStatus = 'pending' | 'paid' | 'warning' | 'overdue';

export type HomeBill = {
  id: number;
  title: string;
  amount: number;
  due: string;
  status: HomeBillStatus;
  icon: string;
  dueAt: number;
  penalty: number;
  penaltyApplied: boolean;
};

export type HomeEvent = {
  id: string;
  title: string;
  description: string;
  cost: number;
  comfortReward: number;
  disciplineReward: number;
  postponeComfortPenalty: number;
  postponeDisciplinePenalty: number;
  icon: string;
};

export type MortgageState = {
  isActive: boolean;
  isCompleted: boolean;
  totalSeconds: number;
  durationSeconds: number;
  startedAt: number | null;
};

export type ActiveDeposit = {
  productId: string;
  title: string;
  amount: number;
  interestPercent: number;
  payoutAmount: number;
  durationSeconds: number;
  startedAt: number;
  isCompleted: boolean;
};

export type ActiveLoan = {
  productId: string;
  title: string;
  principal: number;
  remainingDebt: number;
  interestPercent: number;
  totalRepayment: number;
  monthlyPayment: number;
  paidPayments: number;
  totalPayments: number;
  nextPaymentAt: number;
  overdueDays: number;
  penaltyAmount: number;
  status: ActiveLoanStatus;
};

export type GameContextType = {
  xp: number;
  finCoin: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressToNextLevel: number;
  getLevelByXp: (xp: number) => number;

  mortgage: MortgageState;
  mortgageStatus: MortgageStatus;
  mortgageRemainingSeconds: number;

  activeDeposit: ActiveDeposit | null;
  depositRemainingSeconds: number;

  activeLoan: ActiveLoan | null;
  loanRemainingSeconds: number;

  homeBills: HomeBill[];
  homeComfort: number;
  homeDiscipline: number;
  homeEvent: HomeEvent | null;
  homeEventAvailableAt: number | null;
  homeBillsRefreshRemainingSeconds: number;

  activeJobId: string | null;
  ownedPropertyId: string | null;
  activeBoostIds: string[];
  boostOfferIds: string[];
  boostOffersRefreshAt: number | null;
  nextSalaryAvailableAt: number | null;


  applyJob: (jobId: string) => Promise<{ success: boolean; message: string }>;
  receiveSalary: () => Promise<{ success: boolean; message: string }>;
  buyProperty: (
    propertyId: string
  ) => Promise<{ success: boolean; message: string }>;
  buyBoost: (boostId: string) => Promise<{ success: boolean; message: string }>;
  skipBoostOffer: (
    boostId: string
  ) => Promise<{ success: boolean; message: string }>;
  runRiskDeal: (
    dealId: string
  ) => Promise<{ success: boolean; message: string }>;



  payHomeBill: (billId: number) => Promise<boolean>;
  repairHomeProblem: () => Promise<boolean>;
  postponeHomeProblem: () => Promise<boolean>;
  resetHomeBillsForTest: () => Promise<void>;
  triggerHomeEventForTest: () => Promise<void>;

  isGuest: boolean;
  isGameLoading: boolean;
  userDataLoaded: boolean;

  viewedTutorialIds: string[];

  markTutorialViewed: (tutorialId: string) => Promise<void>;
  resetTutorialProgress: () => Promise<void>;

  addRewards: (xpToAdd: number, finCoinToAdd: number) => Promise<void>;
  addTestXp: (amount: number) => Promise<void>;
  addTestCoins: (amount: number) => Promise<void>;
  resetLevelForTest: () => Promise<void>;
  spendFinCoin: (amount: number) => Promise<boolean>;

  openDeposit: (
    product: DepositProduct,
    amount?: number
  ) => Promise<{ success: boolean; message: string }>;

  reduceDepositTime: (seconds: number, cost?: number) => Promise<boolean>;

  takeLoan: (
    product: LoanProduct
  ) => Promise<{ success: boolean; message: string }>;

  payLoan: () => Promise<boolean>;
  closeLoan: () => Promise<boolean>;
  forceOverdue: () => void;

  startMortgage: (options?: {
    totalSeconds?: number;
    downPayment?: number;
  }) => Promise<boolean>;

  reduceMortgageTime: (seconds: number, cost: number) => Promise<boolean>;
  reloadUserData: () => Promise<void>;
};