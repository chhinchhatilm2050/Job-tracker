"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import {
  CutoutChallenge,
  FinancialProfile,
  RecurringBill,
  Transaction,
} from "../models";
import {
  getNextRecurringDate,
  parseExpenseInput,
} from "../moneyFlowParser";
import {
  computePulse,
  daysInUtcMonth,
  findTopLeaks,
  monthKey,
  monthlyBillCost,
  roundMoney,
  utcDayStart,
  utcMonthStart,
} from "../moneyFlowMath";
import {
  TRANSACTION_CATEGORIES,
  type MoneyDashboardData,
  type RecurringFrequency,
  type TransactionCategory,
} from "../moneyFlowTypes";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_AMOUNT = 1_000_000_000;
// Upper bound on missed periods to back-fill per bill (about a year of a daily bill).
const MAX_CATCH_UP_PERIODS = 400;

function isValidAmount(value: unknown, allowZero = true): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    (allowZero ? value >= 0 : value > 0) &&
    value <= MAX_AMOUNT
  );
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function getOrCreateProfile(userId: string) {
  return FinancialProfile.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

/**
 * Logs a transaction for every period a recurring bill has come due and
 * advances nextDueDate. Each period is claimed with a compare-and-set on
 * nextDueDate, so concurrent page loads cannot log the same bill twice.
 */
async function processDueBills(userId: string, today: Date) {
  const dueBills = await RecurringBill.find({
    userId,
    isActive: true,
    nextDueDate: { $lte: today },
  });

  for (const bill of dueBills) {
    let dueDate = new Date(bill.nextDueDate);
    for (let i = 0; i < MAX_CATCH_UP_PERIODS && dueDate <= today; i++) {
      const nextDueDate = getNextRecurringDate(
        dueDate,
        bill.frequency as RecurringFrequency,
        bill.billingDay ?? dueDate.getUTCDate(),
      );
      const claimed = await RecurringBill.findOneAndUpdate(
        { _id: bill._id, userId, isActive: true, nextDueDate: dueDate },
        { $set: { nextDueDate } },
      );
      if (!claimed) break;

      await Transaction.create({
        userId,
        rawInput: `Auto-logged recurring bill: ${bill.title}`,
        title: bill.title,
        amount: bill.amount,
        category: bill.category,
        date: utcDayStart(dueDate),
        isRecurring: true,
        recurringId: bill._id,
      });
      dueDate = nextDueDate;
    }
  }
}

export async function getMoneyDashboard(): Promise<
  | { error: string; data?: undefined }
  | { error?: undefined; data: MoneyDashboardData }
> {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };
  const userId = session.user.id;

  await connectDB();
  const today = utcDayStart();
  const tomorrow = new Date(today.getTime() + DAY_MS);
  const yesterday = new Date(today.getTime() - DAY_MS);
  await processDueBills(userId, today);

  const monthStart = utcMonthStart(today);
  const previousMonthStart = utcMonthStart(today, -1);
  const nextMonthStart = utcMonthStart(today, 1);
  const currentMonthYear = monthKey(today);
  const nextMonthYear = monthKey(nextMonthStart);

  const [profile, bills, transactions, recent, challenges] = await Promise.all([
    getOrCreateProfile(userId),
    RecurringBill.find({ userId, isActive: true }).sort({ nextDueDate: 1 }).lean(),
    Transaction.find({
      userId,
      date: { $gte: previousMonthStart, $lt: tomorrow },
    })
      .select("amount category date isRecurring")
      .lean(),
    Transaction.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(10).lean(),
    CutoutChallenge.find({
      userId,
      monthYear: { $in: [currentMonthYear, nextMonthYear] },
    })
      .sort({ monthYear: 1, category: 1 })
      .lean(),
  ]);

  const daysInMonth = daysInUtcMonth(today);
  const daysInNextMonth = daysInUtcMonth(nextMonthStart);
  let fixedBillsTotal = 0;
  let nextMonthFixedBillsTotal = 0;
  for (const bill of bills) {
    fixedBillsTotal += monthlyBillCost(bill.amount, bill.frequency, daysInMonth);
    nextMonthFixedBillsTotal += monthlyBillCost(
      bill.amount,
      bill.frequency,
      daysInNextMonth,
    );
  }

  // Fixed bills are excluded from variable spend and from the leak audit.
  let variableSpendBeforeToday = 0;
  let todayVariableSpend = 0;
  let todayTotalSpend = 0;
  const currentByCategory = new Map<TransactionCategory, number>();
  const previousByCategory = new Map<TransactionCategory, number>();
  for (const transaction of transactions) {
    const date = new Date(transaction.date);
    const category = transaction.category as TransactionCategory;
    const isToday = date >= today;
    if (isToday) todayTotalSpend += transaction.amount;
    if (transaction.isRecurring) continue;

    if (date >= monthStart) {
      if (isToday) todayVariableSpend += transaction.amount;
      else variableSpendBeforeToday += transaction.amount;
      currentByCategory.set(
        category,
        (currentByCategory.get(category) ?? 0) + transaction.amount,
      );
    } else {
      previousByCategory.set(
        category,
        (previousByCategory.get(category) ?? 0) + transaction.amount,
      );
    }
  }

  const pulse = computePulse({
    today,
    monthlyIncome: profile.monthlyIncome,
    monthlySavingsGoal: profile.monthlySavingsGoal,
    fixedBillsTotal,
    variableSpendBeforeToday,
    todaySpend: todayVariableSpend,
    nextMonthFixedBillsTotal,
  });

  const renewalWindowEnd = new Date(today.getTime() + 3 * DAY_MS);
  const upcomingRenewals = bills
    .filter((bill) => {
      const due = new Date(bill.nextDueDate);
      return due > today && due <= renewalWindowEnd;
    })
    .map((bill) => ({
      id: String(bill._id),
      title: bill.title,
      amount: bill.amount,
      daysUntil: Math.round(
        (new Date(bill.nextDueDate).getTime() - today.getTime()) / DAY_MS,
      ),
    }));

  // The audit appears from the 15th (mid-month pace, projected to a full
  // month) and switches to the monthly wrap-up on the last day.
  let audit: MoneyDashboardData["audit"] = null;
  const dayOfMonth = today.getUTCDate();
  if (dayOfMonth >= 15) {
    const kind = dayOfMonth === daysInMonth ? "month-end" : "mid-month";
    const paceMultiplier = kind === "mid-month" ? daysInMonth / dayOfMonth : 1;
    const leaks = findTopLeaks(currentByCategory, previousByCategory, paceMultiplier);
    if (leaks.length > 0) {
      audit = {
        kind,
        nextMonthYear,
        leaks: leaks.map((leak) => ({
          ...leak,
          hasChallenge: challenges.some(
            (challenge) =>
              challenge.monthYear === nextMonthYear &&
              challenge.category === leak.category,
          ),
        })),
      };
    }
  }

  const lastNoSpendDate = profile.lastNoSpendDate
    ? utcDayStart(new Date(profile.lastNoSpendDate))
    : null;
  const streakIsAlive = Boolean(lastNoSpendDate && lastNoSpendDate >= yesterday);

  return {
    data: {
      profile: {
        monthlyIncome: profile.monthlyIncome,
        monthlySavingsGoal: profile.monthlySavingsGoal,
        currencySymbol: profile.currencySymbol,
        noSpendStreak: streakIsAlive ? profile.noSpendStreak : 0,
        claimedNoSpendToday: lastNoSpendDate?.getTime() === today.getTime(),
      },
      pulse: { ...pulse, todayTotalSpend: roundMoney(todayTotalSpend) },
      upcomingRenewals,
      audit,
      challenges: challenges.map((challenge) => ({
        id: String(challenge._id),
        category: challenge.category,
        monthYear: challenge.monthYear,
        targetCapAmount: challenge.targetCapAmount,
        spent:
          challenge.monthYear === currentMonthYear
            ? roundMoney(currentByCategory.get(challenge.category) ?? 0)
            : 0,
        status: challenge.status,
      })),
      recentTransactions: recent.map((transaction) => ({
        id: String(transaction._id),
        title: transaction.title,
        amount: transaction.amount,
        category: transaction.category,
        date: dateKey(new Date(transaction.date)),
        isRecurring: transaction.isRecurring,
      })),
      recurringBills: bills.map((bill) => ({
        id: String(bill._id),
        title: bill.title,
        amount: bill.amount,
        frequency: bill.frequency,
        nextDueDate: dateKey(new Date(bill.nextDueDate)),
      })),
    },
  };
}

