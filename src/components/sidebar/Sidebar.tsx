// src/components/sidebar/Sidebar.tsx
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useAuth } from "@/hooks/useAuth";
import { getIconComponent } from "@/lib/icon-mappings";

export default function Sidebar() {
  const { user } = useAuth();
  const { getAccessibleModules } = useRoleAccess();
  const modules = getAccessibleModules();

  if (!user) {
    return null; // Or loading state
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://picsum.photos/seed/logo/200/200"
            alt="Company Logo"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="text-lg font-semibold">ClaspCRM</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-auto py-2">
        <ul className="space-y-1 px-2">
          {/* Dashboard Link (always visible) */}
          <li>
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
                <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
              </Link>
            </Button>
          </li>

          {/* Role-based modules */}
          {modules.map((module) => {
            const IconComponent = getIconComponent(module.icon);
            return (
              <li key={module.id}>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <Link href={module.path}>
                    <IconComponent className="h-4 w-4" />
                    {module.name}
                    <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Image
            src="https://picsum.photos/seed/user/200/200"
            alt="User Avatar"
            width={32}
            height={32}
            className="rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            <p className="truncate text-xs text-muted-foreground mt-1">
              {user.department?.name || "No department"}
              {/* {user.managedDepartment &&
                ` • Manages ${user.managedDepartment.name}`} */}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
