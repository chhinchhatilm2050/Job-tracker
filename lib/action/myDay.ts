"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board, DailyPlan, JobApplication, Column } from "../models";
import { buildDailySchedule } from "../dailyPlanning";
import { parseBrainDump } from "../brainDumpParser";
import { initializeUserBoard } from "../initUserBoard";
import type {
  DailyPlanData,
  EnergyLevel,
  MyDayCard,
} from "../models/models.types";

function utcDayStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function getOrCreateDailyPlan(userId: string, date = utcDayStart()) {
  return DailyPlan.findOneAndUpdate(
    { userId, date },
    {
      $setOnInsert: {
        userId,
        date,
        availableHours: 6,
        startMinute: 9 * 60,
        schedule: [],
        focusEntries: [],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

async function resetRecurringTasksForUser(userId: string) {
  const today = utcDayStart();
  await JobApplication.updateMany(
    {
      userId,
      repeatDaily: true,
      isCompleted: true,
      completedAt: { $lt: today },
    },
    {
      $set: { isCompleted: false },
      $unset: { completedAt: 1 },
    },
  );
}

async function getOrCreateDailyTasksBoard(userId: string) {
  let board = await Board.findOne({
    userId,
    name: "Daily Tasks",
    boardType: "general_tasks",
  });

  if (!board) {
    const legacyBoard = await Board.findOne({
      userId,
      name: "Daily Tasks",
      boardType: { $exists: false },
    });
    if (legacyBoard) {
      legacyBoard.boardType = "general_tasks";
      await legacyBoard.save();
      board = legacyBoard;
    }
  }

  if (!board) {
    board = await Board.create({
      name: "Daily Tasks",
      userId,
      boardType: "general_tasks",
      columns: [],
    });
  }

  let todoColumn = await Column.findOne({
    boardId: board._id,
    name: "To Do",
  }).sort({ order: 1 });

  if (!todoColumn) {
    const defaults = [
      { name: "To Do", color: "cyan" },
      { name: "Doing", color: "violet" },
      { name: "Done", color: "emerald" },
    ];
    const createdColumns = await Promise.all(
      defaults.map((column, order) =>
        Column.create({ ...column, order, boardId: board._id }),
      ),
    );
    board.columns = createdColumns.map((column) => column._id);
    await board.save();
    todoColumn = createdColumns[0];
  }

  return { board, todoColumn };
}

export async function getMyDayCards() {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await connectDB();
  await resetRecurringTasksForUser(session.user.id);

  const today = utcDayStart();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const plan = await getOrCreateDailyPlan(session.user.id, today);
  await getOrCreateDailyTasksBoard(session.user.id);
  const boards = await Board.find({ userId: session.user.id })
    .select("_id name boardType")
    .sort({ createdAt: 1 })
    .lean();
  const boardById = new Map(boards.map((board) => [String(board._id), board]));
  const cards = await JobApplication.find({
    userId: session.user.id,
    boardId: { $in: boards.map((board) => board._id) },
    isCompleted: { $ne: true },
    $and: [
      {
        $or: [{ isMyDay: true }, { dueDate: { $lt: tomorrow } }],
      },
      {
        $or: [
          { myDayDismissedDate: { $exists: false } },
          { myDayDismissedDate: null },
          { myDayDismissedDate: { $lt: today } },
        ],
      },
    ],
  })
    .sort({ isMyDay: -1, dueDate: 1, createdAt: 1 })
    .lean();

  const columnIds = [...new Set(cards.map((card) => String(card.columnId)))];
  const columns = await Column.find({ _id: { $in: columnIds } })
    .select("_id name")
    .lean();
  const columnById = new Map(columns.map((column) => [String(column._id), column]));
  const scheduleByCardId = new Map(
    plan.schedule.map((block) => [
      String(block.cardId),
      {
        startMinute: block.startMinute,
        durationMinutes: block.durationMinutes,
      },
    ]),
  );

  const data = cards.map((card) => {
    const board = boardById.get(String(card.boardId));
    const column = columnById.get(String(card.columnId));
    const dueDate = card.dueDate ? new Date(card.dueDate) : null;
    const myDayDate = card.myDayDate ? new Date(card.myDayDate) : null;

    return {
      ...card,
      _id: String(card._id),
      boardId: String(card.boardId),
      columnId: String(card.columnId),
      boardName: board?.name ?? "Board",
      boardType: board?.boardType ?? "job_tracker",
      estimatedDurationMinutes:
        board?.boardType === "job_tracker"
          ? undefined
          : card.estimatedDurationMinutes,
      columnName: column?.name ?? "Column",
      scheduledStartMinute: scheduleByCardId.get(String(card._id))?.startMinute,
      scheduledDurationMinutes: scheduleByCardId.get(String(card._id))?.durationMinutes,
      isCarryOver:
        Boolean(card.isMyDay && (!myDayDate || myDayDate < today)) ||
        Boolean(
          dueDate &&
            dueDate < today &&
            (!card.isMyDay || !myDayDate || myDayDate < today),
        ),
    };
  });

  const planData: DailyPlanData = {
    availableHours: plan.availableHours,
    startMinute: plan.startMinute ?? 9 * 60,
    energyLevel: plan.energyLevel,
    schedule: plan.schedule.map((block) => ({
      cardId: String(block.cardId),
      startMinute: block.startMinute,
      durationMinutes: block.durationMinutes,
    })),
    focusEntries: plan.focusEntries.map((entry) => ({
      cardId: String(entry.cardId),
      title: entry.title,
      minutes: entry.minutes,
      loggedAt: entry.loggedAt,
    })),
  };
  return {
    data: JSON.parse(JSON.stringify(data)) as MyDayCard[],
    taskBoards: boards
      .filter((board) => (board.boardType ?? "job_tracker") !== "job_tracker")
      .map((board) => ({ id: String(board._id), name: board.name })),
    plan: JSON.parse(JSON.stringify(planData)) as DailyPlanData,
  };
}

export async function updateDailyPlanSettings(settings: {
  availableHours?: number;
  startMinute?: number;
  energyLevel?: EnergyLevel;
}) {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };
  if (!settings || typeof settings !== "object") {
    return { error: "Daily plan settings are invalid" };
  }

  if (
    settings.availableHours !== undefined &&
    (!Number.isInteger(settings.availableHours) ||
      settings.availableHours < 1 ||
      settings.availableHours > 9)
  ) {
    return { error: "Available hours must be between 1 and 9" };
  }
  if (
    settings.startMinute !== undefined &&
    (!Number.isInteger(settings.startMinute) ||
      settings.startMinute < 0 ||
      settings.startMinute >= 24 * 60)
  ) {
    return { error: "Choose a valid start time" };
  }
  if (
    settings.energyLevel !== undefined &&
    !["high", "normal", "low"].includes(settings.energyLevel)
  ) {
    return { error: "Energy level is invalid" };
  }

  await connectDB();
  const plan = await getOrCreateDailyPlan(session.user.id);
  const availableHours = settings.availableHours ?? plan.availableHours;
  const startMinute = settings.startMinute ?? plan.startMinute ?? 9 * 60;
  if (startMinute + availableHours * 60 > 24 * 60) {
    return {
      error: "Your start time and available hours must fit within the same day",
    };
  }
  if (settings.availableHours !== undefined) {
    plan.availableHours = settings.availableHours;
  }
  if (settings.startMinute !== undefined) {
    plan.startMinute = settings.startMinute;
  }
  if (settings.energyLevel !== undefined) {
    plan.energyLevel = settings.energyLevel;
  }
  plan.schedule = [];
  await plan.save();
  revalidatePath("/my-day");
  return { success: true };
}

export async function autoPlanMyDay() {
  const result = await getMyDayCards();
  if (result.error || !result.data || !result.plan) {
    return { error: result.error ?? "Could not load My Day tasks" };
  }

  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };
  await connectDB();

  const plan = await getOrCreateDailyPlan(session.user.id);
  if (!plan.energyLevel) {
    return { error: "Choose your energy level before planning your day" };
  }
  const energyLevel = plan.energyLevel;
  const scheduleResult = buildDailySchedule(
    result.data.map((card) => ({
      id: card._id,
      title: card.title || card.position,
      boardType: card.boardType,
      columnName: card.columnName,
      priority: card.priority,
      effort: card.effort,
      dueDate: card.dueDate,
      estimatedDurationMinutes: card.estimatedDurationMinutes,
    })),
    plan.availableHours,
    energyLevel,
    plan.startMinute ?? 9 * 60,
  );
  plan.schedule = scheduleResult.schedule.map((block) => ({
    cardId: new Types.ObjectId(block.cardId),
    startMinute: block.startMinute,
    durationMinutes: block.durationMinutes,
  }));
  await plan.save();

  revalidatePath("/my-day");
  return {
    success: true,
    data: {
      ...scheduleResult,
      availableHours: plan.availableHours,
      energyLevel,
    },
  };
}

export async function moveTasksToTomorrow(cardIds: string[]) {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };
  if (
    !Array.isArray(cardIds) ||
    cardIds.length === 0 ||
    cardIds.length > 100 ||
    cardIds.some(
      (cardId) => typeof cardId !== "string" || !Types.ObjectId.isValid(cardId),
    )
  ) {
    return { error: "Select at least one task to move" };
  }

  await connectDB();
  const today = utcDayStart();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const result = await JobApplication.updateMany(
    {
      _id: { $in: cardIds },
      userId: session.user.id,
      isCompleted: { $ne: true },
    },
    {
      $set: {
        dueDate: tomorrow,
        isMyDay: false,
        myDayDismissedDate: today,
      },
    },
  );
  const plan = await getOrCreateDailyPlan(session.user.id, today);
  plan.schedule = [];
  await plan.save();

  revalidatePath("/my-day");
  revalidatePath("/dashboard");
  return { success: true, movedCount: result.modifiedCount };
}

export async function logFocusMinutes(cardId: string, minutes: number) {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };
  if (
    typeof cardId !== "string" ||
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    minutes > 25
  ) {
    return { error: "Focus time must be between 1 and 25 minutes" };
  }

  await connectDB();
  const card = await JobApplication.findOne({
    _id: cardId,
    userId: session.user.id,
  });
  if (!card) return { error: "Card not found" };

  card.actualDurationMinutes = (card.actualDurationMinutes ?? 0) + minutes;
  await card.save();

  const plan = await getOrCreateDailyPlan(session.user.id);
  plan.focusEntries.push({
    cardId: card._id,
    title: card.title || card.position,
    minutes,
    loggedAt: new Date(),
  });
  await plan.save();

  revalidatePath("/my-day");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getDailyWrapUpSummary() {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };

  await connectDB();
  const today = utcDayStart();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const boards = await Board.find({
    userId: session.user.id,
    boardType: "job_tracker",
  }).select("_id");
  const [completedCards, applicationsAdded, plan] = await Promise.all([
    JobApplication.find({
      userId: session.user.id,
      isCompleted: true,
      completedAt: { $gte: today, $lt: tomorrow },
    }).select("title position"),
    JobApplication.countDocuments({
      userId: session.user.id,
      boardId: { $in: boards.map((board) => board._id) },
      createdAt: { $gte: today, $lt: tomorrow },
    }),
    getOrCreateDailyPlan(session.user.id, today),
  ]);
  return {
    data: {
      completedCount: completedCards.length,
      completedTitles: completedCards.map((card) => card.title || card.position),
      focusMinutes: plan.focusEntries.reduce(
        (total, entry) => total + entry.minutes,
        0,
      ),
      applicationsAdded,
    },
  };
}

