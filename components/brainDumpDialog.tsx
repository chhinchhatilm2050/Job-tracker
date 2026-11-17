"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command, Plus } from "lucide-react";
import { captureBrainDump } from "@/lib/action/myDay";
import { parseBrainDump } from "@/lib/brainDumpParser";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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

  const preview = thought.trim() ? parseBrainDump(thought) : null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
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
          Ctrl K
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
              Brain dump
            </DialogTitle>
            <DialogDescription>
              Write a thought naturally. Task Flow will pick out dates and
              priority, then add it to the right board.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              autoFocus
              maxLength={300}
              value={thought}
              onChange={(event) => {
                setThought(event.target.value);
                setSuccess("");
              }}
              placeholder="Apply to Google frontend role tomorrow, high priority"
              aria-label="Describe a task or job application"
              required
            />

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
              <Button type="submit" disabled={isSaving || !thought.trim()}>
                {isSaving ? "Adding..." : "Add to my day"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
