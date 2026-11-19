"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";
import { toast } from "sonner";
import { claimNoSpendDay } from "@/lib/action/money";
import type { MoneyDashboardData } from "@/lib/moneyFlowTypes";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface MoneyWrapUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: MoneyDashboardData;
  formatMoney: (amount: number) => string;
}

export default function MoneyWrapUpDialog({
  open,
  onOpenChange,
  data,
  formatMoney,
}: MoneyWrapUpDialogProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const router = useRouter();
  const { pulse, profile } = data;
  const isNoSpendDay = pulse.todayTotalSpend === 0;

  async function handleClaim() {
    setIsClaiming(true);
    try {
      const result = await claimNoSpendDay();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`No-spend streak: ${result.streak} day(s)`);
      router.refresh();
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Money wrap-up</DialogTitle>
          <DialogDescription>
            Today&apos;s spending and tomorrow&apos;s allowance.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2 text-center">
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-2xl font-semibold">
              {formatMoney(pulse.todayTotalSpend)}
            </p>
            <p className="text-xs text-muted-foreground">Spent today</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-2xl font-semibold">
              {formatMoney(pulse.tomorrowSafeToSpend)}
            </p>
            <p className="text-xs text-muted-foreground">
              Safe to spend tomorrow
            </p>
          </div>
        </div>

        {profile.noSpendStreak > 0 && (
          <p className="flex items-center justify-center gap-1 text-sm font-medium text-orange-500">
            <Flame className="size-4" />
            {profile.noSpendStreak}-day no-spend streak
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {isNoSpendDay && (
            <Button
              onClick={handleClaim}
              disabled={isClaiming || profile.claimedNoSpendToday}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {profile.claimedNoSpendToday
                ? "No-spend day claimed"
                : `Claim No-Spend Day`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
