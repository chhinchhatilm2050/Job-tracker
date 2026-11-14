"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board, Column, JobApplication } from "../models";
import { initializeUserBoard } from "../initUserBoard";

const DEFAULT_COLUMNS = [
  "Wish List",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
];

export async function createBoard(name: string, customColumns?: string[]) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const trimmedName = name?.trim();
  if (!trimmedName) {
    return { error: "Board name is required" };
  }

  await connectDB();

  try {
    const board = await Board.create({
      name: trimmedName,
      userId: session.user.id,
      columns: [],
    });

    const colList = (customColumns && customColumns.length > 0)
      ? customColumns.filter((c) => c.trim().length > 0)
      : DEFAULT_COLUMNS;

    const createdColumns = await Promise.all(
      colList.map((colName, index) =>
        Column.create({
          name: colName.trim(),
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

