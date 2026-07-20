"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";

export default function ProfilePage() {
  const { user, token, refreshUserData, isLoading } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
        body: JSON.stringify({ name, avatar }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Update failed");
      }

      await refreshUserData();
      toast.success("Profile updated successfully");
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
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal information
        </p>
      </div>

      {/* Avatar + Identity */}
      <div className="flex items-center gap-4 p-4 bg-card border rounded-lg">
        <div className="relative">
          <Image
            src={user.avatar || `https://picsum.photos/seed/${user.id}/200/200`}
            alt={user.name}
            width={72}
            height={72}
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <p className="font-semibold text-lg">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{user.role}</Badge>
            {user.department && (
              <Badge variant="outline">{user.department.name}</Badge>
            )}
            {user.managedDepartment && (
              <Badge variant="outline">
                Head of {user.managedDepartment.name}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-4 bg-card border rounded-lg"
      >
        <h2 className="font-semibold">Edit Details</h2>

        <div className="space-y-1">
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

        <div className="space-y-1">
          <label htmlFor="avatar" className="text-sm font-medium">
            Avatar URL
          </label>
          <Input
            id="avatar"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://example.com/your-photo.jpg"
          />
          <p className="text-xs text-muted-foreground">
            Paste a direct link to an image
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <Input value={user.email} disabled className="opacity-60" />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed here. Contact your administrator.
          </p>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  );
}
