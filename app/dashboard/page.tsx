import { Suspense } from "react";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { getSession } from "@/lib/auth/auth";
import { KanbanBoard } from "@/components/KabanBoard";
import { Spinner } from "@/components/ui/spinner";
import BoardHeader from "@/components/boardHeader";
import EmptyBoardState from "@/components/emptyBoardState";

interface DashboardPageProps {
  searchParams?: Promise<{ boardId?: string }>;
}

async function getUserBoards(userId: string, requestedBoardId?: string) {
  await connectDB();

  const allBoards = await Board.find({ userId })
    .select("_id name createdAt")
    .sort({ createdAt: 1 });

  if (!allBoards || allBoards.length === 0) {
    return {
      boards: [],
      activeBoard: null,
    };
  }

  let activeBoardDoc = null;
  if (requestedBoardId) {
    activeBoardDoc = await Board.findOne({
      _id: requestedBoardId,
      userId,
    }).populate({
      path: "columns",
      populate: {
        path: "jobApplications",
      },
    });
  }

  if (!activeBoardDoc) {
    activeBoardDoc = await Board.findOne({
      _id: allBoards[0]._id,
      userId,
    }).populate({
      path: "columns",
      populate: {
        path: "jobApplications",
      },
    });
  }

  return {
    boards: JSON.parse(JSON.stringify(allBoards)),
    activeBoard: activeBoardDoc ? JSON.parse(JSON.stringify(activeBoardDoc)) : null,
  };
}

async function DashboardContent({ searchParams }: DashboardPageProps) {
  const params = searchParams ? await searchParams : undefined;

  const session = await getSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { boards, activeBoard } = await getUserBoards(
    session.user.id,
    params?.boardId
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-7xl px-6 py-6">
        {activeBoard ? (
          <>
            <BoardHeader
              boards={boards}
              currentBoardId={activeBoard._id}
              currentBoardName={activeBoard.name}
            />
            <KanbanBoard board={activeBoard} userId={session.user.id} />
          </>
        ) : (
          <EmptyBoardState />
        )}
      </div>
    </div>
  );
}

export default async function Dashboard({ searchParams }: DashboardPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-white dark:bg-zinc-950">
          <Spinner className="size-8 text-primary" />
        </div>
      }
    >
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}
