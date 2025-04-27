"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Training } from "../types";

interface TrainingProps {
  trainings: Training[];
}

export function TrainingManagement({ trainings }: TrainingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Programs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trainings.map(training => (
          <div key={training.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{training.name}</p>
                <p className="text-sm text-muted-foreground">
                  {training.participants} participants • {training.department}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                training.status === 'completed' ? 'bg-green-100 text-green-800' :
                training.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {training.status}
              </span>
            </div>
            <Progress value={training.completionRate} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}