export async function updateFinancialProfile(input: {
  monthlyIncome: number;
  monthlySavingsGoal: number;
  currencySymbol: string;
}) {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };
  if (
    !isValidAmount(input?.monthlyIncome) ||
    !isValidAmount(input?.monthlySavingsGoal)
  ) {
    return { error: "Income and savings goal must be zero or more" };
  }
  const currencySymbol =
    typeof input.currencySymbol === "string" ? input.currencySymbol.trim() : "";
  if (currencySymbol.length < 1 || currencySymbol.length > 3) {
    return { error: "Currency symbol must be 1 to 3 characters" };
  }

  await connectDB();
  await FinancialProfile.findOneAndUpdate(
    { userId: session.user.id },
    {
      $set: {
        monthlyIncome: roundMoney(input.monthlyIncome),
        monthlySavingsGoal: roundMoney(input.monthlySavingsGoal),
        currencySymbol,
      },
    },
    { upsert: true, setDefaultsOnInsert: true },
  );

  revalidatePath("/money");
  return { success: true };
}

export async function cancelRecurringBill(billId: string) {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };
  if (typeof billId !== "string" || !billId || billId.length > 64) {
    return { error: "Invalid bill" };
  }

  await connectDB();
  const result = await RecurringBill.updateOne(
    { _id: billId, userId: session.user.id },
    { $set: { isActive: false } },
  );
  if (result.matchedCount === 0) return { error: "Bill not found" };

  revalidatePath("/money");
  return { success: true };
}

