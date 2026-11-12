import { Suspense } from "react";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { getSession } from "@/lib/auth/auth";
import { KanbanBoard } from "@/components/KabanBoard";

async function DashboardContent() {
  const session = await getSession();
  await connectDB();
  const board = await Board.findOne({
    userId: session?.user.id,
    name: "Job Hunt",
  }).populate({
    path: "columns"
  }).lean();
  console.log(board);

  return( 
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">Job Hunt</h1>
          <p className="text-gray-600">Track your job application</p>
        </div>
        <KanbanBoard board={JSON.parse(JSON.stringify(board))} userId={session?.user.id}/>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DashboardContent />
    </Suspense>
  );
}