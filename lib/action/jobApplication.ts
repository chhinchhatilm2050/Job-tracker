"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board, Column, JobApplication } from "../models";

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
  const column = await Column.findOne({ _id: columnId, boardId: boardId });

  if (!column) {
    return { error: "Column not found" };
  }

  const maxOrder = (await JobApplication.findOne({ columnId })
    .sort({ order: -1 })
    .select("order")
    .lean()) as { order: number } | null;

  const jobApplication = await JobApplication.create({
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
  });

  if (!jobApplication) {
    return { error: "Failed to create job application" };
  }

  revalidatePath("/dashboard");

  return { data: JSON.parse(JSON.stringify(jobApplication)) };
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
  if (data.company !== undefined) updateFields.company = data.company;
  if (data.position !== undefined) updateFields.position = data.position;
  if (data.location !== undefined) updateFields.location = data.location;
  if (data.salary !== undefined) updateFields.salary = data.salary;
  if (data.jobUrl !== undefined) updateFields.jobUrl = data.jobUrl;
  if (data.tags !== undefined) updateFields.tags = data.tags;
  if (data.description !== undefined) updateFields.description = data.description;
  if (data.notes !== undefined) updateFields.notes = data.notes;
  if (data.columnId !== undefined) updateFields.columnId = data.columnId;

  const updated = await JobApplication.findByIdAndUpdate(jobId, updateFields, {
    new: true,
  });

  revalidatePath("/dashboard");

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
  return { success: true };
}
