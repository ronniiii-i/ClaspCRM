"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Lock, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { roleLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const roleValue =
    typeof user?.role === "string" ? user.role : user?.role?.slug ?? user?.role?.name;
  const department =
    roleValue === "HOD" ? user?.managedDepartment : user?.department;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your preferences and account settings
        </p>
      </div>

      {/* Appearance */}
      <section className="bg-card border rounded-lg divide-y">
        <div className="p-5">
          <h2 className="font-semibold">Appearance</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose how Clasp Workspace looks on your device
          </p>
        </div>
        <div className="p-5">
          <p className="text-sm font-medium mb-3">Theme</p>
          <div className="flex gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
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
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Account summary */}
      <section className="bg-card border rounded-lg divide-y">
        <div className="p-5">
          <h2 className="font-semibold">Account</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your current account details
          </p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{user?.name ?? "—"}</span>
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium truncate">{user?.email ?? "—"}</span>
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium">{roleLabel(user?.role)}</span>
            <span className="text-muted-foreground">Department</span>
            <span className="font-medium">
              {department?.name ?? "Not assigned"}
            </span>
          </div>
        </div>
        <div className="p-5">
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile">
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-card border rounded-lg divide-y">
        <div className="p-5">
          <h2 className="font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Control what you are notified about
          </p>
        </div>
        <div className="p-5 space-y-4">
          {[
            {
              label: "In-app notifications",
              description: "Alerts and updates shown inside Clasp Workspace",
              defaultOn: true,
            },
            {
              label: "Email notifications",
              description: "Receive a daily digest of activity",
              defaultOn: false,
            },
            {
              label: "Security alerts",
              description: "Notify me of suspicious login attempts",
              defaultOn: true,
            },
          ].map(({ label, description, defaultOn }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              {/* Placeholder toggle — wire to backend when notification prefs are built */}
              <button
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                  defaultOn ? "bg-primary" : "bg-muted",
                )}
                aria-label={`Toggle ${label}`}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                    defaultOn ? "translate-x-4" : "translate-x-1",
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="bg-card border rounded-lg divide-y">
        <div className="p-5">
          <h2 className="font-semibold">Security</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your password and session
          </p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">
                Last changed: unknown
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/forgot-password">
                <Lock className="h-4 w-4 mr-2" />
                Change password
              </Link>
            </Button>
          </div>
          <div className="text-xs text-muted-foreground pt-1">
            Sessions expire after 30 minutes of inactivity. You will see a
            warning before being logged out.
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section className="bg-card border border-destructive/30 rounded-lg divide-y">
        <div className="p-5">
          <h2 className="font-semibold text-destructive">Session</h2>
        </div>
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Sign out</p>
            <p className="text-xs text-muted-foreground">
              You will be returned to the login page
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </div>
      </section>
    </div>
  );
}
