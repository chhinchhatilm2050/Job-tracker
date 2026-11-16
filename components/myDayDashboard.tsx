"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, Plus, Sun, WrapText } from "lucide-react";
import {
  addQuickTaskToMyDay,
  getDailyWrapUpSummary,
  moveTasksToTomorrow,
  resetRecurringTasks,
  updateMyDayAssignment,
} from "@/lib/action/myDay";
import { isHeavyTask } from "@/lib/dailyPlanning";
import type { DailyPlanData, MyDayCard } from "@/lib/models/models.types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import JobApplicationCard from "./jobApplicationCard";
import DailyPlanner from "./dailyPlanner";
import FocusMode from "./focusMode";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ComboboxSelect } from "./ui/combobox";

interface MyDayDashboardProps {
  cards: MyDayCard[];
  plan: DailyPlanData;
  taskBoards: Array<{ id: string; name: string }>;
}

interface WrapUpSummary {
  completedCount: number;
  completedTitles: string[];
  focusMinutes: number;
  applicationsAdded: number;
}

export default function MyDayDashboard({
  cards,
  plan,
  taskBoards,
}: MyDayDashboardProps) {
  const [title, setTitle] = useState("");
  const defaultBoard =
    taskBoards.find((board) => board.name === "Daily Tasks") ?? taskBoards[0];
  const [selectedBoardId, setSelectedBoardId] = useState(
    defaultBoard?.id ?? "",
  );
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [busyCardId, setBusyCardId] = useState<string | null>(null);
  const [focusCard, setFocusCard] = useState<MyDayCard | null>(null);
  const [isWrapUpOpen, setIsWrapUpOpen] = useState(false);
  const [wrapUpSummary, setWrapUpSummary] = useState<WrapUpSummary | null>(null);
  const [isLoadingWrapUp, setIsLoadingWrapUp] = useState(false);
  const [isMovingUnfinished, setIsMovingUnfinished] = useState(false);
  const router = useRouter();
  const carryOverCards = cards.filter((card) => card.isCarryOver);
  const hiddenHeavyCards =
    plan.energyLevel === "low"
      ? cards.filter((card) =>
          isHeavyTask({
            id: card._id,
            title: card.title || card.position,
            boardType: card.boardType,
            columnName: card.columnName,
            effort: card.effort,
            estimatedDurationMinutes: card.estimatedDurationMinutes,
          }),
        )
      : [];
  const visibleCards = cards.filter(
    (card) => !hiddenHeavyCards.some((hidden) => hidden._id === card._id),
  );
  const activeBoardId = taskBoards.some(
    (board) => board.id === selectedBoardId,
  )
    ? selectedBoardId
    : (defaultBoard?.id ?? "");

  useEffect(() => {
    const now = new Date();
    const nextUtcMidnight = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
      ),
    );
    const timeout = window.setTimeout(() => {
      void (async () => {
        const result = await resetRecurringTasks();
        if (!("data" in result) || !result.data) {
          setError(result.error ?? "Could not load your daily summary");
          return;
        }
        router.refresh();
      })();
    }, Math.max(0, nextUtcMidnight.getTime() - now.getTime()));

    return () => window.clearTimeout(timeout);
  }, [router]);

  useEffect(() => {
    let active = true;
    const openWrapUp = async () => {
      if (!active) return;
      setIsWrapUpOpen(true);
      setIsLoadingWrapUp(true);
      try {
        const result = await getDailyWrapUpSummary();
        if (!active) return;
        if (!("data" in result) || !result.data) {
          setError(result.error ?? "Could not load your daily summary");
        } else {
          setWrapUpSummary(result.data);
        }
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Could not load your daily summary",
        );
      } finally {
        if (active) setIsLoadingWrapUp(false);
      }
    };

    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(18, 0, 0, 0);
    if (now >= endOfDay) {
      void openWrapUp();
      return () => {
        active = false;
      };
    }

    const timeout = window.setTimeout(
      () => void openWrapUp(),
      endOfDay.getTime() - now.getTime(),
    );
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, []);

  async function handleQuickAdd(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsAdding(true);

    try {
      const result = await addQuickTaskToMyDay(title, activeBoardId || undefined);
      if (result.error) {
        setError(result.error);
        return;
      }

      setTitle("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add task");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleCarryOver(cardId: string, action: "keep" | "remove") {
    setError("");
    setBusyCardId(cardId);

    try {
      const result = await updateMyDayAssignment(cardId, action);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update task");
    } finally {
      setBusyCardId(null);
    }
  }

  async function handleOpenWrapUp() {
    setIsWrapUpOpen(true);
    setIsLoadingWrapUp(true);
    setError("");
    try {
      const result = await getDailyWrapUpSummary();
      if (!("data" in result) || !result.data) {
        setError(result.error ?? "Could not load your daily summary");
        return;
      }
      setWrapUpSummary(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your summary");
    } finally {
      setIsLoadingWrapUp(false);
    }
  }

  async function handleMoveUnfinishedToTomorrow() {
    setIsMovingUnfinished(true);
    setError("");
    try {
      const result = await moveTasksToTomorrow(cards.map((card) => card._id));
      if (result.error) {
        setError(result.error);
        return;
      }
      setIsWrapUpOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move unfinished tasks");
    } finally {
      setIsMovingUnfinished(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Sun className="size-6" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              My Day
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            A focused space to plan and finish what matters across your boards.
          </p>
        </div>
        <Button variant="outline" onClick={handleOpenWrapUp}>
          <WrapText className="size-4" />
          Wrap up my day
        </Button>
      </header>

      <form
        onSubmit={handleQuickAdd}
        className="mb-6 flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm sm:flex-row"
      >
        <Input
          className="min-w-0 flex-1"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a task for today..."
          aria-label="Add a task for today"
          maxLength={200}
          required
        />
        <div className="flex items-center gap-2">
          <label
            className="whitespace-nowrap text-sm text-muted-foreground"
            htmlFor="quick-add-board"
          >
            Add to
          </label>
          <ComboboxSelect
            id="quick-add-board"
            ariaLabel="Board for new task"
            placeholder="Select a board"
            value={activeBoardId || null}
            options={taskBoards.map((board) => ({
              value: board.id,
              label: board.name,
            }))}
            onValueChange={(value) => {
              if (value) setSelectedBoardId(value);
            }}
            className="w-44 shrink-0"
          />
        </div>
        <Button type="submit" disabled={isAdding || !title.trim()}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">
            {isAdding ? "Adding..." : "Add task"}
          </span>
        </Button>
      </form>

      <DailyPlanner
        cards={cards}
        plan={plan}
        onStartFocus={setFocusCard}
      />

      {error && (
        <div role="alert" className="mb-5 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {carryOverCards.length > 0 && (
        <section
          aria-labelledby="carry-over-heading"
          className="mb-7 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="size-4 text-amber-600" />
            <h2 id="carry-over-heading" className="font-semibold">
              Unfinished from earlier
            </h2>
          </div>
          <ul className="space-y-2">
            {carryOverCards.map((card) => (
              <li
                key={card._id}
                className="flex flex-col gap-2 rounded-lg bg-background/80 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {card.title || card.position}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {card.boardName} · {card.columnName}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyCardId === card._id}
                    onClick={() => handleCarryOver(card._id, "keep")}
                  >
                    <Check className="size-4" />
                    Keep for Today
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyCardId === card._id}
                    onClick={() => handleCarryOver(card._id, "remove")}
                  >
                    Remove from Today
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mb-4">
        <h2 className="text-base font-semibold">Tasks for today</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Pinned tasks and items due today or overdue appear here, with the
          board they came from. Add an estimate, priority, or effort level to
          help Auto-Plan fit them into your available time and energy.
        </p>
      </div>

      {visibleCards.length > 0 ? (
        <section
          aria-label="Today's tasks"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {visibleCards.map((card) => (
            <div key={card._id} className="min-w-0">
              <p className="mb-2 truncate text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  {card.boardName}
                </span>{" "}
                · {card.columnName}
              </p>
              <JobApplicationCard
                job={card}
                columns={[]}
                boardType={card.boardType}
                onStartFocus={() => setFocusCard(card)}
              />
            </div>
          ))}
        </section>
      ) : hiddenHeavyCards.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Sun className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h2 className="font-semibold">Nothing on your day yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a task above or pin a card from any board.
          </p>
        </div>
      ) : null}

      {focusCard && (
        <FocusMode
          key={focusCard._id}
          card={focusCard}
          energyLevel={plan.energyLevel ?? "normal"}
          onClose={() => {
            setFocusCard(null);
            router.refresh();
          }}
        />
      )}

      <Dialog open={isWrapUpOpen} onOpenChange={setIsWrapUpOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Daily wrap-up</DialogTitle>
            <DialogDescription>
              Take a moment to see what you accomplished and prepare for
              tomorrow.
            </DialogDescription>
          </DialogHeader>
          {isLoadingWrapUp ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Gathering your day...
            </p>
          ) : wrapUpSummary ? (
            <div className="grid grid-cols-3 gap-3 py-3 text-center">
              <div className="rounded-xl bg-muted p-3">
                <p className="text-2xl font-bold">{wrapUpSummary.completedCount}</p>
                <p className="text-xs text-muted-foreground">Tasks completed</p>
              </div>
              <div className="rounded-xl bg-muted p-3">
                <p className="text-2xl font-bold">
                  {(wrapUpSummary.focusMinutes / 60).toFixed(1)}h
                </p>
                <p className="text-xs text-muted-foreground">Focused</p>
              </div>
              <div className="rounded-xl bg-muted p-3">
                <p className="text-2xl font-bold">
                  {wrapUpSummary.applicationsAdded}
                </p>
                <p className="text-xs text-muted-foreground">
                  Applications added
                </p>
              </div>
            </div>
          ) : null}
          {wrapUpSummary?.completedTitles.length ? (
            <ul className="max-h-32 space-y-1 overflow-y-auto text-sm text-muted-foreground">
              {wrapUpSummary.completedTitles.map((completedTitle, index) => (
                <li key={`${completedTitle}-${index}`}>✓ {completedTitle}</li>
              ))}
            </ul>
          ) : null}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsWrapUpOpen(false)}
              disabled={isMovingUnfinished}
            >
              Close
            </Button>
            <Button
              onClick={handleMoveUnfinishedToTomorrow}
              disabled={cards.length === 0 || isMovingUnfinished}
            >
              {isMovingUnfinished
                ? "Moving..."
                : "Move unfinished to tomorrow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
