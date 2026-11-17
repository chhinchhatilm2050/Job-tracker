"use client";

import { useState, useCallback, useRef } from "react";
import {
  Board,
  BoardType,
  Column,
  ColumnColor,
  JobApplication,
} from "@/lib/models/models.types";
import {
  Award,
  Calendar,
  CheckCircle2,
  Mic,
  MoreVertical,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  pointerWithin,
  closestCorners,
  CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import CreateJobApplicationDialog from "./createJobDialog";
import CreateTaskDialog from "./createTaskDialog";
import JobApplicationCard from "./jobApplicationCard";
import AddColumnDialog from "./addColumnDialog";
import {
  deleteColumn,
  deleteJobApplication,
  moveJobApplication,
} from "@/lib/action/jobApplication";

interface KanbanBoardProps {
  board: Board;
  userId: string | undefined;
}

interface ColConfig {
  color: ColumnColor;
  icon: React.ReactNode;
}

const COLUMN_CONFIG: ColConfig[] = [
  { color: "cyan", icon: <Calendar className="h-4 w-4" /> },
  { color: "violet", icon: <CheckCircle2 className="h-4 w-4" /> },
  { color: "emerald", icon: <Mic className="h-4 w-4" /> },
  { color: "amber", icon: <Award className="h-4 w-4" /> },
  { color: "rose", icon: <XCircle className="h-4 w-4" /> },
];

const COLUMN_COLOR_CLASSES: Record<ColumnColor, string> = {
  cyan: "bg-cyan-500/10 text-cyan-800 dark:bg-cyan-400/10 dark:text-cyan-200",
  violet: "bg-violet-500/10 text-violet-800 dark:bg-violet-400/10 dark:text-violet-200",
  emerald: "bg-emerald-500/10 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200",
  amber: "bg-amber-500/10 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200",
  rose: "bg-rose-500/10 text-rose-800 dark:bg-rose-400/10 dark:text-rose-200",
  blue: "bg-blue-500/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200",
  slate: "bg-slate-500/10 text-slate-800 dark:bg-slate-400/10 dark:text-slate-200",
};

// Custom collision detection: prefer pointerWithin for precision, fallback to closestCorners
const customCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  return closestCorners(args);
};

