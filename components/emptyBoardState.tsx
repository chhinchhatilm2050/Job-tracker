"use client";

import { useState } from "react";
import { Kanban, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import CreateBoardDialog from "./createBoardDialog";
import { initDefaultBoardAction } from "@/lib/action/board";

export default function EmptyBoardState() {
  const [initializing, setInitializing] = useState(false);

  async function handleInitDefault() {
    setInitializing(true);
    try {
      await initDefaultBoardAction();
    } catch (err) {
      console.error("Failed to initialize default board:", err);
    } finally {
      setInitializing(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-3xl border border-border/80 bg-card px-6 py-14 text-center shadow-sm sm:px-10">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Kanban className="size-8" />
      </div>

      <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
        Start with a board
      </h2>

      <p className="mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
        Choose a ready-made workflow for your job search or daily tasks, or
        build a blank board around the way you work.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
        <Button
          onClick={handleInitDefault}
          disabled={initializing}
          className="w-full gap-2 sm:w-auto"
        >
          <Sparkles className="size-4" />
          <span>{initializing ? "Creating..." : "Create Job Hunt Board"}</span>
        </Button>

        <CreateBoardDialog
          trigger={
            <Button
              variant="outline"
              disabled={initializing}
              className="w-full sm:w-auto"
            >
              Create Custom Board
            </Button>
          }
        />
      </div>
    </div>
  );
}
