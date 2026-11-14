"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
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
import { Plus } from "lucide-react";
import { createBoard } from "@/lib/action/board";

interface CreateBoardDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactElement;
}

export default function CreateBoardDialog({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: CreateBoardDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? (setControlledOpen || (() => {})) : setUncontrolledOpen;

  const [name, setName] = useState("");
  const [columnsStr, setColumnsStr] = useState(
    "Wish List, Applied, Interviewing, Offer, Rejected"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a board name");
      return;
    }

    setLoading(true);
    setError(null);

    const cols = columnsStr
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    try {
      const res = await createBoard(name.trim(), cols.length > 0 ? cols : undefined);
      if (res?.error) {
        setError(res.error);
      } else {
        setName("");
        setColumnsStr("Wish List, Applied, Interviewing, Offer, Rejected");
        setOpen(false);
        if (res.boardId) {
          router.push(`/dashboard?boardId=${res.boardId}`);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create board";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger
          render={
            <Button size="sm" className="gap-1.5 px-3 py-4 cursor-pointer">
              <Plus className="size-4" />
              <span>New Board</span>
            </Button>
          }
        />
      )}

      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
            <DialogDescription>
              Create a new Kanban board to organize a different job search or project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="board-name">Board Name</Label>
              <Input
                id="board-name"
                placeholder="e.g. Frontend Engineering, Summer Internships"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="board-columns">
                Columns <span className="text-xs text-muted-foreground">(comma separated)</span>
              </Label>
              <Input
                id="board-columns"
                placeholder="Wish List, Applied, Interviewing, Offer, Rejected"
                value={columnsStr}
                onChange={(e) => setColumnsStr(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Default: Wish List, Applied, Interviewing, Offer, Rejected
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
