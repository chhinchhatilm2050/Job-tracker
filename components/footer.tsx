import Link from "next/link";
import { Briefcase, CheckCircle2, Layers, TrendingUp } from "lucide-react";

export default async function Footer() {
  "use cache";

  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border/70 bg-slate-50/70 transition-colors dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <section aria-labelledby="footer-features-title">
          <div className="mb-8 max-w-2xl">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-px w-6 bg-primary" />
              Made for your next move
            </p>
            <h2
              id="footer-features-title"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Your job search, all in one place.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="group flex flex-col justify-center items-center relative h-full overflow-hidden rounded-2xl border border-border/70 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md dark:bg-zinc-900 dark:hover:border-zinc-600 sm:p-7">
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                <Briefcase className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-lg font-semibold tracking-tight text-foreground">
                Organize applications
              </h3>
              <p className="text-sm text-center leading-6 text-muted-foreground">
                Create boards and stages that fit your search, then keep every
                application in one place.
              </p>
              <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:via-zinc-400/40" />
            </article>

            <article className="group flex flex-col justify-center items-center relative h-full overflow-hidden rounded-2xl border border-border/70 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md dark:bg-zinc-900 dark:hover:border-zinc-600 sm:p-7">
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                <TrendingUp className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-lg font-semibold tracking-tight text-foreground">
                Track your progress
              </h3>
              <p className="text-sm text-center leading-6 text-muted-foreground">
                See every application at a glance and know what needs your
                attention next.
              </p>
              <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:via-zinc-400/40" />
            </article>

            <article className="group flex flex-col justify-center items-center relative h-full overflow-hidden rounded-2xl border border-border/70 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md dark:bg-zinc-900 dark:hover:border-zinc-600 sm:p-7">
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                <CheckCircle2 className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-lg font-semibold tracking-tight text-foreground">
                Stay on top of details
              </h3>
              <p className="text-sm text-center leading-6 text-muted-foreground">
                Keep notes, deadlines, and follow-ups together so nothing
                important slips through.
              </p>
              <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:via-zinc-400/40" />
            </article>
          </div>
        </section>

        <div className="mt-10 flex flex-col items-center justify-between gap-6 border-t border-border/70 pt-7 text-sm sm:flex-row">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Layers className="size-4" aria-hidden="true" />
            </span>
            <span className="font-semibold tracking-tight">J◎B Tracker</span>
          </Link>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-muted-foreground"
          >
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/sign-in"
              className="transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
          </nav>

          <p className="text-center text-xs text-muted-foreground">
            © {year} Job Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

