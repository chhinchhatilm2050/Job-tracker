import {
  Clock3,
  Command,
  CheckCircle2,
  LayoutDashboard,
  ListChecks,
  Sun,
} from "lucide-react";

const steps = [
  {
    icon: LayoutDashboard,
    title: "Set up your boards",
    description:
      "Start with Job Hunt or Daily To-Do, or create a blank board with columns for your own workflow.",
  },
  {
    icon: ListChecks,
    title: "Add useful cards",
    description:
      "Add due dates, priorities, subtasks, and daily repeats. For tasks, set an estimate and choose Light, Moderate, or Heavy effort—or leave Auto-suggest on.",
  },
  {
    icon: Command,
    title: "Capture an idea quickly",
    description:
      "Choose Quick capture in the top bar or press Ctrl+K (Cmd+K on Mac). Write naturally; Task Flow can pick out a date, priority, and time estimate.",
  },
  {
    icon: Sun,
    title: "Build your My Day plan",
    description:
      "My Day gathers pinned cards and tasks due today or overdue. High energy prioritizes heavy work; low energy puts light tasks first and saves heavy tasks for later. Set your hours, then select Auto-Plan My Day.",
  },
  {
    icon: Clock3,
    title: "Focus on one task",
    description:
      "Focus sessions adapt to your energy: 45/10 for high, 25/5 for normal, and 15/5 for low. The last work block is shortened to fit the task's remaining estimate.",
  },
  {
    icon: CheckCircle2,
    title: "Review and carry forward",
    description:
      "Complete tasks as you go. At wrap-up, review your progress and move unfinished tasks to tomorrow; recurring tasks keep a daily streak.",
  },
];

export default function WorkflowGuide() {
  return (
    <section
      id="product-features"
      aria-labelledby="workflow-guide-title"
      className=" border-zinc-200/70 bg-white py-20 transition-colors dark:border-zinc-800 dark:bg-zinc-950 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            Get started with Task Flow
          </p>
          <h2
            id="workflow-guide-title"
            className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl"
          >
            From a quick idea to a clear plan for today.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Set up a workflow once, capture work as it comes to mind, and let
            My Day help you decide what to focus on next.
          </p>
        </div>

        <ol className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <li
                key={step.title}
                className="relative rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-zinc-400 dark:text-zinc-500">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="mx-auto mt-8 max-w-6xl rounded-2xl bg-zinc-100 px-5 py-4 text-sm leading-6 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 sm:px-6">
          <span className="font-semibold text-zinc-950 dark:text-zinc-50">
            Tip:
          </span>{" "}
          Use Boards to organize ongoing work. Use My Day to time-block
          priorities, start a focus session, and review your progress.
        </div>
      </div>
    </section>
  );
}
