import type {
  BoardType,
  EnergyLevel,
  Priority,
  TaskEffort,
} from "@/lib/models/models.types";

export interface SchedulableCard {
  id: string;
  title: string;
  boardType: BoardType;
  columnName: string;
  priority?: Priority;
  effort?: TaskEffort;
  dueDate?: string | Date | null;
  estimatedDurationMinutes?: number;
}

export interface ScheduledBlock {
  cardId: string;
  startMinute: number;
  durationMinutes: number;
}

function isInterview(card: SchedulableCard) {
  return (
    card.boardType === "job_tracker" &&
    /interview/i.test(`${card.title} ${card.columnName}`)
  );
}

export function isHeavyTask(card: SchedulableCard) {
  return getTaskEffort(card) === "heavy";
}

export function getTaskEffort(card: SchedulableCard): TaskEffort {
  if (isInterview(card)) return "heavy";
  if (card.effort) return card.effort;

  const taskText = `${card.title} ${card.columnName}`;
  if (
    (card.estimatedDurationMinutes ?? 30) >= 60 ||
    /\b(deep work|research|study|coding|code|cover letter|interview prep|design|write|build|network|exam|prepare)\b/i.test(
      taskText,
    )
  ) {
    return "heavy";
  }
  if (
    (card.estimatedDurationMinutes ?? 30) <= 30 ||
    /\b(organize|email|call|groceries|pay|errand|browse|update)\b/i.test(
      taskText,
    )
  ) {
    return "light";
  }
  return "moderate";
}

export function isQuickWin(card: SchedulableCard) {
  return getTaskEffort(card) === "light";
}

function priorityRank(priority?: Priority) {
  if (priority === "high") return 3;
  if (priority === "low") return 1;
  return 2;
}

function balancedEffortRank(card: SchedulableCard) {
  const effort = getTaskEffort(card);
  return effort === "moderate" ? 0 : effort === "light" ? 1 : 2;
}

function compareDueDate(a: SchedulableCard, b: SchedulableCard) {
  const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
  const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
  return aTime - bTime;
}

export function buildDailySchedule(
  cards: SchedulableCard[],
  availableHours: number,
  energyLevel: EnergyLevel,
  startMinute = 9 * 60,
) {
  const capacityMinutes = availableHours * 60;
  const hiddenCards =
    energyLevel === "low" ? cards.filter(isHeavyTask) : [];
  const candidates = cards.filter((card) => !hiddenCards.includes(card));

  const compare = (a: SchedulableCard, b: SchedulableCard) => {
    if (energyLevel === "high" && isHeavyTask(a) !== isHeavyTask(b)) {
      return isHeavyTask(a) ? -1 : 1;
    }
    if (energyLevel === "high") {
      const effortDifference =
        balancedEffortRank(a) - balancedEffortRank(b);
      if (effortDifference !== 0) return effortDifference;
    }
    if (energyLevel === "low" && isQuickWin(a) !== isQuickWin(b)) {
      return isQuickWin(a) ? -1 : 1;
    }
    if (isInterview(a) !== isInterview(b)) return isInterview(a) ? -1 : 1;
    const priorityDifference = priorityRank(b.priority) - priorityRank(a.priority);
    if (priorityDifference !== 0) return priorityDifference;
    const dueDifference = compareDueDate(a, b);
    if (dueDifference !== 0) return dueDifference;
    if (energyLevel === "normal") {
      const effortDifference =
        balancedEffortRank(a) - balancedEffortRank(b);
      if (effortDifference !== 0) return effortDifference;
    }
    return (
      (b.estimatedDurationMinutes ?? 30) -
      (a.estimatedDurationMinutes ?? 30)
    );
  };

  const remaining = [...candidates].sort(compare);
  const schedule: ScheduledBlock[] = [];
  let nextStartMinute = startMinute;
  let availableMinutes = capacityMinutes;

  while (remaining.length > 0) {
    const fitting = remaining
      .filter((card) => (card.estimatedDurationMinutes ?? 30) <= availableMinutes)
      .sort((a, b) => {
        if (availableMinutes <= 30 && isQuickWin(a) !== isQuickWin(b)) {
          return isQuickWin(a) ? -1 : 1;
        }
        return compare(a, b);
      });
    const next = fitting[0];
    if (!next) break;

    const durationMinutes = next.estimatedDurationMinutes ?? 30;
    schedule.push({
      cardId: next.id,
      startMinute: nextStartMinute,
      durationMinutes,
    });
    nextStartMinute += durationMinutes;
    availableMinutes -= durationMinutes;
    remaining.splice(remaining.findIndex((card) => card.id === next.id), 1);
  }

  const unscheduledCards = [...hiddenCards, ...remaining];
  const totalCandidateMinutes = candidates.reduce(
    (total, card) => total + (card.estimatedDurationMinutes ?? 30),
    0,
  );

  return {
    schedule,
    unscheduledCardIds: unscheduledCards.map((card) => card.id),
    hiddenCardIds: hiddenCards.map((card) => card.id),
    overbookedMinutes: Math.max(0, totalCandidateMinutes - capacityMinutes),
  };
}
