"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BatteryLow,
  BatteryMedium,
  Clock3,
  Sun,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  autoPlanMyDay,
  moveTasksToTomorrow,
  updateDailyPlanSettings,
} from "@/lib/action/myDay";
import { getTaskEffort, isHeavyTask } from "@/lib/dailyPlanning";
import type {
  DailyPlanData,
  EnergyLevel,
  MyDayCard,
  TaskEffort,
} from "@/lib/models/models.types";
import { Button } from "./ui/button";
import { ComboboxSelect } from "./ui/combobox";

interface DailyPlannerProps {
  cards: MyDayCard[];
  plan: DailyPlanData;
  onStartFocus: (card: MyDayCard) => void;
};

const ENERGY_OPTIONS: Array<{
  value: EnergyLevel;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "high", label: "High", icon: Zap },
  { value: "normal", label: "Normal", icon: BatteryMedium },
  { value: "low", label: "Low", icon: BatteryLow },
];

function formatClock(totalMinutes: number) {
  const hour = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function formatTimeInput(totalMinutes: number) {
  const hour = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function parseTimeInput(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${remainingMinutes}m`;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function toSchedulableCard(card: MyDayCard) {
  return {
    id: card._id,
    title: card.title || card.position,
    boardType: card.boardType,
    columnName: card.columnName,
    priority: card.priority,
    effort: card.effort,
    dueDate: card.dueDate,
    estimatedDurationMinutes: card.estimatedDurationMinutes,
  };
}

function getEnergyReason(effort: TaskEffort, energy: EnergyLevel) {
  if (energy === "high") {
    return effort === "heavy"
      ? "Deep work prioritized for high energy"
      : "Lower-effort task in your high-energy plan";
  }
  if (energy === "low") {
    return effort === "light"
      ? "Quick win for a low-energy day"
      : "Moderate effort task in your low-energy plan";
  }
  return `${effort[0].toUpperCase()}${effort.slice(1)} effort balanced with priority and due date`;
}

export default function DailyPlanner({ cards, plan, onStartFocus }: DailyPlannerProps) {
  const [isPlanning, setIsPlanning] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState("");
  const [unscheduledCardIds, setUnscheduledCardIds] = useState<string[]>([]);
  const [hiddenCardIds, setHiddenCardIds] = useState<string[]>([]);
  const [overbookedMinutes, setOverbookedMinutes] = useState(0);
  const router = useRouter();

  const cardsById = useMemo(
    () => new Map(cards.map((card) => [card._id, card])),
    [cards],
  );
  const scheduledIds = new Set(plan.schedule.map((block) => block.cardId));
  const unscheduledCards =
    unscheduledCardIds.length > 0
      ? unscheduledCardIds
          .filter((cardId) => !hiddenCardIds.includes(cardId))
          .map((cardId) => cardsById.get(cardId))
          .filter((card): card is MyDayCard => Boolean(card))
      : cards.filter((card) => !scheduledIds.has(card._id));
  const eligibleCards =
    plan.energyLevel === "low"
      ? cards.filter((card) => !isHeavyTask(toSchedulableCard(card)))
      : cards;
  const totalMinutes = eligibleCards.reduce(
    (total, card) => total + (card.estimatedDurationMinutes ?? 30),
    0,
  );
  const liveOverbookedMinutes = Math.max(
    0,
    totalMinutes - plan.availableHours * 60,
  );
  const visibleOverbookedMinutes = overbookedMinutes || liveOverbookedMinutes;
  const maxAvailableHours = Math.min(
    9,
    Math.floor((24 * 60 - plan.startMinute) / 60),
  );
  const hiddenCards = cards.filter((card) =>
    hiddenCardIds.length > 0
      ? hiddenCardIds.includes(card._id)
      : plan.energyLevel === "low" && isHeavyTask(toSchedulableCard(card)),
  );

  async function saveSettings(settings: {
    availableHours?: number;
    startMinute?: number;
    energyLevel?: EnergyLevel;
  }) {
    setError("");
    const result = await updateDailyPlanSettings(settings);
    if (result.error) {
      setError(result.error);
      return;
    }
    setUnscheduledCardIds([]);
    setHiddenCardIds([]);
    setOverbookedMinutes(0);
    router.refresh();
  }

  async function handleAutoPlan() {
    setIsPlanning(true);
    setError("");
    try {
      const result = await autoPlanMyDay();
      if (!("data" in result) || !result.data) {
        setError(result.error ?? "Could not build your daily plan");
        return;
      }
      setUnscheduledCardIds(result.data.unscheduledCardIds);
      setHiddenCardIds(result.data.hiddenCardIds);
      setOverbookedMinutes(result.data.overbookedMinutes);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not plan your day");
    } finally {
      setIsPlanning(false);
    }
  }

  async function handleMoveUnscheduled() {
    setIsMoving(true);
    setError("");
    try {
      const cardIds =
        unscheduledCardIds.length > 0
          ? unscheduledCardIds.filter(
              (cardId) => !hiddenCardIds.includes(cardId),
            )
          : unscheduledCards.map((card) => card._id);
      if (cardIds.length === 0) return;
      const result = await moveTasksToTomorrow(cardIds);
      if (result.error) {
        setError(result.error);
        return;
      }
      setUnscheduledCardIds([]);
      setHiddenCardIds([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move tasks");
    } finally {
      setIsMoving(false);
    }
  }

  return (
    <section
      aria-labelledby="daily-plan-heading"
      className="mb-7 rounded-2xl border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock3 className="size-5 text-primary" />
            <h2 id="daily-plan-heading" className="text-lg font-semibold">
              Your daily timeline
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose when your day starts and how long you have. Auto-Plan ranks
            tasks by your energy, priority, and due date.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Start time
            <input
              aria-label="Schedule start time"
              type="time"
              min="00:00"
              max={formatTimeInput(24 * 60 - plan.availableHours * 60)}
              step={900}
              value={formatTimeInput(plan.startMinute)}
              onChange={(event) =>
                void saveSettings({
                  startMinute: parseTimeInput(event.target.value),
                })
              }
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Available today
            <ComboboxSelect
              ariaLabel="Available work hours"
              placeholder="Choose available hours"
              value={String(plan.availableHours)}
              options={Array.from(
                { length: maxAvailableHours },
                (_, index) => index + 1,
              ).map((hours) => ({
                value: String(hours),
                label: `${hours} ${hours === 1 ? "hour" : "hours"}`,
              }))}
              onValueChange={(value) => {
                if (value) {
                  void saveSettings({ availableHours: Number(value) });
                }
              }}
              className="w-full"
            />
          </label>
          <Button
            onClick={handleAutoPlan}
            disabled={isPlanning || !plan.energyLevel || cards.length === 0}
          >
            {isPlanning ? "Planning..." : "Auto-Plan My Day"}
          </Button>
        </div>
      </div>

      <div className="mt-5 rounded-xl border bg-background p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">How is your energy today?</p>
            <p className="text-xs text-muted-foreground">
              High prioritizes heavy work; low favors light tasks and saves
              heavy ones for later.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ENERGY_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={
                  plan.energyLevel === option.value ? "default" : "outline"
                }
                aria-pressed={plan.energyLevel === option.value}
                onClick={() => void saveSettings({ energyLevel: option.value })}
              >
                <option.icon aria-hidden="true" className="size-4" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {visibleOverbookedMinutes > 0 && (
        <div
          role="status"
          className="mt-4 flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0 text-amber-600" />
            You&apos;re overbooked by {formatDuration(visibleOverbookedMinutes)}
            . Move unplanned tasks to tomorrow?
          </p>
          {unscheduledCards.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMoveUnscheduled}
              disabled={isMoving}
            >
              {isMoving ? "Moving..." : "Move unplanned"}
            </Button>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {plan.energyLevel === "low" && hiddenCards.length > 0 && (
        <details className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
          <summary className="cursor-pointer text-sm font-medium">
            Save {hiddenCards.length} high-effort{" "}
            {hiddenCards.length === 1 ? "task" : "tasks"} for later
          </summary>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {hiddenCards.map((card) => (
              <li
                key={card._id}
                className="flex flex-wrap justify-between gap-x-3 gap-y-1"
              >
                <span>{card.title || card.position}</span>
                <span className="text-xs">
                  Heavy effort · saved for a low-energy day
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="mt-5 space-y-3">
        <p className="text-xs font-medium text-muted-foreground">
          Planned window: {formatClock(plan.startMinute)}–
          {formatClock(plan.startMinute + plan.availableHours * 60)}
        </p>
        <div className="space-y-2">
          {plan.schedule.map((block) => {
            const card = cardsById.get(block.cardId);
            if (!card) return null;
            const effort = getTaskEffort(toSchedulableCard(card));
            return (
              <article
                key={block.cardId}
                className="grid grid-cols-[88px_minmax(0,1fr)] gap-3"
              >
                <div className="pt-2 text-right">
                  <p className="text-sm font-semibold">
                    {formatClock(block.startMinute)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(block.durationMinutes)}
                  </p>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {card.title || card.position}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {card.boardName} · Ends{" "}
                        {formatClock(block.startMinute + block.durationMinutes)}
                      </p>
                      <p className="mt-1 text-xs text-primary/80">
                        {getEnergyReason(effort, plan.energyLevel ?? "normal")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStartFocus(card)}
                    >
                      <Sun className="size-3.5" />
                      Focus
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {plan.schedule.length === 0 && (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Set your start time and energy, then auto-plan to fill your timeline.
        </p>
      )}
    </section>
  );
}
