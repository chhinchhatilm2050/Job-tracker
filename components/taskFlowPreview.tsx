"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useSpring, useTransform } from "motion/react";
import { CornerDownLeft, Flame, ListTodo, Sparkles, Wallet } from "lucide-react";

type Slot = { time: string; title: string; minutes: number; high?: boolean };

type Example = {
  text: string;
  kind: "Task" | "Expense";
  chips: string[];
  slot?: Slot;
  amount?: number;
};

const DAILY_ALLOWANCE = 50;

const baseSlots: Slot[] = [
  { time: "9:00", title: "Interview prep", minutes: 60, high: true },
  { time: "11:00", title: "Reply to recruiter", minutes: 15 },
];

const examples: Example[] = [
  {
    text: "Apply to Stripe frontend role tomorrow high 1h",
    kind: "Task",
    chips: ["Tomorrow", "High priority", "1 hour", "Job Hunt"],
    slot: { time: "10:00", title: "Apply to Stripe", minutes: 60, high: true },
  },
  {
    text: "lunch $12",
    kind: "Expense",
    chips: ["$12.00", "Food & Dining", "Today"],
    amount: 12,
  },
  {
    text: "Prep portfolio review today 30m",
    kind: "Task",
    chips: ["Today", "30 min", "My Day"],
    slot: { time: "11:15", title: "Prep portfolio review", minutes: 30 },
  },
  {
    text: "spotify $11 monthly",
    kind: "Expense",
    chips: ["$11.00", "Subscriptions", "Repeats monthly"],
    amount: 11,
  },
];

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ") || "0m";
};

const money = (value: number) => `$${value.toFixed(2)}`;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// Reports false during SSR and hydration, so server and client markup match.
function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

function useTypedExample(reduceMotion: boolean | null) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const example = examples[index];
  const done = Boolean(reduceMotion) || typed >= example.text.length;

  useEffect(() => {
    if (reduceMotion) {
      const id = setTimeout(() => setIndex((i) => (i + 1) % examples.length), 4000);
      return () => clearTimeout(id);
    }
    if (typed < example.text.length) {
      const id = setTimeout(() => setTyped((t) => t + 1), 45);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setTyped(0);
      setIndex((i) => (i + 1) % examples.length);
    }, 2600);
    return () => clearTimeout(id);
  }, [typed, index, example.text.length, reduceMotion]);

  return {
    index,
    example,
    shown: reduceMotion ? example.text : example.text.slice(0, typed),
    done,
  };
}

function AnimatedMoney({ value, reduceMotion }: { value: number; reduceMotion: boolean | null }) {
  const spring = useSpring(value, { stiffness: 90, damping: 18 });
  const text = useTransform(spring, money);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  if (reduceMotion) return <span>{money(value)}</span>;
  return <motion.span>{text}</motion.span>;
}

const card =
  "rounded-3xl border border-zinc-200 bg-white/85 shadow-2xl shadow-zinc-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-black/50";

