"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { createTaskCard } from "@/lib/action/jobApplication";
import type { Priority, TaskEffort } from "@/lib/models/models.types";
import { ComboboxSelect } from "./ui/combobox";

type EffortSelection = TaskEffort | "auto";

interface CreateTaskDialogProps {
  columnId: string;
  boardId: string;
}

export default function CreateTaskDialog({
  columnId,
  boardId,
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [effort, setEffort] = useState<EffortSelection>("auto");
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(30);
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createTaskCard({
        title,
        dueDate: dueDate || undefined,
        priority,
        effort: effort === "auto" ? undefined : effort,
        estimatedDurationMinutes,
        repeatDaily,
        columnId,
        boardId,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setTitle("");
      setDueDate("");
      setPriority("medium");
      setEffort("auto");
      setEstimatedDurationMinutes(30);
      setRepeatDaily(false);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            className="mb-4 w-full cursor-pointer justify-start border-2 border-dashed text-muted-foreground dark:border-zinc-700 dark:hover:bg-zinc-800"
            variant="outline"
          />
        }
      >
        <Plus className="size-4" />
        Add task
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
          <DialogDescription>
            Add a task to this board column. Estimated time helps My Day build
            a schedule that fits your day. Effort helps match tasks to your
            energy.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div role="alert" className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="task-title">Task</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              autoFocus
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <ComboboxSelect
                id="task-priority"
                placeholder="Select priority"
                value={priority}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
                onValueChange={(value) => {
                  if (
                    value === "low" ||
                    value === "medium" ||
                    value === "high"
                  ) {
                    setPriority(value);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-duration">Estimated time</Label>
              <ComboboxSelect
                id="task-duration"
                placeholder="Select duration"
                value={String(estimatedDurationMinutes)}
                options={[
                  { value: "15", label: "15 minutes" },
                  { value: "30", label: "30 minutes" },
                  { value: "60", label: "1 hour" },
                  { value: "120", label: "2 hours" },
                ]}
                onValueChange={(value) => {
                  if (value) setEstimatedDurationMinutes(Number(value));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-effort">Effort</Label>
              <ComboboxSelect
                id="task-effort"
                placeholder="Select effort"
                value={effort}
                options={[
                  { value: "auto", label: "Auto-suggest" },
                  { value: "light", label: "Light" },
                  { value: "moderate", label: "Moderate" },
                  { value: "heavy", label: "Heavy" },
                ]}
                onValueChange={(value) => {
                  if (
                    value === "auto" ||
                    value === "light" ||
                    value === "moderate" ||
                    value === "heavy"
                  ) {
                    setEffort(value);
                  }
                }}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={repeatDaily}
              onChange={(event) => setRepeatDaily(event.target.checked)}
            />
            Repeat daily
          </label>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
