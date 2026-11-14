"use client";

import { useState, useCallback, useRef } from "react";
import { Board, Column, JobApplication } from "@/lib/models/models.types";
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
import CreateJobApplicationDialog from "./createJobDialog";
import JobApplicationCard from "./jobApplicationCard";
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
  color: string;
  icon: React.ReactNode;
}

const COLUMN_CONFIG: Array<{ color: string; icon: React.ReactNode }> = [
  { color: "bg-cyan-600", icon: <Calendar className="h-4 w-4" /> },
  { color: "bg-purple-600", icon: <CheckCircle2 className="h-4 w-4" /> },
  { color: "bg-emerald-600", icon: <Mic className="h-4 w-4" /> },
  { color: "bg-amber-600", icon: <Award className="h-4 w-4" /> },
  { color: "bg-rose-600", icon: <XCircle className="h-4 w-4" /> },
];

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
  onMove,
  onDelete,
}: {
  job: JobApplication & { columnId: string };
  columns: Column[];
  onMove: (jobId: string, targetColumnId: string) => void;
  onDelete: (jobId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
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

  return (
    <div
      ref={setNodeRef}
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
        onMove={onMove}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// ─── Single column with useDroppable ─────────────────────────────────────────
function DroppableColumn({
  column,
  config,
  boardId,
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
  sortedColumns: Column[];
  isOver: boolean;
  onMoveJob: (jobId: string, targetColumnId: string) => void;
  onDeleteJob: (jobId: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

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
    const confirmed = window.confirm(
      `Are you sure you want to delete column "${column.name}" and all its job applications?`,
    );
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await deleteColumn(column._id, boardId);
    } catch (err) {
      console.error("Failed to delete column:", err);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div ref={setNodeRef} className="shrink-0 h-[100vh]">
      <Card
        className={`w-80 h-full p-0 flex flex-col rounded-xl overflow-hidden shadow-sm border transition-all duration-150 ${
          isDeleting ? "opacity-50 pointer-events-none" : ""
        } ${
          isOver
            ? "border-primary ring-2 ring-primary/30 bg-primary/5 dark:bg-primary/10"
            : "border-gray-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60"
        }`}
      >
        <CardHeader
          className={`${config.color} text-white flex flex-row items-center justify-between px-4 py-3 border-b border-black/10 shrink-0`}
        >
          <div className="flex items-center gap-2">
            {config.icon}
            <CardTitle className="text-white text-sm font-semibold tracking-wide">
              {column.name}
            </CardTitle>
            <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
              {sortedJobs.length}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white cursor-pointer hover:bg-white/20 rounded-md"
                />
              }
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={handleDeleteColumn}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Column
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 min-h-0 space-y-3 p-3 overflow-hidden">
          <div className="shrink-0">
            <CreateJobApplicationDialog
              columnId={column._id}
              boardId={boardId}
            />
          </div>

          <SortableContext
            items={sortedJobs.map((j) => j._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pb-1 min-h-[100px]">
              {sortedJobs.map((job) => (
                <DraggableJobCard
                  key={job._id}
                  job={{ ...job, columnId: job.columnId || column._id }}
                  columns={sortedColumns}
                  onMove={onMoveJob}
                  onDelete={onDeleteJob}
                />
              ))}

              {sortedJobs.length === 0 && (
                <div
                  className={`flex flex-col items-center justify-center p-8 text-center text-xs border border-dashed rounded-lg transition-colors ${
                    isOver
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground dark:text-zinc-400 bg-white/40 dark:bg-zinc-800/40 border-gray-200 dark:border-zinc-700"
                  }`}
                >
                  {isOver
                    ? "Release to drop here"
                    : "No jobs in this stage yet."}
                </div>
              )}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
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
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        jobApplications: col.jobApplications.filter(
          (j) => String(j._id) !== String(jobId),
        ),
      })),
    );
    try {
      await deleteJobApplication(jobId);
    } catch (err) {
      console.error("Failed to delete job application:", err);
    }
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
          No board found
        </h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Your job hunting board has not been initialized yet.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="w-full">
        <div className="flex flex-row items-start gap-5 overflow-x-auto pb-8 pt-2 no-scrollbar">
          {columns.map((col, key) => {
            const config = COLUMN_CONFIG[key % COLUMN_CONFIG.length] || {
              color: "bg-slate-600",
              icon: <Calendar className="h-4 w-4" />,
            };
            return (
              <DroppableColumn
                key={col._id}
                column={col}
                config={config}
                boardId={board._id}
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
            <JobApplicationCard job={activeJob} columns={columns} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
