export const TRANSACTION_CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Utilities",
  "Subscriptions",
  "Shopping",
  "Entertainment",
  "Health",
  "Other",
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];
export type RecurringFrequency = "daily" | "monthly" | "yearly";

export interface SpendingLeak {
  category: TransactionCategory;
  currentAmount: number;
  previousAmount: number;
  increase: number;
  suggestedCap: number;
}

export interface MoneyDashboardData {
  profile: {
    monthlyIncome: number;
    monthlySavingsGoal: number;
    currencySymbol: string;
    noSpendStreak: number;
    claimedNoSpendToday: boolean;
  };
  pulse: {
    dailySafeToSpend: number;
    todaySpend: number;
    todayTotalSpend: number;
    remainingPool: number;
    fixedBillsTotal: number;
    variableSpend: number;
    daysRemaining: number;
    tomorrowSafeToSpend: number;
    isOverPace: boolean;
  };
  upcomingRenewals: Array<{
    id: string;
    title: string;
    amount: number;
    daysUntil: number;
  }>;
  audit: {
    kind: "mid-month" | "month-end";
    nextMonthYear: string;
    leaks: Array<SpendingLeak & { hasChallenge: boolean }>;
  } | null;
  challenges: Array<{
    id: string;
    category: TransactionCategory;
    monthYear: string;
    targetCapAmount: number;
    spent: number;
    status: "active" | "completed" | "failed";
  }>;
  recentTransactions: Array<{
    id: string;
    title: string;
    amount: number;
    category: TransactionCategory;
    date: string;
    isRecurring: boolean;
  }>;
  recurringBills: Array<{
    id: string;
    title: string;
    amount: number;
    frequency: RecurringFrequency;
    nextDueDate: string;
  }>;
}
