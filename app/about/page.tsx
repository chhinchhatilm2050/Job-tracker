import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Command,
  Layers,
  Sun,
} from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Boards for the way you work",
    description:
      "Organize job searches, projects, daily tasks, and habits with ready-made templates or your own columns.",
  },
  {
    icon: CheckCircle2,
    title: "Cards with the right details",
    description:
      "Keep due dates, priorities, subtasks, time estimates, and job information together. Pin any card to My Day.",
  },
  {
    icon: Command,
    title: "Quick capture and smart planning",
    description:
      "Capture a thought with Ctrl+K or Cmd+K, then plan your day around available hours, energy, and priorities.",
  },
  {
    icon: Clock3,
    title: "Focus and daily review",
    description:
      "Use Pomodoro focus sessions to track time, then review what you finished and reschedule unfinished work.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 transition-colors">
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-5xl">
              Make space for what matters
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-zinc-400">
              Task Flow brings your tasks, habits, projects, and job search into one workspace. Capture work quickly, plan a realistic day, and focus on one next step at a time.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-2xl flex justify-center items-center flex-col border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-200 text-black dark:bg-zinc-800 dark:text-zinc-100">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                    {feature.title}
                  </h2>
                  <p className="mt-3 text-center text-sm leading-relaxed text-gray-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>

          <section
            aria-labelledby="how-to-use-heading"
            className="mt-16 rounded-2xl border border-gray-200 bg-slate-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/60 md:p-12"
          >
            <div className="mx-auto max-w-2xl text-center">
              <Sun className="mx-auto size-7 text-primary" aria-hidden="true" />
              <h2
                id="how-to-use-heading"
                className="mt-4 text-2xl font-bold text-gray-900 dark:text-zinc-100 md:text-3xl"
              >
                How to use Task Flow
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-zinc-400">
                You can start with one board and add more workflows whenever
                your needs change.
              </p>
            </div>
            <ol className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2">
              <li className="rounded-xl bg-white p-5 dark:bg-zinc-950">
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100">
                  1. Choose a board
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-zinc-400">
                  Open Boards and create a Job Hunt, Daily To-Do, or blank
                  board.
                </p>
              </li>
              <li className="rounded-xl bg-white p-5 dark:bg-zinc-950">
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100">
                  2. Add cards
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-zinc-400">
                  Add a task or application. Open its card to set a due date,
                  priority, subtasks, and estimated time.
                </p>
              </li>
              <li className="rounded-xl bg-white p-5 dark:bg-zinc-950">
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100">
                  3. Capture and plan
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-zinc-400">
                  Use Quick capture or Ctrl/Cmd+K for a natural-language task.
                  In My Day, choose your start time, energy, and available
                  hours, then auto-plan.
                </p>
              </li>
              <li className="rounded-xl bg-white p-5 dark:bg-zinc-950">
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100">
                  4. Focus and review
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-zinc-400">
                  Start a focus timer from a planned task. Complete cards as
                  you go, then use the daily wrap-up to review or reschedule.
                </p>
              </li>
            </ol>
          </section>

          <div className="mt-12 rounded-2xl border border-zinc-800 bg-black/80 p-8 text-center text-white dark:bg-zinc-900 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold">Ready to move your plans forward?</h2>
            <p className="mt-3 text-slate-300 max-w-xl mx-auto text-sm md:text-base">
              Create a board, capture your work, and let My Day guide your next step.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/dashboard"
                className={`${buttonVariants({ size: "lg" })} bg-white text-slate-900 hover:bg-slate-100 font-semibold cursor-pointer`}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

