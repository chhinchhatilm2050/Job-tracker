"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board, Column, JobApplication } from "../models";
import type { Priority, Subtask, TaskEffort } from "../models/models.types";

function utcDayStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export interface JobApplicationInput {
  company: string;
  position: string;
  location?: string;
  columnId: string;
  boardId: string;
  notes?: string;
  salary?: string;
  jobUrl?: string;
  tags?: string[];
  description?: string;
}

export interface TaskCardInput {
  title: string;
  columnId: string;
  boardId: string;
  dueDate?: string;
  priority?: Priority;
  effort?: TaskEffort;
  isMyDay?: boolean;
  repeatDaily?: boolean;
  estimatedDurationMinutes?: number;
}

export interface CardDetailsInput {
  title: string;
  company?: string;
  salary?: string;
  jobUrl?: string;
  location?: string;
  notes?: string;
  tags?: string[];
  description?: string;
  dueDate?: string | null;
  isMyDay?: boolean;
  priority?: Priority;
  effort?: TaskEffort | null;
  subtasks?: Subtask[];
  repeatDaily?: boolean;
  estimatedDurationMinutes?: number;
}

export async function createJobApplication(data: JobApplicationInput) {
  const session = await getSession();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await connectDB();

  const {
    company,
    position,
    location,
    notes,
    salary,
    jobUrl,
    columnId,
    boardId,
    tags,
    description,
  } = data;

  if (!company || !position || !columnId || !boardId) {
    return { error: "Missing required fields" };
  }

  const board = await Board.findOne({ _id: boardId, userId: session.user.id });

  if (!board) {
    return { error: "Board not found" };
  }
  if ((board.boardType ?? "job_tracker") !== "job_tracker") {
    return { error: "Job applications can only be added to job tracker boards" };
  }
  const column = await Column.findOne({ _id: columnId, boardId: boardId });

  if (!column) {
    return { error: "Column not found" };
  }

  const maxOrder = (await JobApplication.findOne({ columnId })
    .sort({ order: -1 })
    .select("order")
    .lean()) as { order: number } | null;

  const jobApplication = await JobApplication.create({
    title: position.trim(),
    company,
    position,
    location: location || "",
    notes: notes || "",
    salary: salary || "",
    jobUrl: jobUrl || "",
    columnId,
    boardId,
    userId: session.user.id,
    tags: tags || [],
    description: description || "",
    status: "applied",
    order: maxOrder ? maxOrder.order + 1 : 0,
    jobDetails: {
      company,
      salary: salary || "",
      jobUrl: jobUrl || "",
    },
  });

  if (!jobApplication) {
    return { error: "Failed to create job application" };
  }

  revalidatePath("/dashboard");

  return { data: JSON.parse(JSON.stringify(jobApplication)) };
}

