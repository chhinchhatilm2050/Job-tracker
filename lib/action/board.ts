"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board, Column, JobApplication } from "../models";
import { initializeUserBoard } from "../initUserBoard";
import type { ColumnColor } from "../models/models.types";

const BOARD_TYPES = ["job_tracker", "general_tasks", "habits"] as const;
const COLUMN_COLORS = [
  "cyan",
  "violet",
  "emerald",
  "amber",
  "rose",
  "blue",
  "slate",
] as const;

interface BoardColumnInput {
  name: string;
  color: ColumnColor;
}

export async function createBoard(data: {
  name: string;
  boardType: (typeof BOARD_TYPES)[number];
  columns: BoardColumnInput[];
}) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  if (!data || typeof data.name !== "string" || !Array.isArray(data.columns)) {
    return { error: "Board details are invalid" };
  }
  const trimmedName = data.name.trim();
  if (!trimmedName || trimmedName.length > 60) {
    return { error: "Board name must be between 1 and 60 characters" };
  }
  if (!BOARD_TYPES.includes(data.boardType)) {
    return { error: "Board type is invalid" };
  }
  if (
    data.columns.some(
      (column) => !column || typeof column.name !== "string",
    )
  ) {
    return { error: "Column details are invalid" };
  }

  const columns = data.columns
    .map((column) => ({
      name: column.name.trim(),
      color: column.color,
    }))
    .filter((column) => column.name.length > 0);

  if (
    columns.length === 0 ||
    columns.length > 12 ||
    columns.some((column) => column.name.length > 40)
  ) {
    return { error: "A board must have between 1 and 12 columns, each up to 40 characters" };
  }
  if (columns.some((column) => !COLUMN_COLORS.includes(column.color))) {
    return { error: "Column color is invalid" };
  }

  await connectDB();

  try {
    const board = await Board.create({
      name: trimmedName,
      userId: session.user.id,
      boardType: data.boardType,
      columns: [],
    });

    const createdColumns = await Promise.all(
      columns.map((column, index) =>
        Column.create({
          name: column.name,
          color: column.color,
          order: index,
          boardId: board._id,
        })
      )
    );

    board.columns = createdColumns.map((c) => c._id);
    await board.save();

    revalidatePath("/dashboard");
    return { success: true, boardId: String(board._id) };
  } catch (err: unknown) {
    console.error("Failed to create board:", err);
    const message = err instanceof Error ? err.message : "Failed to create board";
    return { error: message };
  }
}

export async function addColumn(
  boardId: string,
  name: string,
  color: ColumnColor,
) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  if (typeof boardId !== "string" || !boardId) {
    return { error: "Board ID is required" };
  }
  if (typeof name !== "string" || !name.trim() || name.trim().length > 40) {
    return { error: "Column name must be between 1 and 40 characters" };
  }
  if (!COLUMN_COLORS.includes(color)) {
    return { error: "Column color is invalid" };
  }

  await connectDB();

  try {
    const board = await Board.findOne({
      _id: boardId,
      userId: session.user.id,
    });
    if (!board) {
      return { error: "Board not found or unauthorized" };
    }

    const columnCount = await Column.countDocuments({ boardId });
    if (columnCount >= 12) {
      return { error: "A board can have no more than 12 columns" };
    }

    const lastColumn = await Column.findOne({ boardId })
      .sort({ order: -1 })
      .select("order")
      .lean();
    const column = await Column.create({
      name: name.trim(),
      color,
      order: lastColumn ? lastColumn.order + 1 : 0,
      boardId: board._id,
    });

    board.columns.push(column._id);
    await board.save();

    revalidatePath("/dashboard");
    return { success: true, columnId: String(column._id) };
  } catch (err: unknown) {
    console.error("Failed to add column:", err);
    const message = err instanceof Error ? err.message : "Failed to add column";
    return { error: message };
  }
}

export async function deleteBoard(boardId: string) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  if (!boardId) {
    return { error: "Board ID is required" };
  }

  await connectDB();

  try {
    const board = await Board.findOne({ _id: boardId, userId: session.user.id });
    if (!board) {
      return { error: "Board not found or unauthorized" };
    }

    // 1. Permanently delete all job applications belonging to this board
    await JobApplication.deleteMany({ boardId, userId: session.user.id });

    // 2. Permanently delete all columns belonging to this board
    await Column.deleteMany({ boardId });

    // 3. Permanently delete the board itself
    await Board.deleteOne({ _id: boardId, userId: session.user.id });

    revalidatePath("/dashboard");
    revalidatePath("/my-day");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete board:", err);
    const message = err instanceof Error ? err.message : "Failed to delete board";
    return { error: message };
  }
}

export async function initDefaultBoardAction() {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await connectDB();
  try {
    const board = await initializeUserBoard(session.user.id);
    revalidatePath("/dashboard");
    return { success: true, boardId: String(board._id) };
  } catch (err: unknown) {
    console.error("Failed to initialize board:", err);
    const message = err instanceof Error ? err.message : "Failed to initialize board";
    return { error: message };
  }
}

