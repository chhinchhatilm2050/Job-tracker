"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "lucide-react";
import { captureBrainDump } from "@/lib/action/myDay";
import { captureExpense } from "@/lib/action/money";
import { parseBrainDump } from "@/lib/brainDumpParser";
import { parseExpenseInput } from "@/lib/moneyFlowParser";
import {
  TRANSACTION_CATEGORIES,
  type TransactionCategory,
} from "@/lib/moneyFlowTypes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ComboboxSelect } from "./ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes
    ? `${hours}h ${remainingMinutes}m`
    : `${hours} ${hours === 1 ? "hour" : "hours"}`;
}

export default function BrainDumpDialog() {
  const [open, setOpen] = useState(false);
  const [thought, setThought] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [expenseCategory, setExpenseCategory] =
    useState<TransactionCategory>("Other");
  const router = useRouter();

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const expensePreview = thought.trim() ? parseExpenseInput(thought) : null;
  const preview =
    thought.trim() && !expensePreview ? parseBrainDump(thought) : null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      if (expensePreview) {
        if (expensePreview.amount === null) {
          setError("Add an amount, such as $12.50, before logging.");
          return;
        }

        const result = await captureExpense(thought, expenseCategory);
        if (result.error || !result.data) {
          setError(result.error ?? "Could not log this expense");
          return;
        }

        setSuccess(
          `Logged $${result.data.amount.toFixed(2)} for ${result.data.title}.`,
        );
        setThought("");
        setExpenseCategory("Other");
        router.refresh();
        return;
      }

      const result = await captureBrainDump(thought);
      if (result.error || !result.data) {
        setError(result.error ?? "Could not capture that thought");
        return;
      }
      setSuccess(`Added “${result.data.title}” to ${result.data.boardName}.`);
      setThought("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not capture that thought");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-label="Quick capture (Control or Command K)"
        onClick={() => setOpen(true)}
      >
        <Command className="size-4" />
        <span className="hidden sm:inline">Quick capture</span>
        <kbd className="hidden rounded border px-1 text-[10px] text-muted-foreground lg:inline">
          Ctrl / Cmd K
        </kbd>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setError("");
            setSuccess("");
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="size-5 text-primary" />
              Quick capture
            </DialogTitle>
            <DialogDescription>
              Enter a task or expense naturally. Use “$” or “spent” to log an
              expense.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              autoFocus
              maxLength={300}
              value={thought}
              onChange={(event) => {
                const nextThought = event.target.value;
                setThought(nextThought);
                setSuccess("");
                const nextExpense = parseExpenseInput(nextThought);
                if (nextExpense) {
                  setExpenseCategory(nextExpense.category);
                }
              }}
              placeholder="Apply to Google tomorrow high priority · Coffee $4.50 today"
              aria-label="Describe a task, job application, or expense"
              required
            />

            {expensePreview && (
              <div className="space-y-3 rounded-lg bg-muted/60 p-3 text-sm">
                <div>
                  <p className="font-medium">{expensePreview.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {expensePreview.amount === null
                      ? "Amount needed"
                      : `$${expensePreview.amount.toFixed(2)}`}{" "}
                    · {expensePreview.date}
                    {expensePreview.frequency &&
                      ` · Repeats ${expensePreview.frequency}`}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <label
                    htmlFor="brain-dump-expense-category"
                    className="font-medium"
                  >
                    Category
                  </label>
                  <ComboboxSelect
                    id="brain-dump-expense-category"
                    ariaLabel="Expense category"
                    placeholder="Category"
                    value={expenseCategory}
                    options={TRANSACTION_CATEGORIES.map((category) => ({
                      value: category,
                      label: category,
                    }))}
                    onValueChange={(value) => {
                      const category = TRANSACTION_CATEGORIES.find(
                        (candidate) => candidate === value,
                      );
                      if (category) setExpenseCategory(category);
                    }}
                    className="w-44"
                    inputClassName="h-8"
                  />
                </div>
                {!expensePreview.categoryMatched && (
                  <p className="text-xs text-muted-foreground">
                    Check the category before logging.
                  </p>
                )}
              </div>
            )}

            {preview && (
              <div className="rounded-lg bg-muted/60 p-3 text-sm">
                <p className="font-medium">
                  {preview.kind === "job" ? "Job application" : "Task"}:{" "}
                  {preview.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {preview.kind === "job" ? "Job Hunt" : "Daily Tasks"} ·{" "}
                  {preview.priority} priority
                  {preview.kind === "task" &&
                    ` · ${formatDuration(preview.estimatedDurationMinutes)}`}
                  {preview.dueDate ? ` · Due ${preview.dueDate}` : ""}
                </p>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            {success && (
              <p role="status" className="text-sm text-emerald-600">
                {success}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSaving}
              >
                Close
              </Button>
              <Button
                type="submit"
                disabled={
                  isSaving ||
                  !thought.trim() ||
                  Boolean(expensePreview && expensePreview.amount === null)
                }
              >
                {isSaving
                  ? expensePreview
                    ? "Logging..."
                    : "Adding..."
                  : expensePreview
                    ? "Log expense"
                    : "Add to my day"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
