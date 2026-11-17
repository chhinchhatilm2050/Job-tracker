import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import WorkflowGuide from "@/components/workflowGuide";
import { HeroBackground } from "@/components/heroBackground";
import TaskFlowPreview from "@/components/taskFlowPreview";

export default function Home() {
  return (
    <div className="bg-white dark:bg-zinc-950 transition-colors">
      <section className="hero-video-simulation relative isolate overflow-hidden  bg-zinc-50/80 dark:bg-zinc-950">
        {/* Animated Background */}
        <HeroBackground />

        <div className="relative z-10 mx-auto grid min-h-[90vh] max-w-7xl grid-cols-1 items-center gap-8 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-5xl lg:text-6xl">
              Track your next move. Plan your day with clarity.
            </h1>
            <p className="mx-auto mb-10 max-w-2xl font-semibold text-lg leading-relaxed text-muted-foreground dark:text-zinc-400 sm:text-xl lg:mx-0">
              Keep job applications, project work, and everyday tasks in one
              place and build a focused plan for what matters today.
            </p>
            <div className="flex flex-col items-center gap-4 lg:items-start">
              <Link
                href="/sign-up"
                className={`${buttonVariants({ size: "lg" })} h-12 cursor-pointer px-8 text-lg font-medium shadow-sm`}
              >
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <p className="text-sm text-muted-foreground dark:text-zinc-400">
                Free forever. No credit card required.
              </p>
            </div>
          </div>
          <TaskFlowPreview />
        </div>
      </section>

      <WorkflowGuide />
    </div>
  );
}