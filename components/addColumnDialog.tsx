"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { addColumn } from "@/lib/action/board";
import type { ColumnColor } from "@/lib/models/models.types";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ComboboxSelect } from "./ui/combobox";

const COLORS: Array<{ value: ColumnColor; label: string }> = [
  { value: "cyan", label: "Cyan" },
  { value: "blue", label: "Blue" },
  { value: "violet", label: "Violet" },
  { value: "emerald", label: "Green" },
  { value: "amber", label: "Amber" },
  { value: "rose", label: "Rose" },
  { value: "slate", label: "Slate" },
];

export default function AddColumnDialog({
  boardId,
  disabled = false,
}: {
  boardId: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState<ColumnColor>("slate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await addColumn(boardId, name, color);
      if (result.error) {
        setError(result.error);
        return;
      }

      setName("");
      setColor("slate");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add column");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!loading) {
          setOpen(nextOpen);
          if (nextOpen) setError(null);
        }
      }}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={disabled}
        title={disabled ? "A board can have no more than 12 columns" : undefined}
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        Add column
      </Button>

      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a column</DialogTitle>
            <DialogDescription>
              Add a new stage to this board. You can have up to 12 columns.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-5">
            {error && (
              <div role="alert" className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="column-name">Column name</Label>
              <Input
                id="column-name"
                placeholder="e.g. In progress"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={40}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="column-color">Color</Label>
              <ComboboxSelect
                id="column-color"
                placeholder="Select color"
                value={color}
                options={COLORS.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onValueChange={(value) => {
                  const selectedColor = COLORS.find(
                    (item) => item.value === value,
                  );
                  if (selectedColor) setColor(selectedColor.value);
                }}
              />
            </div>
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
              {loading ? "Adding..." : "Add column"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
