"use client";

import { useState } from "react";
import {
  CalendarDays,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { updateCardDetails } from "@/lib/action/jobApplication";
import type {
  BoardType,
  JobApplication,
  Priority,
  Subtask,
  TaskEffort,
} from "@/lib/models/models.types";
import { ComboboxSelect } from "./ui/combobox";

type EffortSelection = TaskEffort | "auto";

interface EditJobApplicationDialogProps {
  job: JobApplication;
  boardType: BoardType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toDateInput(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export default function EditJobApplicationDialog({
  job,
  boardType,
  open,
  onOpenChange,
}: EditJobApplicationDialogProps) {
  const isJobBoard = boardType === "job_tracker";
  const [title, setTitle] = useState(job.title || job.position || "");
  const [company, setCompany] = useState(
    job.jobDetails?.company ?? job.company ?? "",
  );
  const [salary, setSalary] = useState(
    job.jobDetails?.salary ?? job.salary ?? "",
  );
  const [jobUrl, setJobUrl] = useState(job.jobDetails?.jobUrl ?? job.jobUrl ?? "");
  const [location, setLocation] = useState(job.location || "");
  const [notes, setNotes] = useState(job.notes || "");
  const [description, setDescription] = useState(job.description || "");
  const [tags, setTags] = useState((job.tags || []).join(", "));
  const [dueDate, setDueDate] = useState(toDateInput(job.dueDate));
  const [priority, setPriority] = useState<Priority>(job.priority ?? "medium");
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(
    job.estimatedDurationMinutes ?? 30,
  );
  const [effort, setEffort] = useState<EffortSelection>(job.effort ?? "auto");
  const [isMyDay, setIsMyDay] = useState(job.isMyDay ?? false);
  const [repeatDaily, setRepeatDaily] = useState(job.repeatDaily ?? false);
  const [subtasks, setSubtasks] = useState<Subtask[]>(job.subtasks ?? []);
  const [newSubtask, setNewSubtask] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const durationOptions = [15, 30, 45, 60, 90, 120, 240].map((minutes) => ({
    value: String(minutes),
    label: minutes < 60 ? `${minutes} minutes` : `${minutes / 60} hours`,
  }));
  if (
    !durationOptions.some(
      (option) => Number(option.value) === estimatedDurationMinutes,
    )
  ) {
    durationOptions.push({
      value: String(estimatedDurationMinutes),
      label: `${estimatedDurationMinutes} minutes`,
    });
  }

  function addSubtask() {
    const subtaskTitle = newSubtask.trim();
    if (!subtaskTitle || subtasks.length >= 50) return;
    setSubtasks((current) => [
      ...current,
      { id: crypto.randomUUID(), title: subtaskTitle, isCompleted: false },
    ]);
    setNewSubtask("");
  }

  function updateSubtask(id: string, patch: Partial<Subtask>) {
    setSubtasks((current) =>
      current.map((subtask) =>
        subtask.id === id ? { ...subtask, ...patch } : subtask,
      ),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await updateCardDetails(job._id, {
        title,
        company,
        salary,
        jobUrl,
        location,
        notes,
        description,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        dueDate: dueDate || null,
        priority,
        ...(!isJobBoard && {
          estimatedDurationMinutes,
          effort: effort === "auto" ? null : effort,
        }),
        isMyDay,
        repeatDaily,
        subtasks,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this card");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Card details</DialogTitle>
          <DialogDescription>
            Update this card, its due date, priority, and subtasks.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div role="alert" className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor={`card-title-${job._id}`}>
              {isJobBoard ? "Position" : "Task"}
            </Label>
            <Input
              id={`card-title-${job._id}`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              required
            />
          </div>

          {isJobBoard && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`card-company-${job._id}`}>Company</Label>
                <Input
                  id={`card-company-${job._id}`}
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`card-salary-${job._id}`}>Salary</Label>
                <Input
                  id={`card-salary-${job._id}`}
                  value={salary}
                  onChange={(event) => setSalary(event.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`card-job-url-${job._id}`}>Job URL</Label>
                <Input
                  id={`card-job-url-${job._id}`}
                  type="url"
                  placeholder="https://..."
                  value={jobUrl}
                  onChange={(event) => setJobUrl(event.target.value)}
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`card-due-date-${job._id}`}>Due date</Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
                <Input
                  id={`card-due-date-${job._id}`}
                  className="pl-8"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`card-priority-${job._id}`}>Priority</Label>
              <ComboboxSelect
                id={`card-priority-${job._id}`}
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
            {!isJobBoard && (
              <div className="space-y-2">
                <Label htmlFor={`card-duration-${job._id}`}>
                  Estimated time
                </Label>
                <ComboboxSelect
                  id={`card-duration-${job._id}`}
                  placeholder="Select duration"
                  value={String(estimatedDurationMinutes)}
                  options={durationOptions}
                  onValueChange={(value) => {
                    if (value) setEstimatedDurationMinutes(Number(value));
                  }}
                />
              </div>
            )}
            {!isJobBoard && (
              <div className="space-y-2">
                <Label htmlFor={`card-effort-${job._id}`}>Effort</Label>
                <ComboboxSelect
                  id={`card-effort-${job._id}`}
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
            )}
          </div>

          <div className="space-y-3 rounded-lg border p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isMyDay}
                onChange={(event) => setIsMyDay(event.target.checked)}
              />
              Add to My Day
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={repeatDaily}
                onChange={(event) => setRepeatDaily(event.target.checked)}
              />
              Repeat daily
              {(job.streakCount ?? 0) > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {job.streakCount} day streak
                </span>
              )}
            </label>
          </div>

          <div className="space-y-2">
            <Label>Subtasks</Label>
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    aria-label={`Complete ${subtask.title}`}
                    checked={subtask.isCompleted}
                    onChange={(event) =>
                      updateSubtask(subtask.id, {
                        isCompleted: event.target.checked,
                      })
                    }
                  />
                  <Input
                    aria-label="Subtask title"
                    value={subtask.title}
                    onChange={(event) =>
                      updateSubtask(subtask.id, { title: event.target.value })
                    }
                    maxLength={200}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${subtask.title}`}
                    onClick={() =>
                      setSubtasks((current) =>
                        current.filter((item) => item.id !== subtask.id),
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                aria-label="New subtask"
                placeholder="Add a subtask"
                value={newSubtask}
                onChange={(event) => setNewSubtask(event.target.value)}
                maxLength={200}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSubtask();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSubtask}
                disabled={subtasks.length >= 50}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`card-description-${job._id}`}>Description</Label>
              <Textarea
                id={`card-description-${job._id}`}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            {isJobBoard && (
              <>
                <div className="space-y-2">
                  <Label htmlFor={`card-location-${job._id}`}>Location</Label>
                  <Input
                    id={`card-location-${job._id}`}
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`card-tags-${job._id}`}>Tags</Label>
                  <Input
                    id={`card-tags-${job._id}`}
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="React, Remote, Full-time"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`card-notes-${job._id}`}>Notes</Label>
                  <Textarea
                    id={`card-notes-${job._id}`}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
