import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getMyDayCards } from "@/lib/action/myDay";
import MyDayDashboard from "@/components/myDayDashboard";
import { Spinner } from "@/components/ui/spinner";

async function MyDayContent() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const result = await getMyDayCards();
  if (result.error || !result.data || !result.plan) {
    throw new Error(result.error ?? "Could not load My Day");
  }

  return (
    <MyDayDashboard
      cards={result.data}
      plan={result.plan}
      taskBoards={result.taskBoards}
    />
  );
}

export default function MyDayPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-zinc-950">
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <Spinner className="size-8 text-primary" />
          </div>
        }
      >
        <MyDayContent />
      </Suspense>
    </main>
  );
}