// ─── Draggable job card wrapper ───────────────────────────────────────────────
function DraggableJobCard({
  job,
  columns,
  boardType,
  onMove,
  onDelete,
}: {
  job: JobApplication & { columnId: string };
  columns: Column[];
  boardType: BoardType;
  onMove: (jobId: string, targetColumnId: string) => void;
  onDelete: (jobId: string) => void | Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: job._id,
    data: {
      type: "Job",
      job,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
  };

  const setDraggableNodeRef = useCallback(
    (node: HTMLElement | null) => {
      setNodeRef(node);
      setActivatorNodeRef(node);
    },
    [setNodeRef, setActivatorNodeRef],
  );

  return (
    <div
      ref={setDraggableNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-manipulation select-none cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? "ring-2 ring-primary/40 rounded-xl" : ""
      }`}
    >
      <JobApplicationCard
        job={job}
        columns={columns}
        boardType={boardType}
        onMove={onMove}
        onDelete={onDelete}
      />
    </div>
  );
}

// ─── Single column with useDroppable ─────────────────────────────────────────
function DroppableColumn({
  column,
  config,
  boardId,
  boardType,
  fitDesktopGrid,
  sortedColumns,
  isOver,
  onMoveJob,
  onDeleteJob,
}: {
  column: Column & {
    jobApplications: (JobApplication & { columnId: string })[];
  };
  config: ColConfig;
  boardId: string;
  boardType: BoardType;
  fitDesktopGrid: boolean;
  sortedColumns: Column[];
  isOver: boolean;
  onMoveJob: (jobId: string, targetColumnId: string) => void;
  onDeleteJob: (jobId: string) => void | Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Register the entire column as a drop target using a native div ref
  const { setNodeRef } = useDroppable({
    id: column._id,
    data: {
      type: "Column",
      column,
    },
  });

  const sortedJobs = column.jobApplications || [];

  async function handleDeleteColumn() {
    if (isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteColumn(column._id, boardId);
      if (result.error) {
        setDeleteError(result.error);
        return;
      }

      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete column:", err);
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete column",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`h-[min(70vh,720px)] min-h-[460px] w-full shrink-0 xl:w-[min(86vw,320px)] ${
        fitDesktopGrid ? "xl:w-auto xl:min-w-0" : ""
      }`}
    >
      <Card
        className={`h-full w-full border p-0 flex flex-col rounded-2xl overflow-hidden shadow-sm transition-all duration-150 ${
          isDeleting ? "opacity-50 pointer-events-none" : ""
        } ${
          isOver
            ? "border-primary ring-2 ring-primary/30 bg-primary/5"
            : "border-border/80 bg-card"
        }`}
      >
        <CardHeader
          className={`${COLUMN_COLOR_CLASSES[config.color]} flex flex-row items-center justify-between gap-2 border-b border-border/70 px-4 py-3 shrink-0`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background/70">
              {config.icon}
            </span>
            <CardTitle className="truncate text-sm font-semibold tracking-wide">
              {column.name}
            </CardTitle>
            <span className="shrink-0 rounded-full bg-background/70 px-2 py-0.5 text-xs font-semibold text-foreground">
              {sortedJobs.length}
            </span>
          </div>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger
                render={
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Open ${column.name} column actions`}
                        className="h-8 w-8 shrink-0 text-current cursor-pointer hover:bg-background/70 rounded-lg"
                      />
                    }
                  />
                }
              >
                <MoreVertical className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Column actions</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Column
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 min-h-0 space-y-3 p-3 overflow-hidden">
          <div className="shrink-0">
            {boardType === "job_tracker" ? (
              <CreateJobApplicationDialog
                columnId={column._id}
                boardId={boardId}
              />
            ) : (
              <CreateTaskDialog columnId={column._id} boardId={boardId} />
            )}
          </div>

          <SortableContext
            items={sortedJobs.map((j) => j._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="no-scrollbar flex min-h-[100px] flex-1 flex-col space-y-3 overflow-y-auto pb-1">
              {sortedJobs.map((job) => (
                <DraggableJobCard
                  key={job._id}
                  job={{ ...job, columnId: job.columnId || column._id }}
                  columns={sortedColumns}
                  boardType={boardType}
                  onMove={onMoveJob}
                  onDelete={onDeleteJob}
                />
              ))}

              {sortedJobs.length === 0 && (
                <div
                  className={`flex min-h-[180px] flex-1 flex-col items-center justify-center rounded-xl border border-dashed px-5 py-8 text-center transition-colors ${
                    isOver
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border/80 bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {isOver ? (
                    <p className="text-sm font-medium">Release to add here</p>
                  ) : (
                    <>
                      <span className="mb-3 flex size-9 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
                        <CheckCircle2 className="size-4" />
                      </span>
                      <p className="text-sm font-medium text-foreground">
                        This stage is clear
                      </p>
                      <p className="mt-1 max-w-[190px] text-xs leading-5">
                        Add a card above or move one here when it is ready.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </SortableContext>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setDeleteDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Delete Column</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &quot;
              <span className="font-semibold text-black dark:text-white">
                {column.name}
              </span>
              &quot; and all cards in it? This action cannot be undone.
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
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteColumn}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Column"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Helper to find column containing a job ID or matching column ID ─────────
function findColumn(
  id: string | null | undefined,
  cols: Array<
    Column & { jobApplications: (JobApplication & { columnId: string })[] }
  >,
) {
  if (!id) return null;
  const targetId = String(id);
  // 1. Direct match on column id
  const byColId = cols.find((c) => String(c._id) === targetId);
  if (byColId) return byColId;
  // 2. Match on job id inside a column
  const byJobId = cols.find((c) =>
    c.jobApplications.some((j) => String(j._id) === targetId),
  );
  return byJobId || null;
}

// ─── Board root with DnD context ──────────────────────────────────────────────
export function KanbanBoard({ board, userId }: KanbanBoardProps) {
  const parseColumns = useCallback((b: Board | null | undefined) => {
    if (!b?.columns) return [];
    return [...b.columns]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((col) => ({
        ...col,
        jobApplications: [...(col.jobApplications || [])]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((j) => ({
            ...j,
            columnId: j.columnId || col._id,
          })),
      }));
  }, []);

  const [columns, setColumns] = useState(() => parseColumns(board));
  const [previousBoard, setPreviousBoard] = useState(board);
  const [activeJob, setActiveJob] = useState<
    (JobApplication & { columnId: string }) | null
  >(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  // Track initial state and source column to detect moves and handle cancels
  const sourceColumnIdRef = useRef<string | null>(null);
  const initialColumnsRef = useRef<typeof columns | null>(null);

  if (board !== previousBoard) {
    setPreviousBoard(board);
    setColumns(parseColumns(board));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement starts drag, single clicks pass through to buttons/menus
      },
    }),
  );

  // Optimistic Move Handler (used by dropdown "Move to...")
  const handleMoveJob = useCallback(
    async (jobId: string, targetColumnId: string) => {
      const sourceCol = findColumn(jobId, columns);
      if (!sourceCol || sourceCol._id === targetColumnId) return;

      setColumns((prev) => {
        const next = prev.map((col) => ({
          ...col,
          jobApplications: [...col.jobApplications],
        }));

        const src = next.find((c) => c._id === sourceCol._id);
        const dst = next.find((c) => c._id === targetColumnId);
        if (!src || !dst) return prev;

        const idx = src.jobApplications.findIndex(
          (j) => String(j._id) === String(jobId),
        );
        if (idx === -1) return prev;

        const [moved] = src.jobApplications.splice(idx, 1);
        dst.jobApplications.push({
          ...moved,
          columnId: targetColumnId,
        });

        return next;
      });

      try {
        await moveJobApplication(jobId, targetColumnId);
      } catch (err) {
        console.error("Failed to move job application:", err);
      }
    },
    [columns],
  );

  // Optimistic Delete Handler
  const handleDeleteJob = useCallback(async (jobId: string) => {
    const result = await deleteJobApplication(jobId);
    if (result.error) {
      throw new Error(result.error);
    }

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        jobApplications: col.jobApplications.filter(
          (job) => String(job._id) !== String(jobId),
        ),
      })),
    );
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id);
    const col = findColumn(activeId, columns);
    if (col) {
      sourceColumnIdRef.current = col._id;
      initialColumnsRef.current = columns.map((c) => ({
        ...c,
        jobApplications: [...c.jobApplications],
      }));
      const job = col.jobApplications.find((j) => String(j._id) === activeId);
      setActiveJob(job ? { ...job, columnId: col._id } : null);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) {
      setOverColumnId(null);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumn = findColumn(activeId, columns);
    const overColumn = findColumn(overId, columns);

    if (!activeColumn || !overColumn) {
      setOverColumnId(null);
      return;
    }

    setOverColumnId(overColumn._id);

    // If dragging across columns, move the card into the destination column in real-time
    if (activeColumn._id !== overColumn._id) {
      setColumns((prev) => {
        const next = prev.map((col) => ({
          ...col,
          jobApplications: [...col.jobApplications],
        }));

        const src = next.find((c) => c._id === activeColumn._id);
        const dst = next.find((c) => c._id === overColumn._id);
        if (!src || !dst) return prev;

        const activeIdx = src.jobApplications.findIndex(
          (j) => String(j._id) === activeId,
        );
        if (activeIdx === -1) return prev;

        const [movedJob] = src.jobApplications.splice(activeIdx, 1);

        // Position where dropped over
        const overIdx = dst.jobApplications.findIndex(
          (j) => String(j._id) === overId,
        );
        const insertAt = overIdx !== -1 ? overIdx : dst.jobApplications.length;

        dst.jobApplications.splice(insertAt, 0, {
          ...movedJob,
          columnId: overColumn._id,
        });

        return next;
      });
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveJob(null);
    setOverColumnId(null);

    const activeId = String(active.id);
    const originalColId = sourceColumnIdRef.current;

    if (!over) {
      if (initialColumnsRef.current) {
        setColumns(initialColumnsRef.current);
      }
      sourceColumnIdRef.current = null;
      initialColumnsRef.current = null;
      return;
    }

    const overId = String(over.id);
    const currentColumn = findColumn(activeId, columns);

    if (!currentColumn) {
      sourceColumnIdRef.current = null;
      initialColumnsRef.current = null;
      return;
    }

    // Same-column sorting
    if (activeId !== overId) {
      const activeIdx = currentColumn.jobApplications.findIndex(
        (j) => String(j._id) === activeId,
      );
      const overIdx = currentColumn.jobApplications.findIndex(
        (j) => String(j._id) === overId,
      );
      if (activeIdx !== -1 && overIdx !== -1 && activeIdx !== overIdx) {
        setColumns((prev) =>
          prev.map((col) => {
            if (col._id !== currentColumn._id) return col;
            return {
              ...col,
              jobApplications: arrayMove(
                col.jobApplications,
                activeIdx,
                overIdx,
              ),
            };
          }),
        );
      }
    }

    // Cross-column move persistence: check if column actually changed
    const finalColId = currentColumn._id;
    if (originalColId && originalColId !== finalColId) {
      try {
        const res = await moveJobApplication(activeId, finalColId);
        if (res?.error) {
          console.error("Server move failed:", res.error);
          if (initialColumnsRef.current) {
            setColumns(initialColumnsRef.current);
          }
        }
      } catch (err) {
        console.error("Move error:", err);
        if (initialColumnsRef.current) {
          setColumns(initialColumnsRef.current);
        }
      }
    }

    sourceColumnIdRef.current = null;
    initialColumnsRef.current = null;
  }

  function handleDragCancel() {
    setActiveJob(null);
    setOverColumnId(null);
    if (initialColumnsRef.current) {
      setColumns(initialColumnsRef.current);
    }
    sourceColumnIdRef.current = null;
    initialColumnsRef.current = null;
  }

  if (!board || !board.columns || board.columns.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-3 flex justify-end">
          <AddColumnDialog boardId={board._id} />
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
            No columns yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Add a column to start organizing cards on this board.
          </p>
        </div>
      </div>
    );
  }

  const fitDesktopGrid = columns.length > 1 && columns.length <= 4;
  const desktopGridClass = fitDesktopGrid
    ? {
        2: "xl:grid xl:grid-cols-2 xl:overflow-x-visible",
        3: "xl:grid xl:grid-cols-3 xl:overflow-x-visible",
        4: "xl:grid xl:grid-cols-4 xl:overflow-x-visible",
      }[columns.length]
    : "";

  return (
    <DndContext
      id={`job-board-${board._id}`}
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="w-full">
        <div className="mb-3 flex justify-end">
          <AddColumnDialog
            boardId={board._id}
            disabled={columns.length >= 12}
          />
        </div>
        <div
          aria-label="Board columns"
          className={`flex flex-col items-stretch gap-4 overflow-x-hidden pb-5 pt-2 no-scrollbar xl:flex-row xl:items-start xl:overflow-x-auto xl:overscroll-x-contain ${desktopGridClass}`}
        >
          {columns.map((col, key) => {
            const fallbackConfig = COLUMN_CONFIG[key % COLUMN_CONFIG.length];
            const config: ColConfig = {
              ...fallbackConfig,
              color: col.color ?? fallbackConfig.color,
            };
            return (
              <DroppableColumn
                key={col._id}
                column={col}
                config={config}
                boardId={board._id}
                boardType={board.boardType ?? "job_tracker"}
                fitDesktopGrid={fitDesktopGrid}
                sortedColumns={columns}
                isOver={overColumnId === col._id}
                onMoveJob={handleMoveJob}
                onDeleteJob={handleDeleteJob}
              />
            );
          })}
        </div>
      </div>

      {/* Floating card preview while dragging */}
      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeJob ? (
          <div className="w-80 pointer-events-none rotate-2 scale-105 shadow-2xl opacity-95">
            <JobApplicationCard
              job={activeJob}
              columns={columns}
              boardType={board.boardType ?? "job_tracker"}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
