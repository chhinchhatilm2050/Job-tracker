import Link from "next/link";
import { Briefcase, CheckCircle2, Layers, TrendingUp } from "lucide-react";

export default async function Footer() {
  "use cache";

  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors">
      {/* 3 Main Feature Highlights */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="flex flex-col">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Briefcase className="h-6 w-6" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-zinc-100">
              Organize Applications
            </h2>
            <p className="text-muted-foreground dark:text-zinc-400 leading-relaxed text-sm">
              Create custom boards and columns to organize your job applications
              and track your job applications at every stage of the process.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-zinc-100">
              Track Progress
            </h2>
            <p className="text-muted-foreground dark:text-zinc-400 leading-relaxed text-sm">
              Monitor your job search progress and stay organized throughout the
              application process.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-zinc-100">
              Stay Organized
            </h2>
            <p className="text-muted-foreground dark:text-zinc-400 leading-relaxed text-sm">
              Never miss a deadline or forget an important detail with Chhat
              intuitive interface and helpful reminders.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground dark:text-zinc-400">
          <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-zinc-200">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <Layers className="size-3.5" />
            </div>
            <span>J◎B Tracker</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/about"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="/sign-in"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>

          <p>© {year} Job Tracker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

