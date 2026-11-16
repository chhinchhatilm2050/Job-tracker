"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
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
import { createBoard } from "@/lib/action/board";
import type { BoardType, ColumnColor } from "@/lib/models/models.types";
import { ComboboxSelect } from "./ui/combobox";

type BoardTemplate = "job_hunt" | "daily_tasks" | "blank";
interface ColumnDraft {
  name: string;
  color: ColumnColor;
}

const COLORS: Array<{ value: ColumnColor; label: string }> = [
  { value: "cyan", label: "Cyan" },
  { value: "blue", label: "Blue" },
  { value: "violet", label: "Violet" },
  { value: "emerald", label: "Green" },
  { value: "amber", label: "Amber" },
  { value: "rose", label: "Rose" },
  { value: "slate", label: "Slate" },
];

const TEMPLATES: Record<
  BoardTemplate,
  { title: string; description: string; boardType: BoardType; name: string; columns: ColumnDraft[] }
> = {
  job_hunt: {
    title: "Job Hunt",
    description: "Track applications through your job search.",
    boardType: "job_tracker",
    name: "Job Hunt",
    columns: [
      { name: "Wish List", color: "cyan" },
      { name: "Applied", color: "blue" },
      { name: "Interviewing", color: "violet" },
      { name: "Offer", color: "emerald" },
    ],
  },
  daily_tasks: {
    title: "Daily To-Do",
    description: "Organize everyday tasks in a simple workflow.",
    boardType: "general_tasks",
    name: "Daily Tasks",
    columns: [
      { name: "To Do", color: "cyan" },
      { name: "Doing", color: "violet" },
      { name: "Done", color: "emerald" },
    ],
  },
  blank: {
    title: "Blank Board",
    description: "Start with your own columns and colors.",
    boardType: "general_tasks",
    name: "",
    columns: [{ name: "To Do", color: "cyan" }],
  },
};

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
  const setOpen = isControlled
    ? setControlledOpen || (() => {})
    : setUncontrolledOpen;
  const [template, setTemplate] = useState<BoardTemplate>("job_hunt");
  const [name, setName] = useState(TEMPLATES.job_hunt.name);
  const [boardType, setBoardType] = useState<BoardType>(
    TEMPLATES.job_hunt.boardType,
  );
  const [columns, setColumns] = useState<ColumnDraft[]>(TEMPLATES.job_hunt.columns);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function chooseTemplate(next: BoardTemplate) {
    const selected = TEMPLATES[next];
    setTemplate(next);
    setName(selected.name);
    setBoardType(selected.boardType);
    setColumns(selected.columns.map((column) => ({ ...column })));
    setError(null);
  }

  function updateColumn(index: number, patch: Partial<ColumnDraft>) {
    setColumns((current) =>
      current.map((column, columnIndex) =>
        columnIndex === index ? { ...column, ...patch } : column,
      ),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await createBoard({
        name,
        boardType,
        columns,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setOpen(false);
      if (result.boardId) {
        router.push(`/dashboard?boardId=${result.boardId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board");
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
            <Button size="sm" className="gap-1.5 px-3 py-4 cursor-pointer" />
          }
        >
          <Plus className="size-4" />
          <span>New Board</span>
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a board</DialogTitle>
            <DialogDescription>
              Choose a workflow template, then customize its name and columns.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-5">
            {error && (
              <div role="alert" className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(TEMPLATES) as BoardTemplate[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={template === key}
                  onClick={() => chooseTemplate(key)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    template === key
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/60"
                  }`}
                >
                  <span className="block text-sm font-semibold">
                    {TEMPLATES[key].title}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {TEMPLATES[key].description}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="board-name">Board name</Label>
              <Input
                id="board-name"
                placeholder="e.g. Product design tasks"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={60}
                required
              />
            </div>

            {template === "blank" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="board-type">Board workflow</Label>
                  <ComboboxSelect
                    id="board-type"
                    placeholder="Select board workflow"
                    value={boardType}
                    options={[
                      { value: "general_tasks", label: "General tasks" },
                      { value: "habits", label: "Habits" },
                      { value: "job_tracker", label: "Job tracker" },
                    ]}
                    onValueChange={(value) => {
                      if (
                        value === "general_tasks" ||
                        value === "habits" ||
                        value === "job_tracker"
                      ) {
                        setBoardType(value);
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Columns and colors</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={columns.length >= 12}
                      onClick={() =>
                        setColumns((current) => [
                          ...current,
                          { name: "", color: "slate" },
                        ])
                      }
                    >
                      <Plus className="size-4" />
                      Add column
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {columns.map((column, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          aria-label={`Column ${index + 1} name`}
                          value={column.name}
                          onChange={(event) =>
                            updateColumn(index, { name: event.target.value })
                          }
                          placeholder="Column name"
                          maxLength={40}
                          required
                        />
                        <ComboboxSelect
                          ariaLabel={`Column ${index + 1} color`}
                          className="w-32 shrink-0"
                          placeholder="Select color"
                          value={column.color}
                          options={COLORS.map((color) => ({
                            value: color.value,
                            label: color.label,
                          }))}
                          onValueChange={(value) => {
                            const selectedColor = COLORS.find(
                              (color) => color.value === value,
                            );
                            if (selectedColor) {
                              updateColumn(index, {
                                color: selectedColor.value,
                              });
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove column ${column.name || index + 1}`}
                          disabled={columns.length <= 1}
                          onClick={() =>
                            setColumns((current) =>
                              current.filter((_, columnIndex) => columnIndex !== index),
                            )
                          }
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