export async function addQuickTaskToMyDay(title: string, boardId?: string) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  if (typeof title !== "string" || !title.trim() || title.trim().length > 200) {
    return { error: "Task title must be between 1 and 200 characters" };
  }
  const taskTitle = title.trim();

  await connectDB();

  let board;
  let todoColumn;
  if (boardId) {
    if (!Types.ObjectId.isValid(boardId)) {
      return { error: "Selected task board is invalid" };
    }
    board = await Board.findOne({
      _id: boardId,
      userId: session.user.id,
    });
    if (!board || (board.boardType ?? "job_tracker") === "job_tracker") {
      return { error: "Selected task board was not found" };
    }
    const columns = await Column.find({ boardId: board._id }).sort({
      order: 1,
    });
    todoColumn =
      columns.find(
        (column) =>
          column.name.trim().toLowerCase().replace(/[\s_-]/g, "") === "todo",
      ) ?? columns[0];
    if (!todoColumn) {
      return { error: "Selected task board does not have any columns" };
    }
  } else {
    ({ board, todoColumn } = await getOrCreateDailyTasksBoard(
      session.user.id,
    ));
  }

  const maxOrder = await JobApplication.findOne({ columnId: todoColumn._id })
    .sort({ order: -1 })
    .select("order")
    .lean();
  const today = utcDayStart();
  const card = await JobApplication.create({
    title: taskTitle,
    position: taskTitle,
    company: "",
    boardId: board._id,
    columnId: todoColumn._id,
    userId: session.user.id,
    order: maxOrder ? maxOrder.order + 1 : 0,
    isMyDay: true,
    myDayDate: today,
    priority: "medium",
    estimatedDurationMinutes: 30,
  });

  revalidatePath("/my-day");
  revalidatePath("/dashboard");
  return { success: true, cardId: String(card._id) };
}

