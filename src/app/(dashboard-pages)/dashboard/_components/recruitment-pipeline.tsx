"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobOpening } from "../types";

interface JobOpeningProps {
  jobs: JobOpening[];
}

export function RecruitmentPipeline({ jobs }: JobOpeningProps) {
  const stages = [
    { id: "sourcing", name: "Sourcing", color: "bg-blue-100" },
    { id: "interviewing", name: "Interviewing", color: "bg-purple-100" },
    { id: "offer", name: "Offer", color: "bg-yellow-100" },
    { id: "filled", name: "Filled", color: "bg-green-100" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recruitment Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto gap-4 pb-4">
          {stages.map(stage => (
            <div key={stage.id} className={`${stage.color} min-w-[200px] rounded-lg p-4`}>
              <h3 className="font-medium mb-3">{stage.name}</h3>
              <div className="space-y-2">
                {jobs
                  .filter(job => job.status === stage.id)
                  .map(job => (
                    <div key={job.id} className="bg-white p-3 rounded border">
                      <p className="font-medium">{job.title}</p>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline">{job.department}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {job.applicants} applicants
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}