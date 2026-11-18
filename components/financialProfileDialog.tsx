"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateFinancialProfile } from "@/lib/action/money";
import type { MoneyDashboardData } from "@/lib/moneyFlowTypes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface FinancialProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: MoneyDashboardData["profile"];
}

export default function FinancialProfileDialog({
  open,
  onOpenChange,
  profile,
}: FinancialProfileDialogProps) {
  const [income, setIncome] = useState(String(profile.monthlyIncome || ""));
  const [savings, setSavings] = useState(
    String(profile.monthlySavingsGoal || ""),
  );
  const [currency, setCurrency] = useState(profile.currencySymbol);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const result = await updateFinancialProfile({
        monthlyIncome: Number(income || 0),
        monthlySavingsGoal: Number(savings || 0),
        currencySymbol: currency,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Budget updated");
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Monthly budget</DialogTitle>
            <DialogDescription>
              Safe-to-Spend is income minus fixed bills, savings, and what you
              have already spent, split across the days left this month.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="monthly-income">Monthly income</Label>
            <Input
              id="monthly-income"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={income}
              onChange={(event) => setIncome(event.target.value)}
              placeholder="3000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="savings-goal">Monthly savings goal</Label>
            <Input
              id="savings-goal"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={savings}
              onChange={(event) => setSavings(event.target.value)}
              placeholder="500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency-symbol">Currency symbol</Label>
            <Input
              id="currency-symbol"
              maxLength={3}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="w-20"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