export async function createCutoutChallenge(
  category: string,
  targetCapAmount: number,
) {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };
  const validCategory = TRANSACTION_CATEGORIES.find((item) => item === category);
  if (!validCategory) return { error: "Choose a valid category" };
  if (!isValidAmount(targetCapAmount, false)) {
    return { error: "Cap must be more than zero" };
  }

  await connectDB();
  const monthYear = monthKey(utcMonthStart(new Date(), 1));
  await CutoutChallenge.findOneAndUpdate(
    { userId: session.user.id, category: validCategory, monthYear },
    { $set: { targetCapAmount: roundMoney(targetCapAmount), status: "active" } },
    { upsert: true, setDefaultsOnInsert: true },
  );

  revalidatePath("/money");
  return { success: true };
}

export async function claimNoSpendDay() {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };
  const userId = session.user.id;

  await connectDB();
  const today = utcDayStart();
  const tomorrow = new Date(today.getTime() + DAY_MS);
  const yesterday = new Date(today.getTime() - DAY_MS);

  const spentToday = await Transaction.exists({
    userId,
    date: { $gte: today, $lt: tomorrow },
  });
  if (spentToday) return { error: "You've logged spending today" };

  const profile = await getOrCreateProfile(userId);
  const last = profile.lastNoSpendDate
    ? utcDayStart(new Date(profile.lastNoSpendDate))
    : null;
  if (last && last >= today) return { error: "Already claimed today" };
  const continuesStreak = last?.getTime() === yesterday.getTime();

  // Guard on lastNoSpendDate so a double click cannot claim twice.
  const updated = await FinancialProfile.findOneAndUpdate(
    {
      userId,
      $or: [
        { lastNoSpendDate: { $exists: false } },
        { lastNoSpendDate: { $lt: today } },
      ],
    },
    continuesStreak
      ? { $inc: { noSpendStreak: 1 }, $set: { lastNoSpendDate: today } }
      : { $set: { noSpendStreak: 1, lastNoSpendDate: today } },
    { new: true },
  );
  if (!updated) return { error: "Already claimed today" };

  revalidatePath("/money");
  return { success: true, streak: updated.noSpendStreak as number };
}

export async function captureExpense(
  input: string,
  categoryOverride?: string,
) {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };
  if (typeof input !== "string" || !input.trim() || input.trim().length > 300) {
    return { error: "Enter an expense between 1 and 300 characters" };
  }

  const parsed = parseExpenseInput(input);
  if (!parsed) {
    return { error: "Include an amount, such as “coffee $4.50”" };
  }
  if (parsed.amount === null || !Number.isFinite(parsed.amount)) {
    return { error: "Add an amount before logging this expense" };
  }

  const selectedCategory = categoryOverride
    ? TRANSACTION_CATEGORIES.find((category) => category === categoryOverride)
    : parsed.category;
  if (!selectedCategory) {
    return { error: "Choose a valid expense category" };
  }

  await connectDB();

  const expenseDate = new Date(`${parsed.date}T00:00:00.000Z`);
  let recurringId: string | undefined;
  if (parsed.frequency) {
    const bill = await RecurringBill.create({
      userId: session.user.id,
      title: parsed.title,
      amount: parsed.amount,
      category: selectedCategory,
      frequency: parsed.frequency,
      nextDueDate: getNextRecurringDate(expenseDate, parsed.frequency),
      billingDay: expenseDate.getUTCDate(),
      isActive: true,
    });
    recurringId = String(bill._id);
  }

  const transaction = await Transaction.create({
    userId: session.user.id,
    rawInput: input.trim(),
    title: parsed.title,
    amount: parsed.amount,
    category: selectedCategory,
    date: expenseDate,
    isRecurring: Boolean(parsed.frequency),
    recurringId,
  });

  revalidatePath("/money");
  return {
    success: true,
    data: {
      transactionId: String(transaction._id),
      title: transaction.title,
      amount: transaction.amount,
      category: transaction.category,
      isRecurring: transaction.isRecurring,
    },
  };
}
