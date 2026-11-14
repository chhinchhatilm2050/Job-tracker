"use client";

import { useState } from "react";
import { Column, JobApplication } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";
import { ArrowRight, Edit2, ExternalLink, GripVertical, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import EditJobApplicationDialog from "./editJobDialog";
import {
  deleteJobApplication,
  moveJobApplication,
} from "@/lib/action/jobApplication";

interface JobApplicationCardProps {
  job: JobApplication & { columnId?: string };
  columns: Column[];
  onMove?: (jobId: string, targetColumnId: string) => void;
  onDelete?: (jobId: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

export default function JobApplicationCard({
  job,
  columns,
  onMove,
  onDelete,
  dragHandleProps,
}: JobApplicationCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

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
    const confirmed = window.confirm(
      `Are you sure you want to delete "${job.position}" at ${job.company}?`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      if (onDelete) {
        onDelete(job._id);
      } else {
        await deleteJobApplication(job._id);
      }
    } catch (err) {
      console.error("Failed to delete job application:", err);
    } finally {
      setIsDeleting(false);
    }
  }

  const otherColumns = columns.filter((c) => c._id !== job.columnId);

  return (
    <>
      <Card
        className={`min-h-[170px] shadow-sm transition-all bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 ${
          isDeleting || isMoving ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <CardContent className="flex flex-1 items-start justify-between gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="space-y-1">
              <div className="flex items-start gap-1.5">
                <div
                  {...dragHandleProps}
                  className="mt-0.5 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing p-0.5 -ml-1 rounded transition-colors"
                  title="Drag to move"
                >
                  <GripVertical className="size-4 shrink-0" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 leading-tight">
                  {job.position}
                </h3>
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-zinc-400 pl-4">{job.company}</p>

              {job.location && (
                <p className="text-xs text-muted-foreground dark:text-zinc-400 pl-4">{job.location}</p>
              )}

              {job.salary && (
                <p className="text-xs font-medium text-green-700 dark:text-green-400 pl-4">
                  {job.salary}
                </p>
              )}

              {job.description && (
                <p className="text-xs text-muted-foreground dark:text-zinc-400 line-clamp-2 mt-1 pl-4">
                  {job.description}
                </p>
              )}

              {job.tags && job.tags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 pl-4">
                  {job.tags.map((tag, key) => (
                    <span
                      key={key}
                      className="rounded-full bg-slate-900 dark:bg-zinc-800 text-white dark:text-zinc-200 dark:border dark:border-zinc-700 px-2 py-0.5 text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {job.jobUrl && (
                <div className="pl-4">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={job.jobUrl}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <span>Link</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0" onPointerDown={(e) => e.stopPropagation()}>
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
                    Edit Job
                  </DropdownMenuItem>

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
                    onClick={handleDelete}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete Job
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <EditJobApplicationDialog
        job={job as JobApplication}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
