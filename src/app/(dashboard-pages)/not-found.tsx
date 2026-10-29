import { DashboardNotFound } from "@/components/not-found/DashboardNotFound";

/**
 * `notFound()` thrown by any page inside the dashboard route group lands here.
 * The group layout already supplies the shell, so this only renders the body.
 */
export default function DashboardNotFoundPage() {
  return <DashboardNotFound />;
}
