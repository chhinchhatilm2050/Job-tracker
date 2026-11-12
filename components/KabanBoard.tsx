"use client";

import { Board, Column } from "@/lib/models/models.types";
import { Award, Calendar, CheckCircle2, Mic, MoreVertical, Trash2, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";

interface KanbanBoardProps {
  board: Board;
  userId: string | undefined;
}

interface ColConfig {
  color: string;
  icon: React.ReactNode;
}

const COLUMN_CONFIG: Array<{ color: string; icon: React.ReactNode }> = [
  {
    color: "bg-cyan-500",
    icon: <Calendar />,
  },
  {
    color: "bg-purple-500",
    icon: <CheckCircle2 />,
  },
  {
    color: "bg-green-500",
    icon: <Mic />,
  },
  {
    color: "bg-yellow-500",
    icon: <Award />,
  },
  {
    color: "bg-red-500",
    icon: <XCircle />,
  },
];

function DroppableColumn({
  column,
  config,
  boardId,
}: {
  column: Column;
  config: ColConfig;
  boardId: string;
}) {
  return (
    <Card className="min-w-[300px]  shadow-md p-0">
      <CardHeader className={`${config.color} text-white flex justify-between rounded-t-lg pb-3 pt-3`}>
        <div className="flex  flex-row justify-between">
          <div className="flex items-center gap-2">
            {config.icon}
            <CardTitle className="text-white text-base font-semibold">
              {column.name}
            </CardTitle>
          </div>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white cursor-pointer hover:bg-white/20">
                    <MoreVertical />
                </Button>
            </DropdownMenuTrigger >
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem className="text-destructive">
                       <Trash2 className="mr-2 h-4 w-4"/>  Delete Column
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
    </Card>
  )
}

export function KanbanBoard({ board, userId }: KanbanBoardProps) {
  const columns = board.columns;
  return (
    <>
      <div>
        <div>
          {columns.map((col, key) => {
            const config = COLUMN_CONFIG[key] || {
              color: "bg-gray-500",
              icon: <Calendar className="h-4 w-4" />,
            };
            return (
              <DroppableColumn
                key={key}
                column={col}
                config={config}
                boardId={board._id}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
