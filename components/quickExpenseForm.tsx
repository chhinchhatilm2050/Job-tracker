"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { captureExpense } from "@/lib/action/money";
import { parseExpenseInput } from "@/lib/moneyFlowParser";
import {
  TRANSACTION_CATEGORIES,
  type TransactionCategory,
} from "@/lib/moneyFlowTypes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ComboboxSelect } from "./ui/combobox";

// Everything typed on this page is an expense, so add "spent" when it is
// missing. Without it the parser skips inputs like "book 15" that have no
// "$" and no known category keyword.
function asExpense(text: string) {
  return /\b(?:spent|spend|expense|paid)\b/i.test(text) ? text : `spent ${text}`;
}

export default function QuickExpenseForm({
  formatMoney,
}: {
  formatMoney: (amount: number) => string;
}) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("Other");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const preview = text.trim() ? parseExpenseInput(asExpense(text)) : null;
  const canSubmit = Boolean(preview && preview.amount !== null) && !isSaving;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setIsSaving(true);
    try {
      const result = await captureExpense(asExpense(text), category);
      if (result.error || !result.data) {
        toast.error(result.error ?? "Could not log this expense");
        return;
      }
      toast.success(
        `Logged ${formatMoney(result.data.amount)} for ${result.data.title}`,
      );
      setText("");
      setCategory("Other");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Add expense"
      className="rounded-2xl border bg-card p-4 shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={text}
          maxLength={300}
          onChange={(event) => {
            const next = event.target.value;
            setText(next);
            const parsed = next.trim() ? parseExpenseInput(asExpense(next)) : null;
            if (parsed) setCategory(parsed.category);
          }}
          placeholder="Add today's spending, e.g. lunch 12, grab $5 yesterday, netflix $15 monthly"
          aria-label="Describe an expense"
          className="h-10 flex-1"
        />
        <ComboboxSelect
          id="quick-expense-category"
          ariaLabel="Expense category"
          placeholder="Category"
          value={category}
          options={TRANSACTION_CATEGORIES.map((item) => ({
            value: item,
            label: item,
          }))}
          onValueChange={(value) => {
            const selected = TRANSACTION_CATEGORIES.find(
              (item) => item === value,
            );
            if (selected) setCategory(selected);
          }}
          className="sm:w-48"
          inputClassName="h-10"
        />
        <Button type="submit" disabled={!canSubmit} className="h-10">
          <Plus className="size-4" />
          {isSaving ? "Adding..." : "Add expense"}
        </Button>
      </div>

      {preview && (
        <p className="mt-2 text-xs text-muted-foreground">
          {preview.amount === null ? (
            <span className="text-destructive">Add an amount, such as 12 or $4.50</span>
          ) : (
            <>
              <span className="font-medium text-foreground">{preview.title}</span>{" "}
              · {formatMoney(preview.amount)} · {preview.date}
              {preview.frequency && ` · repeats ${preview.frequency}`}
            </>
          )}
        </p>
      )}
    </form>
  );
}