export async function createTaskCard(data: TaskCardInput) {
  const session = await getSession();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  if (!data || typeof data.title !== "string") {
    return { error: "Task details are invalid" };
  }
  const title = data.title.trim();
  if (!title || title.length > 200 || !data.columnId || !data.boardId) {
    return { error: "Task title, board, and column are required" };
  }
  if (
    data.priority !== undefined &&
    !["low", "medium", "high"].includes(data.priority)
  ) {
    return { error: "Priority is invalid" };
  }
  if (
    data.effort !== undefined &&
    !["light", "moderate", "heavy"].includes(data.effort)
  ) {
    return { error: "Effort level is invalid" };
  }
  if (
    data.estimatedDurationMinutes !== undefined &&
    (!Number.isInteger(data.estimatedDurationMinutes) ||
      data.estimatedDurationMinutes < 5 ||
      data.estimatedDurationMinutes > 480)
  ) {
    return { error: "Estimated duration must be from 5 to 480 minutes" };
  }
  if (
    (data.isMyDay !== undefined && typeof data.isMyDay !== "boolean") ||
    (data.repeatDaily !== undefined && typeof data.repeatDaily !== "boolean")
  ) {
    return { error: "Task options are invalid" };
  }
  if (
    data.dueDate !== undefined &&
    typeof data.dueDate !== "string"
  ) {
    return { error: "Due date is invalid" };
  }

  await connectDB();

  const board = await Board.findOne({
    _id: data.boardId,
    userId: session.user.id,
  });
  if (!board || (board.boardType ?? "job_tracker") === "job_tracker") {
    return { error: "Task board not found" };
  }

  const column = await Column.findOne({
    _id: data.columnId,
    boardId: board._id,
  });
  if (!column) {
    return { error: "Column not found" };
  }

  const maxOrder = await JobApplication.findOne({ columnId: column._id })
    .sort({ order: -1 })
    .select("order")
    .lean();
  const dueDate = data.dueDate
    ? new Date(`${data.dueDate}T00:00:00.000Z`)
    : undefined;
  if (dueDate && Number.isNaN(dueDate.getTime())) {
    return { error: "Due date is invalid" };
  }

  const card = await JobApplication.create({
    title,
    position: title,
    company: "",
    boardId: board._id,
    columnId: column._id,
    userId: session.user.id,
    order: maxOrder ? maxOrder.order + 1 : 0,
    dueDate,
    priority: data.priority ?? "medium",
    effort: data.effort,
    estimatedDurationMinutes: data.estimatedDurationMinutes ?? 30,
    isMyDay: data.isMyDay ?? false,
    myDayDate: data.isMyDay ? utcDayStart() : undefined,
    repeatDaily: data.repeatDaily ?? false,
  });

  revalidatePath("/dashboard");
  revalidatePath("/my-day");
  return { data: JSON.parse(JSON.stringify(card)) };
}

