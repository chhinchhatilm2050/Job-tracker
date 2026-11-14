import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ImageTab from "@/components/imageTab";

export default function Home() {
  return (
    <div className="bg-white dark:bg-zinc-950 transition-colors">
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight text-5xl sm:text-6xl mb-6">
            A better way to track your job applications.
          </h1>
          <p className="text-muted-foreground dark:text-zinc-400 mb-10 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Capture, organize, and manage your job search in one place. 
            With Chhat, you can easily track your applications, set reminders, and stay on top of your job search.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link 
              href="/sign-up" 
              className={`${buttonVariants({ size: "lg" })} h-12 px-8 text-lg font-medium cursor-pointer shadow-sm`}
            >
              Start for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <p className="text-sm text-muted-foreground dark:text-zinc-400">Free forever. No credit card required.</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pb-20">
        <ImageTab />
      </div>
    </div>
  );
}
