import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ImageTab from "@/components/imageTab";

export default function Home() {
  return (
    <div className="bg-white dark:bg-zinc-950 transition-colors">
      <section className="hero-video-simulation relative isolate overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-6xl">
              A better way to track your job applications.
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground dark:text-zinc-400 sm:text-xl">
              Capture, organize, and manage your job search in one place. With
              Chhat, you can easily track your applications, set reminders, and
              stay on top of your job search.
            </p>
            <div className="flex flex-col items-center gap-4">
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
        </div>
      </section>

      <ImageTab />
    </div>
  );
}
