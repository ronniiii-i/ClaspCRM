import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ModuleNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card px-6 py-16 text-center">
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Module not found
        </h1>
        <p className="text-sm text-muted-foreground">
          This module does not exist or is not available in this workspace.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
