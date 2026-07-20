"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type ThemeOption = {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const THEME_OPTIONS: ThemeOption[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your preferences
        </p>
      </div>

      {/* Appearance */}
      <section className="p-4 bg-card border rounded-lg space-y-4">
        <h2 className="font-semibold">Appearance</h2>
        <div>
          <p className="text-sm font-medium mb-2">Theme</p>
          <div className="flex gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors",
                  theme === value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent border-border",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Account Info (read-only summary) */}
      <section className="p-4 bg-card border rounded-lg space-y-3">
        <h2 className="font-semibold">Account</h2>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-muted-foreground">Name</span>
          <span>{user?.name}</span>
          <span className="text-muted-foreground">Email</span>
          <span>{user?.email}</span>
          <span className="text-muted-foreground">Role</span>
          <span>{user?.role}</span>
          <span className="text-muted-foreground">Department</span>
          <span>
            {user?.managedDepartment?.name ?? user?.department?.name ?? "—"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          To update your name or avatar, visit your{" "}
          <a href="/profile" className="underline text-primary">
            Profile page
          </a>
          .
        </p>
      </section>

      {/* Session */}
      <section className="p-4 bg-card border rounded-lg space-y-3">
        <h2 className="font-semibold">Session</h2>
        <p className="text-sm text-muted-foreground">
          Your session automatically refreshes and will expire after 30 minutes
          of inactivity. You will see a warning before you are logged out.
        </p>
      </section>
    </div>
  );
}
