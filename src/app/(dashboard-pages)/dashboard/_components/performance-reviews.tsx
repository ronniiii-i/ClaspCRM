"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PerformanceReview } from "../types";

interface PerformanceReviewProps {
  reviews: PerformanceReview[];
}

export function PerformanceReviews({ reviews }: PerformanceReviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map(review => (
              <TableRow key={review.id}>
                <TableCell>{review.employee}</TableCell>
                <TableCell>{review.position}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-100 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          review.rating >= 4 ? 'bg-green-500' :
                          review.rating >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${review.rating * 20}%` }}
                      />
                    </div>
                    <span>{review.rating}/5</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    review.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {review.status}
                  </span>
                </TableCell>
                <TableCell>{review.dueDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}