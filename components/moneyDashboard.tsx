"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  Flame,
  Moon,
  Repeat,
  Settings,
  TrendingUp,
  X,
  HandCoins
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";
import {
  cancelRecurringBill,
  createCutoutChallenge,
} from "@/lib/action/money";
import type { MoneyDashboardData } from "@/lib/moneyFlowTypes";
import { Button } from "./ui/button";
import FinancialProfileDialog from "./financialProfileDialog";
import MoneyWrapUpDialog from "./moneyWrapUpDialog";
import QuickExpenseForm from "./quickExpenseForm";

const WRAP_UP_HOUR = 18;
const WRAP_UP_STORAGE_KEY = "money-wrap-up-shown";

function challengeTone(spent: number, cap: number) {
  const ratio = cap > 0 ? spent / cap : 0;
  if (ratio >= 1) return "bg-rose-500";
  if (ratio >= 0.75) return "bg-amber-500";
  return "bg-emerald-500";
}

export default function MoneyDashboard({ data }: { data: MoneyDashboardData }) {
  const { profile, pulse, upcomingRenewals, audit, challenges } = data;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWrapUpOpen, setIsWrapUpOpen] = useState(false);
  const [dismissedRenewals, setDismissedRenewals] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  const formatMoney = (amount: number) =>
    `${amount < 0 ? "-" : ""}${profile.currencySymbol}${Math.abs(amount).toFixed(2)}`;

  // Opens the wrap-up once per day at 6:00 PM local time.
  useEffect(() => {
    const todayKey = new Date().toDateString();
    if (localStorage.getItem(WRAP_UP_STORAGE_KEY) === todayKey) return;

    const show = () => {
      localStorage.setItem(WRAP_UP_STORAGE_KEY, todayKey);
      setIsWrapUpOpen(true);
    };
    const wrapUpTime = new Date();
    wrapUpTime.setHours(WRAP_UP_HOUR, 0, 0, 0);
    const delay = wrapUpTime.getTime() - Date.now();
    if (delay <= 0) {
      show();
      return;
    }
    const timeout = window.setTimeout(show, delay);
    return () => window.clearTimeout(timeout);
  }, []);

  async function handleCancelBill(billId: string) {
    setBusyId(billId);
    try {
      const result = await cancelRecurringBill(billId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Recurring bill cancelled");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreateChallenge(category: string, cap: number) {
    setBusyId(category);
    try {
      const result = await createCutoutChallenge(category, cap);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`${category} capped at ${formatMoney(cap)} next month`);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  const visibleRenewals = upcomingRenewals.filter(
    (renewal) => !dismissedRenewals.includes(renewal.id),
  );
  const needsSetup = profile.monthlyIncome === 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-primary">
          <HandCoins size="30"/>
          <h1 className="text-3xl font-semibold tracking-tight">  Money Flow</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Log expenses with Ctrl / Cmd K, e.g. &ldquo;coffee $4.50&rdquo; or
            &ldquo;netflix $15 monthly&rdquo;.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {profile.noSpendStreak > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-500">
              <Flame className="size-4" />
              {profile.noSpendStreak}
            </span>
          )}
          <Button variant="outline" onClick={() => setIsWrapUpOpen(true)}>
            <Moon className="size-4" />
            Wrap Up Day
          </Button>
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsProfileOpen(true)}
                aria-label="Budget settings"
              >
                <Settings className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Set your budget</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <QuickExpenseForm formatMoney={formatMoney} />

      {visibleRenewals.map((renewal) => (
        <div
          key={renewal.id}
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm"
        >
          <Bell className="size-4 shrink-0 text-amber-500" />
          <p className="flex-1">
            Upcoming: <span className="font-medium">{renewal.title}</span> (
            {formatMoney(renewal.amount)}) renews in {renewal.daysUntil} day
            {renewal.daysUntil === 1 ? "" : "s"}. Keep or cancel?
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setDismissedRenewals((ids) => [...ids, renewal.id])
            }
          >
            Keep
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={busyId === renewal.id}
            onClick={() => handleCancelBill(renewal.id)}
          >
            Cancel
          </Button>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() =>
              setDismissedRenewals((ids) => [...ids, renewal.id])
            }
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}

      <section
        aria-label="Daily safe to spend"
        className="rounded-2xl border bg-card p-6 shadow-sm"
      >
        {needsSetup ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Set your monthly budget</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your income and savings goal to see your daily
                Safe-to-Spend.
              </p>
            </div>
            <Button onClick={() => setIsProfileOpen(true)}>Set budget</Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <p className="text-sm text-muted-foreground">
                Safe to spend today
              </p>
              <p className="mt-1 text-5xl font-semibold tracking-tight">
                {formatMoney(pulse.dailySafeToSpend)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatMoney(pulse.remainingPool)} left over{" "}
                {pulse.daysRemaining} day{pulse.daysRemaining === 1 ? "" : "s"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today&apos;s spend</p>
              <p className="mt-1 text-3xl font-semibold">
                {formatMoney(pulse.todaySpend)}
              </p>
              <span
                className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  pulse.isOverPace
                    ? "bg-rose-500/15 text-rose-500"
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    pulse.isOverPace ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                />
                {pulse.isOverPace ? "Over pace" : "On pace"}
              </span>
            </div>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Income</dt>
                <dd>{formatMoney(profile.monthlyIncome)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Fixed bills</dt>
                <dd>-{formatMoney(pulse.fixedBillsTotal)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Savings goal</dt>
                <dd>-{formatMoney(profile.monthlySavingsGoal)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Spent this month</dt>
                <dd>-{formatMoney(pulse.variableSpend)}</dd>
              </div>
            </dl>
          </div>
        )}
      </section>

      {audit && (
        <section
          aria-label="Spending leaks"
          className="rounded-2xl border bg-card p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            <h2 className="text-lg font-semibold">
              {audit.kind === "mid-month"
                ? "Mid-month pace check"
                : "Monthly wrap-up"}
            </h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            {audit.kind === "mid-month"
              ? "At your current pace, these categories will end the month above last month."
              : "These categories grew the most compared with last month."}
          </p>
          <ul className="space-y-3">
            {audit.leaks.map((leak) => (
              <li
                key={leak.category}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{leak.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(leak.currentAmount)}
                    {audit.kind === "mid-month" ? " projected" : ""} vs{" "}
                    {formatMoney(leak.previousAmount)} last month (
                    <TrendingUp className="inline size-3" /> +
                    {formatMoney(leak.increase)})
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={leak.hasChallenge ? "outline" : "default"}
                  disabled={leak.hasChallenge || busyId === leak.category}
                  onClick={() =>
                    handleCreateChallenge(leak.category, leak.suggestedCap)
                  }
                >
                  {leak.hasChallenge
                    ? "Cap set"
                    : `Cap at ${formatMoney(leak.suggestedCap)} Next Month`}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {challenges.length > 0 && (
        <section
          aria-label="Cut-out challenges"
          className="rounded-2xl border bg-card p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold">Cut-out challenges</h2>
          <ul className="space-y-4">
            {challenges.map((challenge) => {
              const percent = Math.min(
                100,
                (challenge.spent / challenge.targetCapAmount) * 100,
              );
              return (
                <li key={challenge.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">
                      {challenge.category}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {challenge.monthYear}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {formatMoney(challenge.spent)} /{" "}
                      {formatMoney(challenge.targetCapAmount)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${challengeTone(
                        challenge.spent,
                        challenge.targetCapAmount,
                      )}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section
          aria-label="Recent transactions"
          className="rounded-2xl border bg-card p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold">Recent transactions</h2>
          {data.recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No expenses yet. Press Ctrl / Cmd K to log one.
            </p>
          ) : (
            <ul className="divide-y">
              {data.recentTransactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {transaction.title}
                      {transaction.isRecurring && (
                        <Repeat className="ml-1 inline size-3 text-muted-foreground" />
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.category} · {transaction.date}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium">
                    {formatMoney(transaction.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-label="Recurring bills"
          className="rounded-2xl border bg-card p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold">Recurring bills</h2>
          {data.recurringBills.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add &ldquo;monthly&rdquo;, &ldquo;yearly&rdquo;, or
              &ldquo;daily&rdquo; to an expense to make it recurring.
            </p>
          ) : (
            <ul className="divide-y">
              {data.recurringBills.map((bill) => (
                <li
                  key={bill.id}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{bill.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatMoney(bill.amount)} {bill.frequency} · next{" "}
                      {bill.nextDueDate}
                    </p>
                  </div>
                  <Button
                    size="xs"
                    variant="ghost"
                    disabled={busyId === bill.id}
                    onClick={() => handleCancelBill(bill.id)}
                  >
                    Cancel
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <FinancialProfileDialog
        key={`${profile.monthlyIncome}-${profile.monthlySavingsGoal}-${profile.currencySymbol}`}
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        profile={profile}
      />
      <MoneyWrapUpDialog
        open={isWrapUpOpen}
        onOpenChange={setIsWrapUpOpen}
        data={data}
        formatMoney={formatMoney}
      />
    </div>
  );
}