export async function updateCardDetails(cardId: string, data: CardDetailsInput) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  if (!data || typeof data.title !== "string") {
    return { error: "Card details are invalid" };
  }
  const title = data.title.trim();
  if (!cardId || !title || title.length > 200) {
    return { error: "Card title must be between 1 and 200 characters" };
  }
  if (data.priority && !["low", "medium", "high"].includes(data.priority)) {
    return { error: "Priority is invalid" };
  }
  if (
    data.effort !== undefined &&
    data.effort !== null &&
    !["light", "moderate", "heavy"].includes(data.effort)
  ) {
    return { error: "Effort level is invalid" };
  }
  if (
    data.estimatedDurationMinutes !== undefined &&
    (!Number.isInteger(data.estimatedDurationMinutes) ||
      data.estimatedDurationMinutes < 5 ||
      data.estimatedDurationMinutes > 480)
  ) {
    return { error: "Estimated duration must be from 5 to 480 minutes" };
  }
  if (
    (data.isMyDay !== undefined && typeof data.isMyDay !== "boolean") ||
    (data.repeatDaily !== undefined && typeof data.repeatDaily !== "boolean")
  ) {
    return { error: "Card options are invalid" };
  }
  if (
    data.dueDate !== undefined &&
    data.dueDate !== null &&
    typeof data.dueDate !== "string"
  ) {
    return { error: "Due date is invalid" };
  }
  if (
    data.subtasks !== undefined &&
    !Array.isArray(data.subtasks)
  ) {
    return { error: "Subtasks are invalid" };
  }
  if (
    data.subtasks &&
    (data.subtasks.length > 50 ||
      data.subtasks.some(
        (subtask) =>
          !subtask ||
          typeof subtask.title !== "string" ||
          !subtask.title.trim() ||
          subtask.title.length > 200 ||
          !subtask.id,
      ))
  ) {
    return { error: "Subtasks must have a title and be limited to 50" };
  }

  const dueDate = data.dueDate
    ? new Date(`${data.dueDate}T00:00:00.000Z`)
    : null;
  if (dueDate && Number.isNaN(dueDate.getTime())) {
    return { error: "Due date is invalid" };
  }

  await connectDB();
  const card = await JobApplication.findOne({
    _id: cardId,
    userId: session.user.id,
  });
  if (!card) {
    return { error: "Card not found" };
  }

  const board = await Board.findOne({
    _id: card.boardId,
    userId: session.user.id,
  }).select("boardType");
  if (!board) {
    return { error: "Board not found" };
  }

  const update: Record<string, unknown> = {
    title,
    position: title,
    dueDate,
  };
  const unset: Record<string, 1> = {};
  if (data.location !== undefined) update.location = data.location.trim();
  if (data.notes !== undefined) update.notes = data.notes.trim();
  if (data.tags !== undefined) update.tags = data.tags;
  if (data.description !== undefined) update.description = data.description.trim();
  if (data.priority !== undefined) update.priority = data.priority;
  if (data.subtasks !== undefined) update.subtasks = data.subtasks;
  if (data.repeatDaily !== undefined) update.repeatDaily = data.repeatDaily;
  if (
    (board.boardType ?? "job_tracker") !== "job_tracker" &&
    data.estimatedDurationMinutes !== undefined
  ) {
    update.estimatedDurationMinutes = data.estimatedDurationMinutes;
  } else if ((board.boardType ?? "job_tracker") === "job_tracker") {
    unset.estimatedDurationMinutes = 1;
    unset.effort = 1;
  } else if (data.effort === null) {
    unset.effort = 1;
  } else if (data.effort !== undefined) {
    update.effort = data.effort;
  }

  if ((board.boardType ?? "job_tracker") === "job_tracker") {
    const company = data.company?.trim() ?? card.jobDetails?.company ?? card.company ?? "";
    const salary = data.salary?.trim() ?? card.jobDetails?.salary ?? card.salary ?? "";
    const jobUrl = data.jobUrl?.trim() ?? card.jobDetails?.jobUrl ?? card.jobUrl ?? "";
    update.company = company;
    update.salary = salary;
    update.jobUrl = jobUrl;
    if (company || salary || jobUrl) {
      update.jobDetails = { company, salary, jobUrl };
    } else {
      unset.jobDetails = 1;
    }
  }

  if (data.isMyDay !== undefined && data.isMyDay !== card.isMyDay) {
    update.isMyDay = data.isMyDay;
    if (data.isMyDay) update.myDayDate = utcDayStart();
    update.myDayDismissedDate = data.isMyDay ? null : utcDayStart();
  }

  await JobApplication.updateOne(
    { _id: card._id, userId: session.user.id },
    {
      $set: update,
      ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
    },
    { runValidators: true },
  );

  revalidatePath("/dashboard");
  revalidatePath("/my-day");
  return { success: true };
}

export async function setCardCompletion(cardId: string, isCompleted: boolean) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await connectDB();
  const card = await JobApplication.findOne({
    _id: cardId,
    userId: session.user.id,
  });
  if (!card) {
    return { error: "Card not found" };
  }

  const board = await Board.findOne({
    _id: card.boardId,
    userId: session.user.id,
  }).select("boardType");
  let targetColumn: Awaited<ReturnType<typeof Column.findOne>> = null;

  if (board && (board.boardType ?? "job_tracker") !== "job_tracker") {
    const targetName = isCompleted ? "done" : "todo";
    const taskColumns = await Column.find({ boardId: card.boardId }).select(
      "name",
    );
    targetColumn =
      taskColumns.find(
        (column) =>
          column.name.trim().toLowerCase().replace(/[\s_-]/g, "") ===
          targetName,
      ) ?? null;
  }

  if (!isCompleted) {
    card.isCompleted = false;
    card.completedAt = undefined;
  } else if (!card.isCompleted) {
    const now = new Date();
    if (card.repeatDaily) {
      const today = utcDayStart(now);
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const lastCompleted = card.lastCompletedAt?.getTime();
      const lastDay =
        lastCompleted === undefined
          ? null
          : utcDayStart(new Date(lastCompleted));
      const streakCount =
        lastDay?.getTime() === today.getTime()
          ? card.streakCount
          : lastDay?.getTime() === yesterday.getTime()
            ? card.streakCount + 1
            : 1;
      card.streakCount = streakCount;
      card.lastCompletedAt = now;
    }

    card.isCompleted = true;
    card.completedAt = now;
  }

  if (
    targetColumn &&
    card.columnId.toString() !== targetColumn._id.toString()
  ) {
    const maxOrder = await JobApplication.findOne({
      columnId: targetColumn._id,
    })
      .sort({ order: -1 })
      .select("order")
      .lean();
    card.columnId = targetColumn._id;
    card.order = maxOrder ? maxOrder.order + 1 : 0;
  }

  await card.save();
  revalidatePath("/dashboard");
  revalidatePath("/my-day");
  return { success: true };
}

