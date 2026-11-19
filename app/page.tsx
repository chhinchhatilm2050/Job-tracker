import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Keyboard, Timer, Wallet } from "lucide-react";
import WorkflowGuide from "@/components/workflowGuide";
import { HeroBackground } from "@/components/heroBackground";
import TaskFlowPreview from "@/components/taskFlowPreview";

const highlights = [
  { icon: Keyboard, label: "One-line capture" },
  { icon: Timer, label: "Auto-planned day" },
  { icon: Wallet, label: "Daily safe-to-spend " },
];

export default function Home() {
  return (
    <div className="bg-white transition-colors dark:bg-zinc-950">
      <section className="relative isolate overflow-hidden border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-900 dark:bg-zinc-950">
        <HeroBackground />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 [&>*]:min-w-0">
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-zinc-950 dark:text-white sm:text-5xl lg:text-6xl">
              Type what&apos;s on your mind.{" "}
              <span className="text-red-600 dark:text-white/50">
                Get a plan for your day.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 lg:mx-0">
              Write tasks and expenses in one line, the way you&apos;d say them.
              Life Flow files each one, schedules your hours, and tells you
              how much you can spend today.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/sign-up"
                className={`${buttonVariants({ size: "lg" })} h-12 w-full bg-red-600 px-7 text-base text-white shadow-lg shadow-red-600/30 hover:bg-red-700 dark:bg-white/50 dark:text-white sm:w-auto`}
              >
                Start for free
                <ArrowRight className="ml-1 size-4" aria-hidden="true" />
              </Link>
              <Link
                href="#product-features"
                className={`${buttonVariants({ size: "lg", variant: "outline" })} h-12 w-full px-7 text-base sm:w-auto`}
              >
                See how it works
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              Free forever. No credit card required.
            </p>

            <ul className="mt-12 grid gap-3 text-left text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-3 sm:gap-4">
              {highlights.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-2">
                  <Icon className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-white/50" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <TaskFlowPreview />
        </div>
      </section>

      <WorkflowGuide />
    </div>
  );
}
