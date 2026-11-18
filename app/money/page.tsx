import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { Spinner } from "@/components/ui/spinner";
import { getMoneyDashboard } from "@/lib/action/money";
import MoneyDashboard from "@/components/moneyDashboard";

async function MoneyContent() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const result = await getMoneyDashboard();
  if (result.error || !result.data) {
    throw new Error(result.error ?? "Could not load Money Flow");
  }

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-zinc-950">
      <MoneyDashboard data={result.data} />
    </main>
  );
}

export default function MoneyPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50/50 dark:bg-zinc-950">
          <Spinner className="size-8 text-primary" />
        </main>
      }
    >
      <MoneyContent />
    </Suspense>
  );
}