export async function updateJobApplication(
  jobId: string,
  data: Partial<Omit<JobApplicationInput, "boardId">>
) {
  const session = await getSession();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await connectDB();

  const existing = await JobApplication.findOne({
    _id: jobId,
    userId: session.user.id,
  });

  if (!existing) {
    return { error: "Job application not found" };
  }

  const updateFields: Record<string, unknown> = {};
  if (data.position !== undefined) updateFields.title = data.position;
  if (data.company !== undefined) updateFields.company = data.company;
  if (data.position !== undefined) updateFields.position = data.position;
  if (data.location !== undefined) updateFields.location = data.location;
  if (data.salary !== undefined) updateFields.salary = data.salary;
  if (data.jobUrl !== undefined) updateFields.jobUrl = data.jobUrl;
  if (data.tags !== undefined) updateFields.tags = data.tags;
  if (data.description !== undefined) updateFields.description = data.description;
  if (data.notes !== undefined) updateFields.notes = data.notes;
  if (data.company !== undefined) {
    updateFields.jobDetails = {
      company: data.company,
      salary: data.salary ?? existing.salary ?? "",
      jobUrl: data.jobUrl ?? existing.jobUrl ?? "",
    };
  }
  if (data.columnId !== undefined) updateFields.columnId = data.columnId;

  const updated = await JobApplication.findByIdAndUpdate(jobId, updateFields, {
    new: true,
  });

  revalidatePath("/dashboard");
  revalidatePath("/my-day");
  return { data: JSON.parse(JSON.stringify(updated)) };
}

export async function deleteJobApplication(jobId: string) {
  const session = await getSession();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await connectDB();

  const deleted = await JobApplication.findOneAndDelete({
    _id: jobId,
    userId: session.user.id,
  });

  if (!deleted) {
    return { error: "Job application not found or unauthorized" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/my-day");
  return { success: true };
}

export async function moveJobApplication(jobId: string, targetColumnId: string) {
  const session = await getSession();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await connectDB();

  const job = await JobApplication.findOne({
    _id: jobId,
    userId: session.user.id,
  });

  if (!job) {
    return { error: "Job application not found" };
  }

  const targetColumn = await Column.findById(targetColumnId);
  if (!targetColumn) {
    return { error: "Target column not found" };
  }

  const maxOrder = (await JobApplication.findOne({ columnId: targetColumnId })
    .sort({ order: -1 })
    .select("order")
    .lean()) as { order: number } | null;

  job.columnId = targetColumnId;
  job.order = maxOrder ? maxOrder.order + 1 : 0;
  await job.save();

  revalidatePath("/dashboard");
  revalidatePath("/my-day");
  return { success: true };
}

export async function deleteColumn(columnId: string, boardId: string) {
  const session = await getSession();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await connectDB();

  const board = await Board.findOne({ _id: boardId, userId: session.user.id });
  if (!board) {
    return { error: "Board not found or unauthorized" };
  }

  // Delete all jobs in this column
  await JobApplication.deleteMany({ columnId, userId: session.user.id });

  // Delete the column itself
  await Column.deleteOne({ _id: columnId, boardId });

  // Pull column from board
  await Board.updateOne({ _id: boardId }, { $pull: { columns: columnId } });

  revalidatePath("/dashboard");
  revalidatePath("/my-day");
  return { success: true };
}
