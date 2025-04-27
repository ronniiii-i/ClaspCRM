"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Task } from "../types";

// type Task = {
//   id: string;
//   title: string;
//   status: "not-started" | "in-progress" | "completed";
//   progress: number;
// };

export function TaskProgress({ tasks }: { tasks: Task[] }) {
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const completionRate = Math.round((completedTasks / tasks.length) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Task Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {completedTasks} of {tasks.length} tasks completed
          </p>
          <Progress value={completionRate} className="mt-2" />
        </div>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between">
              <span className="font-medium">{task.title}</span>
              <span
                className={`text-xs ${
                  task.status === "completed"
                    ? "text-green-500"
                    : task.status === "in-progress"
                    ? "text-yellow-500"
                    : "text-gray-500"
                }`}
              >
                {task.status}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