export async function captureBrainDump(input: string) {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };
  if (typeof input !== "string" || !input.trim() || input.trim().length > 300) {
    return { error: "Enter a thought between 1 and 300 characters" };
  }

  const parsed = parseBrainDump(input);
  if (parsed.kind === "job" && parsed.company && parsed.position) {
    await connectDB();
    let board = await Board.findOne({
      userId: session.user.id,
      boardType: "job_tracker",
    }).sort({ createdAt: 1 });
    if (!board) {
      board = await initializeUserBoard(session.user.id);
    }

    const preferredColumnName = /interview/i.test(input)
      ? "Interviewing"
      : "Wish List";
    let column = await Column.findOne({
      boardId: board._id,
      name: preferredColumnName,
    });
    if (!column) {
      column = await Column.findOne({ boardId: board._id }).sort({ order: 1 });
    }
    if (!column) return { error: "Your job board has no columns" };

    const maxOrder = await JobApplication.findOne({ columnId: column._id })
      .sort({ order: -1 })
      .select("order")
      .lean();
    const dueDate = parsed.dueDate
      ? new Date(`${parsed.dueDate}T00:00:00.000Z`)
      : undefined;
    const card = await JobApplication.create({
      title: parsed.position,
      position: parsed.position,
      company: parsed.company,
      jobDetails: { company: parsed.company },
      boardId: board._id,
      columnId: column._id,
      userId: session.user.id,
      status: "applied",
      order: maxOrder ? maxOrder.order + 1 : 0,
      dueDate,
      priority: parsed.priority,
      isMyDay: true,
      myDayDate: utcDayStart(),
    });

    revalidatePath("/my-day");
    revalidatePath("/dashboard");
    return {
      success: true,
      data: {
        cardId: String(card._id),
        title: parsed.position,
        boardName: board.name,
        kind: parsed.kind,
      },
    };
  }

  await connectDB();
  const { board, todoColumn } = await getOrCreateDailyTasksBoard(
    session.user.id,
  );
  const maxOrder = await JobApplication.findOne({ columnId: todoColumn._id })
    .sort({ order: -1 })
    .select("order")
    .lean();
  const dueDate = parsed.dueDate
    ? new Date(`${parsed.dueDate}T00:00:00.000Z`)
    : undefined;
  const card = await JobApplication.create({
    title: parsed.title,
    position: parsed.title,
    company: "",
    boardId: board._id,
    columnId: todoColumn._id,
    userId: session.user.id,
    order: maxOrder ? maxOrder.order + 1 : 0,
    dueDate,
    priority: parsed.priority,
    estimatedDurationMinutes: parsed.estimatedDurationMinutes,
    isMyDay: true,
    myDayDate: utcDayStart(),
  });

  revalidatePath("/my-day");
  revalidatePath("/dashboard");
  return {
    success: true,
    data: {
      cardId: String(card._id),
      title: parsed.title,
      boardName: board.name,
      kind: parsed.kind,
    },
  };
}

export async function updateMyDayAssignment(
  cardId: string,
  action: "keep" | "remove",
) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  if (!cardId || !["keep", "remove"].includes(action)) {
    return { error: "Invalid My Day update" };
  }

  await connectDB();
  const update =
    action === "keep"
      ? {
          isMyDay: true,
          myDayDate: utcDayStart(),
          myDayDismissedDate: null,
        }
      : {
          isMyDay: false,
          myDayDismissedDate: utcDayStart(),
        };
  const result = await JobApplication.updateOne(
    { _id: cardId, userId: session.user.id },
    { $set: update },
  );

  if (!result.matchedCount) {
    return { error: "Card not found" };
  }

  revalidatePath("/my-day");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function resetRecurringTasks() {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await connectDB();
  await resetRecurringTasksForUser(session.user.id);
  revalidatePath("/my-day");
  revalidatePath("/dashboard");
  return { success: true };
}
