import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Briefcase, CheckCircle2, Shield, Sparkles, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 transition-colors">
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-4">
              <Sparkles className="size-3.5" />
              About Chhat
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-5xl">
              Empowering your job hunt with simplicity and speed
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-zinc-400">
              Job searching is stressful and disorganized. Chhat was built to give job seekers a fast, intuitive Kanban tracker to capture applications, track interviews, manage offers, and land their dream role.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-8 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600 text-white mb-6">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Visual Kanban Pipeline</h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                Move applications through customizable stages from Wish List and Applied to Interviewing, Offer, and beyond with one click.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-8 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white mb-6">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Complete Application Notes</h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                Save salary estimates, interview notes, tech stack tags, job URLs, and recruiters all in one secure, accessible place.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-8 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Private & Secure</h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                Your data belongs to you. Built with modern session encryption and cloud MongoDB storage for reliability and privacy.
              </p>
            </div>
          </div>

          <div className="mt-16 rounded-2xl bg-slate-900 dark:bg-zinc-900 border dark:border-zinc-800 p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold">Ready to take control of your career?</h2>
            <p className="mt-3 text-slate-300 max-w-xl mx-auto text-sm md:text-base">
              Start tracking your applications today for free. No credit card required.
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

