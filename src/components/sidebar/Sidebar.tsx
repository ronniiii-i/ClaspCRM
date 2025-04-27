// src/components/sidebar/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { getDepartmentModules } from "@/lib/department-modules";
import { Department, getIconComponent } from "@/lib/modules";

export default function Sidebar() {
  const { user } = useAuth();

  const {
    getAccessibleModules,
    currentRole,
    // canAccessDepartment
  } = useRoleAccess();

  if (!user) return null;

  // Merge role-specific and department-specific modules
  const allModules = [
    ...getAccessibleModules(),
    ...(currentRole === "HOD"
      ? getDepartmentModules(user.department?.name as Department)
      : []),
  ];

  console.log('====================================');
  console.log('allModules:', allModules);
  console.log('currentRole:', currentRole);
  console.log('user.department?.name:', user.department?.name);
  console.log('user:', user);
  console.log('====================================');

  return (
    <aside className="w-64 flex-col border-r bg-background flex h-full justify-between">
      {/* Logo/Header */}
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://picsum.photos/seed/logo/200/200"
            className="rounded-full"
            alt="Logo"
            width={32}
            height={32}
          />
          <span className="text-lg font-semibold">ClaspCRM</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto py-2">
        <ul className="space-y-1 px-2">
          {allModules.map((module) => {
            const Icon = getIconComponent(module.icon);
            return (
              <li key={module.id}>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <Link href={module.path}>
                    <Icon className="h-4 w-4" />
                    {module.name}
                    <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Image
            src={user.avatar || "https://picsum.photos/seed/user/200/200"}
            alt="User"
            width={32}
            height={32}
            className="rounded-full"
          />
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">
              {user.role === "ADMIN"
                ? "Administrator"
                : `${user.department?.name} • ${user.role} ` ||
                  "Department not assigned"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
