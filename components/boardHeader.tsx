"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {

  ChevronDown,
  Kanban,
  Plus,
  Trash2,
  Check,
  Package,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import CreateBoardDialog from "./createBoardDialog";
import { deleteBoard } from "@/lib/action/board";
import type { BoardType } from "@/lib/models/models.types";

interface BoardHeaderProps {
  boards: Array<{ _id: string; name: string }>;
  currentBoardId: string;
  currentBoardName: string;
  boardType?: BoardType;
}

export default function BoardHeader({
  boards,
  currentBoardId,
  currentBoardName,
  boardType = "job_tracker",
}: BoardHeaderProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const router = useRouter();

  async function handleConfirmDelete() {
    if (isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteBoard(currentBoardId);
      if (res?.error) {
        setDeleteError(res.error);
        return;
      }

      setDeleteDialogOpen(false);
      // Find another board to navigate to, or redirect to /dashboard
      const remaining = boards.filter((b) => b._id !== currentBoardId);
      if (remaining.length > 0) {
        router.push(`/dashboard?boardId=${remaining[0]._id}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error("Failed to delete board:", err);
      const message =
        err instanceof Error ? err.message : "Failed to delete board";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm sm:p-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Kanban className="size-3.5 text-primary" />
            <span>Workspace</span>
            <span aria-hidden="true">·</span>
            <span>
              {boards.length} {boards.length === 1 ? "board" : "boards"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {boards.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="max-w-[75vw] gap-2 rounded-lg px-2 text-left text-2xl font-bold tracking-tight text-foreground hover:bg-muted sm:max-w-[520px] sm:text-3xl"
                    />
                  }
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Package className="size-6 text-primary shrink-0" />
                    <span className="truncate">{currentBoardName}</span>
                    <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuGroup>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      Switch Board
                    </div>
                    {boards.map((b) => (
                      <DropdownMenuItem
                        key={b._id}
                        className="cursor-pointer justify-between"
                        onClick={() =>
                          router.push(`/dashboard?boardId=${b._id}`)
                        }
                      >
                        <span className="truncate">{b.name}</span>
                        {b._id === currentBoardId && (
                          <Check className="size-4 text-primary shrink-0" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete This Board
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Package className="size-6 shrink-0 text-primary" />
                <h1 className="truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {currentBoardName}
                </h1>
              </div>
            )}
            <span className="ml-1 inline-flex rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {boardType === "job_tracker"
                ? "Job search"
                : boardType === "habits"
                  ? "Habits"
                  : "Tasks & projects"}
            </span>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {boardType === "job_tracker"
              ? "Keep every opportunity moving from shortlist to offer."
              : boardType === "habits"
                ? "Build consistent routines and celebrate your daily streaks."
                : "Organize tasks by stage and keep your projects moving."}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <CreateBoardDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            trigger={
              <Button size="sm" className="gap-2">
                <Plus className="size-4" />
                New Board
              </Button>
            }
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDeleteError(null);
              setDeleteDialogOpen(true);
            }}
            className="gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="Delete this board permanently from database"
          >
            <Trash2 className="size-4" />
            <span>Delete Board</span>
          </Button>
        </div>
      </section>

      {/* Confirmation Modal for Deleting Board */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader className="gap-2.5">
            <div className="size-11 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Trash className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                Delete Board
              </DialogTitle>
              <DialogDescription className="text-sm mt-2 leading-relaxed text-gray-600 dark:text-zinc-400">
                Are you sure you want to permanently delete{" "}
                <strong className="text-gray-900 dark:text-zinc-100 font-semibold">
                  &quot;{currentBoardName}&quot;
                </strong>
                ?
                <br />
                <br />
                This will permanently delete this board, all its columns, and
                all associated cards from the database. This action
                cannot be undone.
              </DialogDescription>
            </div>
          </DialogHeader>

          {deleteError && (
            <div className="rounded-md bg-destructive/15 p-3 text-xs text-destructive">
              {deleteError}
            </div>
          )}

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="gap-2 cursor-pointer"
            >
              <Trash2 className="size-4" />
              <span>{isDeleting ? "Deleting..." : "Delete Permanently"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
