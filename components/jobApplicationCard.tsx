"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BoardType, Column, JobApplication } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  Check,
  Clock3,
  Edit2,
  ExternalLink,
  GripVertical,
  ListChecks,
  MapPin,
  MoreVertical,
  Play,
  Repeat2,
  Trash2,
} from "lucide-react";
import { getTaskEffort } from "@/lib/dailyPlanning";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import EditJobApplicationDialog from "./editJobDialog";
import {
  deleteJobApplication,
  moveJobApplication,
  setCardCompletion,
} from "@/lib/action/jobApplication";

interface JobApplicationCardProps {
  job: JobApplication & { columnId?: string };
  columns: Column[];
  boardType: BoardType;
  onMove?: (jobId: string, targetColumnId: string) => void;
  onDelete?: (jobId: string) => void | Promise<void>;
  onStartFocus?: () => void;
}

export default function JobApplicationCard({
  job,
  columns,
  boardType,
  onMove,
  onDelete,
  onStartFocus,
}: JobApplicationCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [isUpdatingCompletion, setIsUpdatingCompletion] = useState(false);
  const router = useRouter();

  async function handleMove(targetColumnId: string) {
    if (isMoving) return;
    setIsMoving(true);
    try {
      if (onMove) {
        onMove(job._id, targetColumnId);
      } else {
        await moveJobApplication(job._id, targetColumnId);
      }
    } catch (err) {
      console.error("Failed to move job application:", err);
    } finally {
      setIsMoving(false);
    }
  }

  async function handleDelete() {
    if (isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      if (onDelete) {
        await onDelete(job._id);
      } else {
        const result = await deleteJobApplication(job._id);
        if (result.error) {
          setDeleteError(result.error);
          return;
        }
      }

      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete job application:", err);
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete job application",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleToggleCompletion(event: React.MouseEvent) {
    event.stopPropagation();
    if (isUpdatingCompletion) return;

    setIsUpdatingCompletion(true);
    setCompletionError(null);
    const isCompleting = !job.isCompleted;
    try {
      const result = await setCardCompletion(job._id, isCompleting);
      if (result.error) {
        setCompletionError(result.error);
        return;
      }
      toast.success(isCompleting ? "Task completed" : "Task reopened", {
        description: job.title || job.position,
      });
      router.refresh();
    } catch (err) {
      setCompletionError(
        err instanceof Error ? err.message : "Could not update task status",
      );
    } finally {
      setIsUpdatingCompletion(false);
    }
  }

  const otherColumns = columns.filter((c) => c._id !== job.columnId);
  const displayTitle = job.title || job.position;
  const company = job.jobDetails?.company || job.company;
  const salary = job.jobDetails?.salary || job.salary;
  const jobUrl = job.jobDetails?.jobUrl || job.jobUrl;
  const dueDate = job.dueDate ? new Date(job.dueDate) : null;
  const hasEstimate = boardType !== "job_tracker";
  const estimatedDuration = job.estimatedDurationMinutes ?? 30;
  const actualDuration = job.actualDurationMinutes ?? 0;
  const effort =
    boardType === "job_tracker"
      ? null
      : getTaskEffort({
          id: job._id,
          title: displayTitle,
          boardType,
          columnName:
            columns.find((column) => column._id === job.columnId)?.name ?? "",
          effort: job.effort,
          estimatedDurationMinutes: job.estimatedDurationMinutes,
        });
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    if (!hours) return `${remainder}m`;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  };

  return (
    <>
      <Card
        onClick={() => setIsEditDialogOpen(true)}
        className={`${
          boardType === "job_tracker" ? "min-h-[140px]" : "min-h-[170px]"
        } cursor-pointer border border-border/70 bg-card p-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md ${
          isDeleting || isMoving ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <CardContent className="flex flex-1 items-start gap-3 p-4">
          {boardType !== "job_tracker" && (
            <button
              type="button"
              aria-label={job.isCompleted ? "Mark card incomplete" : "Mark card complete"}
              disabled={isUpdatingCompletion}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={handleToggleCompletion}
              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                job.isCompleted
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-muted-foreground/50 text-transparent hover:border-primary"
              }`}
            >
              <Check className="size-3" />
            </button>
          )}
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="space-y-2">
              <div className="flex items-start gap-1.5">
                <div
                  aria-hidden="true"
                  className="mt-0.5 -ml-1 cursor-grab rounded p-0.5 text-muted-foreground/60 transition-colors hover:text-muted-foreground active:cursor-grabbing"
                  title="Drag to move"
                >
                  <GripVertical className="size-4 shrink-0" />
                </div>
                <h3 className="min-w-0 flex-1 text-sm font-semibold leading-tight text-foreground">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsEditDialogOpen(true);
                    }}
                    className="break-words text-left"
                  >
                    {displayTitle}
                  </button>
                </h3>
              </div>
              {boardType === "job_tracker" && company && (
                <p className="pl-5">
                  <span className="inline-flex max-w-full items-center truncate rounded-full border border-blue-500/15 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                    {company}
                  </span>
                </p>
              )}

              {boardType === "job_tracker" && (job.location || salary) && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-5 text-xs text-muted-foreground">
                  {job.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5 shrink-0" />
                      {job.location}
                    </span>
                  )}
                  {salary && (
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                      <Banknote className="size-3.5 shrink-0" />
                      {salary}
                    </span>
                  )}
                </div>
              )}

              {job.description && (
                <p className="ml-5 line-clamp-3 rounded-md bg-muted/40 px-2.5 py-2 text-xs leading-relaxed text-muted-foreground">
                  {job.description}
                </p>
              )}

              {(dueDate ||
                (job.subtasks?.length ?? 0) > 0 ||
                job.priority ||
                job.repeatDaily ||
                hasEstimate ||
                actualDuration > 0) && (
                <div className="flex flex-wrap items-center gap-1.5 pl-5">
                  {dueDate && !Number.isNaN(dueDate.getTime()) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                      <CalendarDays className="size-3" />
                      {dueDate.toLocaleDateString(undefined, { timeZone: "UTC" })}
                    </span>
                  )}
                  {(job.subtasks?.length ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                      <ListChecks className="size-3" />
                      {job.subtasks?.filter((subtask) => subtask.isCompleted).length}/
                      {job.subtasks?.length}
                    </span>
                  )}
                  {job.priority && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] capitalize text-muted-foreground">
                      {job.priority}
                    </span>
                  )}
                  {effort && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] capitalize ${
                        effort === "heavy"
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          : effort === "light"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {effort} effort
                    </span>
                  )}
                  {job.repeatDaily && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                      <Repeat2 className="size-3" />
                      {job.streakCount ?? 0} day streak
                    </span>
                  )}
                  {(hasEstimate || actualDuration > 0) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                      <Clock3 className="size-3" />
                      {hasEstimate
                        ? `Est ${formatDuration(estimatedDuration)} · Actual ${formatDuration(actualDuration)}`
                        : `Actual ${formatDuration(actualDuration)}`}
                    </span>
                  )}
                </div>
              )}

              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-5">
                  {job.tags.map((tag, key) => (
                    <span
                      key={key}
                      className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {boardType === "job_tracker" && jobUrl && (
                <div className="pl-5">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={jobUrl}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <span>View job posting</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div
            className="shrink-0"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-foreground cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md"
                  />
                }
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit2 className="size-4 mr-2" />
                    Edit Card
                  </DropdownMenuItem>

                  {onStartFocus && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={onStartFocus}
                    >
                      <Play className="size-4 mr-2" />
                      Start Focus
                    </DropdownMenuItem>
                  )}

                  {otherColumns.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      {otherColumns.map((col) => (
                        <DropdownMenuItem
                          key={col._id}
                          className="cursor-pointer"
                          onClick={() => handleMove(col._id)}
                        >
                          <ArrowRight className="size-4 mr-2 text-muted-foreground" />
                          Move to {col.name}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => {
                      setDeleteError(null);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete Card
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {completionError && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {completionError}
        </p>
      )}

      <EditJobApplicationDialog
        key={`${job._id}-${isEditDialogOpen ? "open" : "closed"}`}
        job={job}
        boardType={boardType}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setIsDeleteDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Delete Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &quot;
              {displayTitle}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="rounded-md bg-destructive/15 p-3 text-xs text-destructive">
              {deleteError}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
