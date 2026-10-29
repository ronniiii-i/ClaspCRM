/**
 * The dashboard implementation lives in the apex `(dashboard-pages)` route
 * group. Tenant workspaces are the canonical way to reach the app, so the
 * tenant route renders that same implementation rather than a placeholder.
 *
 * Every data request made by the dashboard is scoped by the caller's JWT
 * tenant, so rendering it under a subdomain does not widen data access.
 */
export { default } from "../../../../(dashboard-pages)/dashboard/page";
