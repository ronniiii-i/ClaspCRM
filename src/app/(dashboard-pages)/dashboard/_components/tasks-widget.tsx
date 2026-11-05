// src/app/(dashboard-pages)/dashboard/_components/tasks-widget.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Task } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, Check, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { useWorkspaceRecordMutations } from "@/hooks/workspace/useWorkspaceRecords";
import { moduleLocation } from "@/lib/workspace-navigation";
import { formatDateTime } from "@/lib/format";

interface TasksWidgetProps {
  tasks: Task[];
}

export function TasksWidget({ tasks }: TasksWidgetProps) {
  const { modules } = usePermissions();
  const queryClient = useQueryClient();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const taskModule = useMemo(
    () =>
      modules.find((module) => {
        const searchable = `${module.key ?? ""} ${module.name} ${module.targetEntity ?? ""}`.toLowerCase();
        return searchable.includes("task");
      }),
    [modules],
  );
  const { deptKey, moduleKey } = taskModule
    ? moduleLocation({
        key: taskModule.key ?? "",
        path: taskModule.path,
        department:
          typeof taskModule.department === "object"
            ? taskModule.department
            : undefined,
      })
    : { deptKey: "", moduleKey: "" };
  const mutations = useWorkspaceRecordMutations(deptKey, moduleKey);

  async function completeTask(taskId: string) {
    if (!taskModule) return;
    setCompletingId(taskId);
    setActionError(null);
    try {
      await mutations.transition.mutateAsync({ id: taskId, status: "completed" });
      await queryClient.invalidateQueries({
        queryKey: ["dashboard", "widgets"],
      });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not complete the task.",
      );
    } finally {
      setCompletingId(null);
    }
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Tasks</CardTitle>
          {taskModule ? (
            <Button asChild size="sm" variant="outline">
              <Link href={taskModule.path}>View all tasks</Link>
            </Button>
          ) : null}
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Tasks ({tasks.length})</CardTitle>
        {taskModule ? (
          <Button asChild size="sm" variant="outline">
            <Link href={taskModule.path}>
              <ListTodo className="mr-2 size-4" />
              View all tasks
            </Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3">
              <div className="mt-1">
                {task.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : task.dueSoon ? (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {taskModule ? (
                  <Link
                    href={`${taskModule.path}/${task.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {task.title}
                  </Link>
                ) : (
                  <p className="text-sm font-medium">{task.title}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Due: {formatDateTime(task.dueDate)}
                  {task.project && ` • ${task.project}`}
                </p>
              </div>
              {task.status === "in-progress" && (
                <Progress value={task.progress} className="h-2 w-20" />
              )}
              {task.status !== "completed" && taskModule ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={`Mark ${task.title} as completed`}
                  disabled={completingId === task.id}
                  onClick={() => void completeTask(task.id)}
                >
                  <Check className="size-4" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        {actionError ? (
          <p className="mt-4 text-sm text-destructive">{actionError}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
