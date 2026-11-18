import type {
  RecurringFrequency,
  SpendingLeak,
  TransactionCategory,
} from "./moneyFlowTypes";

export function utcDayStart(date = new Date()) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function utcMonthStart(date: Date, offsetMonths = 0) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offsetMonths, 1),
  );
}

export function daysInUtcMonth(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
}

export function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

/** Converts a bill to what it costs over one month of `daysInMonth` days. */
export function monthlyBillCost(
  amount: number,
  frequency: RecurringFrequency,
  daysInMonth: number,
) {
  if (frequency === "daily") return amount * daysInMonth;
  if (frequency === "yearly") return amount / 12;
  return amount;
}

/**
 * Daily Safe-to-Spend = (income - fixed bills - savings - variable spend
 * before today) / days left in the month including today. Today's spend is
 * excluded from the pool so the allowance stays stable through the day and
 * can be compared against today's spend for pacing.
 */
export function computePulse(input: {
  today: Date;
  monthlyIncome: number;
  monthlySavingsGoal: number;
  fixedBillsTotal: number;
  variableSpendBeforeToday: number;
  todaySpend: number;
  nextMonthFixedBillsTotal: number;
}) {
  const daysInMonth = daysInUtcMonth(input.today);
  const daysRemaining = daysInMonth - input.today.getUTCDate() + 1;
  const baseBudget =
    input.monthlyIncome - input.fixedBillsTotal - input.monthlySavingsGoal;
  const remainingPool = baseBudget - input.variableSpendBeforeToday;
  const dailySafeToSpend = Math.max(0, remainingPool / daysRemaining);

  const poolAfterToday = remainingPool - input.todaySpend;
  const tomorrowSafeToSpend =
    daysRemaining > 1
      ? Math.max(0, poolAfterToday / (daysRemaining - 1))
      : Math.max(
          0,
          (input.monthlyIncome -
            input.nextMonthFixedBillsTotal -
            input.monthlySavingsGoal) /
            daysInUtcMonth(utcMonthStart(input.today, 1)),
        );

  return {
    dailySafeToSpend: roundMoney(dailySafeToSpend),
    todaySpend: roundMoney(input.todaySpend),
    remainingPool: roundMoney(poolAfterToday),
    fixedBillsTotal: roundMoney(input.fixedBillsTotal),
    variableSpend: roundMoney(input.variableSpendBeforeToday + input.todaySpend),
    daysRemaining,
    tomorrowSafeToSpend: roundMoney(tomorrowSafeToSpend),
    isOverPace: input.todaySpend > dailySafeToSpend,
  };
}

/**
 * Returns the 3 categories with the largest dollar increase over last month.
 * `paceMultiplier` projects a partial month to a full one (mid-month audit).
 */
export function findTopLeaks(
  current: Map<TransactionCategory, number>,
  previous: Map<TransactionCategory, number>,
  paceMultiplier = 1,
): SpendingLeak[] {
  return [...current.entries()]
    .map(([category, spent]) => {
      const currentAmount = roundMoney(spent * paceMultiplier);
      const previousAmount = roundMoney(previous.get(category) ?? 0);
      const capBase = previousAmount > 0 ? previousAmount : currentAmount * 0.8;
      return {
        category,
        currentAmount,
        previousAmount,
        increase: roundMoney(currentAmount - previousAmount),
        suggestedCap: Math.max(5, Math.floor(capBase / 5) * 5),
      };
    })
    .filter((leak) => leak.increase > 0)
    .sort((a, b) => b.increase - a.increase)
    .slice(0, 3);
}