export default function TaskFlowPreview() {
  const reduceMotion = useReducedMotion();
  const { index, example, shown, done } = useTypedExample(reduceMotion);
  const isExpense = example.kind === "Expense";

  // Everything typed so far this cycle has "landed" in the cards below.
  const applied = examples.filter((_, i) => i < index || (i === index && done));
  const slots = [...baseSlots, ...applied.flatMap((e) => (e.slot ? [e.slot] : []))].sort(
    (a, b) => toMinutes(a.time) - toMinutes(b.time),
  );
  const planned = slots.reduce((sum, s) => sum + s.minutes, 0);
  const spent = applied.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  const left = DAILY_ALLOWANCE - spent;
  const newSlotTitle = done ? example.slot?.title : undefined;
  const newCharge = done && example.amount ? example : undefined;

  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[640px] lg:mx-0 lg:ml-auto">
      <motion.div
        animate={reduceMotion ? undefined : { opacity: [0.5, 0.85, 0.5], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-6 -z-10 rounded-full bg-red-600/25 blur-3xl"
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={card}
      >
        <div className="flex items-center gap-3 border-b border-zinc-200 px-5 py-4 dark:border-white/10 sm:px-6 sm:py-5">
          <kbd className="rounded-md border border-zinc-300 px-2 py-1 font-mono text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            Ctrl K
          </kbd>
          <p className="min-w-0 flex-1 truncate font-mono text-base text-zinc-900 dark:text-white sm:text-lg">
            {shown}
            {!done && (
              <span className="ml-px inline-block h-5 w-[2px] translate-y-1 animate-pulse bg-red-500" />
            )}
          </p>
          <motion.span
            key={`enter-${index}-${done}`}
            initial={done && !reduceMotion ? { scale: 0.7, color: "#ef4444" } : false}
            animate={{ scale: 1, color: "#a1a1aa" }}
            transition={{ duration: 0.4 }}
          >
            <CornerDownLeft className="size-5 shrink-0" />
          </motion.span>
        </div>

        <div className="min-h-[100px] px-5 py-4 sm:px-6 sm:py-5">
          <AnimatePresence mode="wait">
            {done && (
              <motion.div
                key={example.text}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {isExpense ? (
                    <Wallet className="size-4 text-red-500 dark:text-white" />
                  ) : (
                    <ListTodo className="size-4 text-red-500 dark:text-white" />
                  )}
                  Saved as {isExpense ? "an expense" : "a task"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {example.chips.map((chip, i) => (
                    <motion.span
                      key={chip}
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.8, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.08, type: "spring", stiffness: 400, damping: 22 }}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                        i === 0
                          ? "bg-red-600 dark:bg-white/50 text-white"
                          : "bg-zinc-100 text-zinc-800 dark:bg-white/10 dark:text-zinc-100"
                      }`}
                    >
                      {chip}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="mt-5 grid gap-5 sm:grid-cols-[1.3fr_1fr]">
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className={`${card} p-5`}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-white">
              <ListTodo className="size-5 text-white" />
              My Day
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-white/50">
              <motion.span
                animate={reduceMotion ? undefined : { rotate: [0, 15, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.5 }}
                className="inline-flex"
              >
              </motion.span>
              Auto-planned
            </span>
          </div>

          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {slots.map((slot) => {
                const isNew = slot.title === newSlotTitle;
                return (
                  <motion.li
                    key={slot.title}
                    layout={!reduceMotion}
                    initial={reduceMotion ? false : { opacity: 0, x: -20, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0, x: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-700 ${
                      isNew
                        ? "border border-red-500/60 bg-red-500/15"
                        : slot.high
                          ? "border border-red-500/25 bg-red-500/[0.07]"
                          : "border border-transparent bg-zinc-100/80 dark:bg-white/5"
                    }`}
                  >
                    <span className="w-11 font-mono text-xs text-zinc-500">{slot.time}</span>
                    <span
                      className={`size-2 shrink-0 rounded-full ${
                        slot.high ? "bg-red-500" : "bg-zinc-400 dark:bg-zinc-500"
                      }`}
                    />
                    <span className="min-w-0 flex-1 truncate text-zinc-800 dark:text-zinc-100">
                      {slot.title}
                    </span>
                    {isNew && (
                      <motion.span
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white"
                      >
                        New
                      </motion.span>
                    )}
                    <span className="text-xs text-zinc-500">{formatDuration(slot.minutes)}</span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <div className="mt-4">
            <div className="h-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
              <motion.div
                animate={{ width: `${Math.min(100, (planned / 240) * 100)}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="h-full rounded-full bg-white/50"
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">{formatDuration(planned)} planned of 4h</p>
          </div>
        </motion.div>

        <motion.div
          animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-800/50 bg-zinc-950/50 p-5 text-white shadow-2xl shadow-black/40 dark:border-white/10"
        >
          <AnimatePresence>
            {newCharge && !reduceMotion && (
              <motion.div
                key={`flash-${newCharge.text}`}
                initial={{ opacity: 0.35 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="pointer-events-none absolute inset-0 bg-red-600"
              />
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm text-zinc-400">
                <Wallet className="size-4 text-white" />
                Left to spend today
              </p>
              <AnimatePresence>
                {newCharge && (
                  <motion.span
                    key={newCharge.text}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                    className="font-mono text-xs font-semibold text-white"
                  >
                    −{money(newCharge.amount ?? 0)}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight sm:text-5xl">
              <AnimatedMoney value={left} reduceMotion={reduceMotion} />
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                animate={{ width: `${(spent / DAILY_ALLOWANCE) * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="h-full rounded-full bg-white"
              />
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              {money(spent)} spent of {money(DAILY_ALLOWANCE)} · on pace
            </p>
          </div>

          <p className="relative mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/50 px-3 py-1.5 text-xs font-semibold text-white">
            <motion.span
              animate={reduceMotion ? undefined : { scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }}
              className="inline-flex"
            >
              <Flame className="size-4" />
            </motion.span>
            4-day no-spend streak
          </p>
        </motion.div>
      </div>
    </div>
  );
}
