"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Bell, Flame, Moon, Sun, Wallet, Zap } from "lucide-react";

type Step = { title: string; description: string; demo: ReactNode };
type Guide = { id: string; label: string; icon: typeof Sun; steps: Step[] };

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
      {children}
    </span>
  );
}

function QuickBar({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950">
      <kbd className="mr-2 rounded border border-zinc-300 px-1.5 py-0.5 font-mono text-[11px] text-zinc-500 dark:border-zinc-700">
        Ctrl K
      </kbd>
      <span className="text-zinc-900 dark:text-zinc-100">{text}</span>
    </div>
  );
}

const guides: Guide[] = [
  {
    id: "tasks",
    label: "Tasks",
    icon: Sun,
    steps: [
      {
        title: "Create a board",
        description:
          "Start from Job Hunt or Daily To-Do, or make a blank board with your own columns.",
        demo: (
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              ["Wish List", "Stripe"],
              ["Applied", "Google"],
              ["Interviewing", "Notion"],
            ].map(([column, card]) => (
              <div key={column} className="rounded-lg bg-zinc-200/70 p-2 dark:bg-zinc-800/70">
                <p className="mb-2 font-semibold text-zinc-700 dark:text-zinc-300">{column}</p>
                <div className="rounded-md bg-white p-2 shadow-sm dark:bg-zinc-950">{card}</div>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Capture with Ctrl+K",
        description:
          "Write a task the way you would say it. Task Flow picks out the date, priority, and time estimate, then files it on the right board.",
        demo: (
          <div className="space-y-3">
            <QuickBar text="Apply to Google frontend role tomorrow high priority 1h" />
            <div className="flex flex-wrap gap-2">
              <Chip>Tomorrow</Chip>
              <Chip>High priority</Chip>
              <Chip>1 hour</Chip>
              <Chip>Job Hunt · Google</Chip>
            </div>
          </div>
        ),
      },
      {
        title: "Auto-plan My Day",
        description:
          "My Day collects pinned cards and anything due today or overdue. Pick your energy and hours, then let Auto-Plan fill your timeline.",
        demo: (
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Zap className="size-3.5" aria-hidden="true" /> High energy · 4h available
            </p>
            {[
              ["9:00", "Interview prep", "1h"],
              ["10:00", "Apply to Google", "1h"],
              ["11:00", "Reply to recruiter", "15m"],
            ].map(([time, title, length]) => (
              <div
                key={time}
                className="flex items-center gap-3 rounded-md bg-white px-3 py-2 dark:bg-zinc-950"
              >
                <span className="w-11 font-mono text-xs text-zinc-500">{time}</span>
                <span className="flex-1">{title}</span>
                <span className="text-xs text-zinc-500">{length}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Focus and wrap up",
        description:
          "Start a focus timer on one task; the time you spend is saved to the card. At wrap-up, move unfinished tasks to tomorrow.",
        demo: (
          <div className="rounded-lg bg-zinc-950 p-5 text-center text-zinc-100">
            <p className="text-xs uppercase tracking-widest text-zinc-400">Focus</p>
            <p className="mt-1 font-mono text-4xl font-semibold">24:13</p>
            <p className="mt-2 text-sm">Apply to Google</p>
            <p className="mt-1 text-xs text-zinc-400">Estimated 1h · Actual 35m so far</p>
          </div>
        ),
      },
    ],
  },
  {
    id: "money",
    label: "Money Flow",
    icon: Wallet,
    steps: [
      {
        title: "Set your budget",
        description:
          "Enter your monthly income and savings goal. Fixed bills and what you've spent are subtracted, and the rest is split across the days left.",
        demo: (
          <div className="rounded-lg bg-white p-4 dark:bg-zinc-950">
            <p className="text-xs text-zinc-500">Safe to spend today</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">$38.00</p>
            <p className="mt-1 text-xs text-zinc-500">$494.00 left over 13 days</p>
          </div>
        ),
      },
      {
        title: "Log spending in one line",
        description:
          "Type an amount and a word or two. Start with $ or \"spent\" in Ctrl+K. Add \"monthly\" to make it a recurring bill.",
        demo: (
          <div className="space-y-3">
            <QuickBar text="netflix $15 monthly" />
            <div className="flex flex-wrap gap-2">
              <Chip>$15.00</Chip>
              <Chip>Subscriptions</Chip>
              <Chip>Repeats monthly</Chip>
            </div>
          </div>
        ),
      },
      {
        title: "Act on alerts",
        description:
          "Get a warning 3 days before a bill renews. From the 15th, see which categories grew most and cap them for next month.",
        demo: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2">
              <Bell className="size-4 shrink-0 text-amber-500" aria-hidden="true" />
              Netflix ($15.00) renews in 2 days.
            </div>
            <div className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2 dark:bg-zinc-950">
              <span>Food &amp; Dining +$84</span>
              <Chip>Cap at $220</Chip>
            </div>
          </div>
        ),
      },
      {
        title: "Wrap up the day",
        description:
          "At 6:00 PM, or with Wrap Up Day, see today's total and tomorrow's Safe-to-Spend. Spent nothing? Claim a no-spend day.",
        demo: (
          <div className="rounded-lg bg-white p-4 text-sm dark:bg-zinc-950">
            <p className="flex items-center gap-1.5 font-semibold">
              <Moon className="size-4" aria-hidden="true" /> Today: $0.00
            </p>
            <p className="mt-1 text-xs text-zinc-500">Tomorrow&apos;s Safe-to-Spend: $41.17</p>
            <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1 font-medium text-orange-600 dark:text-orange-400">
              <Flame className="size-4" aria-hidden="true" /> 4-day no-spend streak
            </p>
          </div>
        ),
      },
    ],
  },
];

export default function WorkflowGuide() {
  const [guideIndex, setGuideIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(1);
  const guide = guides[guideIndex];
  const step = guide.steps[stepIndex];

  function selectGuide(index: number) {
    setGuideIndex(index);
    setStepIndex(index === 0 ? 1 : 0);
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const next = (guideIndex + 1) % guides.length;
    selectGuide(next);
    document.getElementById(`guide-tab-${guides[next].id}`)?.focus();
  }

  return (
    <section
      id="product-features"
      aria-labelledby="workflow-guide-title"
      className="bg-white py-20 transition-colors dark:bg-zinc-950 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            How it works
          </p>
          <h2
            id="workflow-guide-title"
            className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl"
          >
            Type it once. Life Flow sorts it out.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Plan your work in My Day and keep your spending on track in Money
            Flow. Select a step to see it in action.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Guide topic"
          className="mx-auto mt-10 flex w-fit rounded-full bg-zinc-100 p-1 dark:bg-zinc-900"
        >
          {guides.map((item, index) => {
            const Icon = item.icon;
            const selected = index === guideIndex;
            return (
              <button
                key={item.id}
                id={`guide-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="guide-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => selectGuide(index)}
                onKeyDown={handleTabKey}
                className={`flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selected
                    ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          id="guide-panel"
          role="tabpanel"
          aria-labelledby={`guide-tab-${guide.id}`}
          className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_1.1fr]"
        >
          <ol className="space-y-2">
            {guide.steps.map((item, index) => {
              const active = index === stepIndex;
              return (
                <li key={item.title}>
                  <button
                    type="button"
                    aria-current={active ? "step" : undefined}
                    onClick={() => setStepIndex(index)}
                    className={`flex w-full gap-4 rounded-xl p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? "bg-zinc-100 dark:bg-zinc-900"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                        active
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                          : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span>
                      <span className="block font-semibold text-zinc-950 dark:text-zinc-50">
                        {item.title}
                      </span>
                      <span
                        className={`mt-1 block text-sm leading-6 text-zinc-600 dark:text-zinc-400 ${
                          active ? "" : "hidden sm:block"
                        }`}
                      >
                        {item.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <figure
            aria-live="polite"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/60 lg:sticky lg:top-24"
          >
            <div
              key={`${guide.id}-${stepIndex}`}
              className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
            >
              {step.demo}
            </div>
            <figcaption className="mt-4 text-xs text-zinc-500">
              Example: {step.title}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
