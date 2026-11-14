"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronDown,
  Kanban,
  Plus,
  Trash2,
  Check,
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

interface BoardHeaderProps {
  boards: Array<{ _id: string; name: string }>;
  currentBoardId: string;
  currentBoardName: string;
}

export default function BoardHeader({
  boards,
  currentBoardId,
  currentBoardName,
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
        setIsDeleting(false);
      } else {
        setDeleteDialogOpen(false);
        // Find another board to navigate to, or redirect to /dashboard
        const remaining = boards.filter((b) => b._id !== currentBoardId);
        if (remaining.length > 0) {
          router.push(`/dashboard?boardId=${remaining[0]._id}`);
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: unknown) {
      console.error("Failed to delete board:", err);
      const message =
        err instanceof Error ? err.message : "Failed to delete board";
      setDeleteError(message);
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {boards.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 px-3 -ml-2 rounded-lg gap-2 cursor-pointer"
                    />
                  }
                >
                  <span className="flex items-center gap-2">
                    <Kanban className="size-6 text-primary shrink-0" />
                    <span>{currentBoardName}</span>
                    <ChevronDown className="size-5 text-muted-foreground" />
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
                      className="cursor-pointer"
                      onClick={() => setCreateDialogOpen(true)}
                    >
                      <Plus className="size-4 mr-2" />
                      Add New Board
                    </DropdownMenuItem>

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
                <Kanban className="size-6 text-primary shrink-0" />
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
                  {currentBoardName}
                </h1>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Track, organize, and manage your job applications across every stage
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <CreateBoardDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDeleteError(null);
              setDeleteDialogOpen(true);
            }}
            className="text-destructive px-3 py-4 hover:bg-destructive/10 hover:text-destructive border-red-200 dark:border-red-900/40 cursor-pointer gap-1.5"
            title="Delete this board permanently from database"
          >
            <Trash2 className="size-4" />
            <span>Delete Board</span>
          </Button>
        </div>
      </div>

      {/* Confirmation Modal for Deleting Board */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader className="gap-2.5">
            <div className="size-11 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle className="size-5" />
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
                all associated job applications from the database. This action
                cannot be undone.
              </DialogDescription>
            </div>
          </DialogHeader>

          {deleteError && (
            <div className="rounded-md bg-destructive/15 p-3 text-xs text-destructive">
              {deleteError}
            </div>
          )}

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
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
