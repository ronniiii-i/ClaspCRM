"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";
import { roleLabel } from "@/lib/format";

export default function ProfilePage() {
  const { user, token, refreshUserData, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setAvatarUrl(user.avatar ?? "");
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const displayAvatar =
    avatarUrl || `https://picsum.photos/seed/${user.id}/200/200`;
  const roleValue =
    typeof user.role === "string" ? user.role : user.role?.slug ?? user.role?.name;
  const department =
    roleValue === "HOD" ? user.managedDepartment : user.department;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), avatar: avatarUrl.trim() }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { message?: string };
        throw new Error(err.message ?? "Update failed");
      }
      await refreshUserData();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal information and how others see you
        </p>
      </div>

      {/* Identity card */}
      <div className="flex items-center gap-5 p-5 bg-card border rounded-lg">
        <div className="relative shrink-0">
          <Image
            src={displayAvatar}
            alt={user.name}
            width={80}
            height={80}
            className="rounded-full object-cover ring-2 ring-border"
          />
          <span className="absolute bottom-0 right-0 bg-muted rounded-full p-1 border">
            <Camera className="h-3 w-3 text-muted-foreground" />
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-lg truncate">{user.name}</p>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary">{roleLabel(user.role)}</Badge>
            {department && <Badge variant="outline">{department.name}</Badge>}
            {user.isVerified ? (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                Verified
              </Badge>
            ) : (
              <Badge variant="destructive">Unverified</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form
        onSubmit={handleSubmit}
        className="bg-card border rounded-lg divide-y"
      >
        {/* Personal info */}
        <div className="p-5 space-y-4">
          <h2 className="font-semibold">Personal Information</h2>
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Display Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Email changes must be requested through your administrator.
            </p>
          </div>
        </div>

        {/* Avatar */}
        <div className="p-5 space-y-3">
          <h2 className="font-semibold">Profile Picture</h2>
          <p className="text-sm text-muted-foreground">
            Paste a URL to any publicly accessible image
          </p>
          <div className="flex items-center gap-3">
            <Image
              src={displayAvatar}
              alt="Preview"
              width={48}
              height={48}
              className="rounded-full object-cover shrink-0 ring-1 ring-border"
            />
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="flex-1"
            />
          </div>
        </div>

        {/* Role & Dept — read only */}
        <div className="p-5 space-y-3">
          <h2 className="font-semibold">Role & Department</h2>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium">{roleLabel(user.role)}</span>
            <span className="text-muted-foreground">Department</span>
            <span className="font-medium">
              {department?.name ?? "Not assigned"}
            </span>
            {roleValue === "HOD" && (
              <>
                <span className="text-muted-foreground">Position</span>
                <span className="font-medium">Head of Department</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Role and department assignments are managed by your administrator.
          </p>
        </div>

        <div className="p-5 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
