export type BoardType = "job_tracker" | "general_tasks" | "habits";
export type Priority = "low" | "medium" | "high";
export type EnergyLevel = "high" | "normal" | "low";
export type TaskEffort = "light" | "moderate" | "heavy";
export type ColumnColor =
    | "cyan"
    | "violet"
    | "emerald"
    | "amber"
    | "rose"
    | "blue"
    | "slate";

export interface Subtask {
    id: string;
    title: string;
    isCompleted: boolean;
}

export interface JobDetails {
    company?: string;
    salary?: string;
    jobUrl?: string;
}

export interface JobApplication  {
    _id: string,
    title?: string,
    company: string,
    position: string,
    location: string,
    status: string,
    columnId: string,
    order: number,
    notes?: string,
    salary?: string,
    jobUrl?: string,
    tags?: string[],
    description?: string;
    dueDate?: string | Date | null;
    estimatedDurationMinutes?: number;
    actualDurationMinutes?: number;
    isMyDay?: boolean;
    myDayDate?: string | Date | null;
    myDayDismissedDate?: string | Date | null;
    priority?: Priority;
    effort?: TaskEffort;
    subtasks?: Subtask[];
    jobDetails?: JobDetails;
    isCompleted?: boolean;
    repeatDaily?: boolean;
    streakCount?: number;
    completedAt?: string | Date | null;
    lastCompletedAt?: string | Date | null;
};

export interface Column {
    _id: string,
    name: string,
    order: number,
    jobApplications: JobApplication[],
    color?: ColumnColor,
};

export interface Board {
    _id: string,
    name: string,
    boardType?: BoardType;
    columns: Column[];
}

export interface MyDayCard extends JobApplication {
    boardId: string;
    columnId: string;
    boardName: string;
    boardType: BoardType;
    columnName: string;
    isCarryOver: boolean;
    scheduledStartMinute?: number;
    scheduledDurationMinutes?: number;
}

export interface DailyPlanData {
    availableHours: number;
    startMinute: number;
    energyLevel?: EnergyLevel;
    schedule: Array<{
      cardId: string;
      startMinute: number;
      durationMinutes: number;
    }>;
    focusEntries: Array<{
      cardId: string;
      title: string;
      minutes: number;
      loggedAt: string | Date;
    }>;
}