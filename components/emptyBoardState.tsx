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
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
        <Kanban className="size-8" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 mb-2">
        No Boards Found
      </h2>

      <p className="text-sm text-gray-500 dark:text-zinc-400 mb-8 leading-relaxed">
        You currently don&apos;t have any job boards. You can initialize the standard
        Job Hunt board with default stages, or create a custom board tailored to your workflow.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
        <Button
          onClick={handleInitDefault}
          disabled={initializing}
          className="w-full sm:w-auto gap-2 cursor-pointer"
        >
          <Sparkles className="size-4" />
          <span>{initializing ? "Initializing..." : "Initialize Default Board"}</span>
        </Button>

        <CreateBoardDialog
          trigger={
            <Button
              variant="outline"
              disabled={initializing}
              className="w-full sm:w-auto cursor-pointer"
            >
              Create Custom Board
            </Button>
          }
        />
      </div>
    </div>
  );
}
