import Link from "next/link"; // Fixed: Import Next.js Link correctly
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Briefcase, CheckCircle2, TrendingUp } from "lucide-react"; // Removed Link icon import to avoid confusion
import ImageTab from "@/components/imageTab";

export default function Home() {

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="container mx-auto px-4 py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-bold text-black mb-6 text-6xl">
              A better way to track your job applications.
            </h1>
            <p className="text-muted-foreground mb-10 text-lg">
              Capture, organize, and manage your job search in one place. 
              With Chhat, you can easily track your applications, set reminders, and stay on top of your job search.
            </p>
            <div className="flex flex-col items-center gap-4">
              <Link 
                href="/sign-up" 
                className={`${buttonVariants({ size: "lg" })} h-12 px-8 text-lg font-medium cursor-pointer`}
              >
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <p className="text-sm text-muted-foreground">Free forever. No credit card required.</p>
            </div>
          </div>
        </section>
        <ImageTab />
        <section className="border-t bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="flex flex-col">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <h2 className="mb-4 text-2xl font-semibold text-black">Organize Applications</h2>
                <p className="text-muted-foreground">
                  Create custom boards and columns to organize your job applications and track your job applications at every stage of the process.
                </p>
              </div>
              <div className="flex flex-col">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h2 className="mb-4 text-2xl font-semibold text-black">Track Progress</h2>
                <p className="text-muted-foreground">
                  Monitor your job search progress and stay organized throughout the application process.
                </p>
              </div>
              <div className="flex flex-col">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <h2 className="mb-4 text-2xl font-semibold text-black">Stay Organized</h2>
                <p className="text-muted-foreground">
                  Never miss a deadline or forget an important detail with Chhat intuitive interface and helpful reminders.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}