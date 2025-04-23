// src/app/(dashboard-pages)/dashboard/_components/tasks-widget.tsx
"use client";

import { Task } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface TasksWidgetProps {
  tasks: Task[];
}

export function TasksWidget({ tasks }: TasksWidgetProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No tasks assigned currently
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Tasks ({tasks.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-4">
              <div className="mt-1">
                {task.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : task.dueSoon ? (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  Due: {task.dueDate}
                  {task.project && ` • ${task.project}`}
                </p>
              </div>
              {task.status === "in-progress" && (
                <Progress value={task.progress} className="h-2 w-20" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
