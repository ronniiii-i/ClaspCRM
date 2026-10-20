"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2,
  Check,
  UserPlus,
  Search,
  Shield,
  UserCog,
  Users,
  User,
  MoreHorizontal,
  Ban,
  Briefcase,
  DoorOpen,
  PlaneTakeoff,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Role = "ADMIN" | "HOD" | "LEAD" | "STAFF";
type UserStatus = "ACTIVE" | "SUSPENDED" | "FIRED" | "ON_LEAVE";

interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status?: UserStatus;
  isVerified: boolean;
  createdAt: string;
  department?: { id: string; name: string } | null;
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "HOD", label: "Head of Department" },
  { value: "LEAD", label: "Team Lead" },
  { value: "STAFF", label: "Staff" },
];

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  ADMIN: <Shield className="h-3.5 w-3.5" />,
  HOD: <UserCog className="h-3.5 w-3.5" />,
  LEAD: <Users className="h-3.5 w-3.5" />,
  STAFF: <User className="h-3.5 w-3.5" />,
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  HOD: "Head of Dept",
  LEAD: "Team Lead",
  STAFF: "Staff",
};

const STATUS_BADGE: Record<UserStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0",
  },
  SUSPENDED: {
    label: "Suspended",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0",
  },
  FIRED: {
    label: "Fired",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0",
  },
  ON_LEAVE: {
    label: "On Leave",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0",
  },
};

function CreateUserModal({
  token,
  onCreated,
  onClose,
}: {
  token: string;
  onCreated: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF" as Role,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user-management/create-new-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = (await res.json()) as { message?: string };
        throw new Error(err.message ?? "Failed to create user");
      }
      toast.success(`User created`);
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-lg">Create New User</h2>
          <p className="text-sm text-muted-foreground mt-1">
            The user will receive a verification email to activate their account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Jane Doe"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="jane@company.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Temporary Password</label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Role</label>
            <select
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({ ...f, role: e.target.value as Role }))
              }
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user-management/get-all-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = (await res.json()) as
        | ManagedUser[]
        | { users: ManagedUser[] };
      setUsers(
        Array.isArray(data)
          ? data
          : ((data as { users: ManagedUser[] }).users ?? []),
      );
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const patchUser = async (targetId: string, payload: Partial<ManagedUser>) => {
    if (!token) return;
    setActionLoading((prev) => ({ ...prev, [targetId]: true }));
    try {
      const res = await fetch("/api/user-management/update-user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: targetId, ...payload }),
      });
      if (!res.ok) throw new Error("Update failed");
      setUsers((prev) =>
        prev.map((u) => (u.id === targetId ? { ...u, ...payload } : u)),
      );
      toast.success("User updated");
    } catch {
      toast.error("Failed to update user");
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  const deleteUser = async (targetId: string, name: string) => {
    if (!token) return;
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    setActionLoading((prev) => ({ ...prev, [targetId]: true }));
    try {
      const res = await fetch("/api/user-management/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: targetId }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setUsers((prev) => prev.filter((u) => u.id !== targetId));
      toast.success(`${name} removed`);
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (u.department?.name?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase(),
      ),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showCreateModal && token && (
        <CreateUserModal
          token={token}
          onCreated={fetchUsers}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} users total
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((u) => {
                const status = u.status ?? "ACTIVE";
                const statusConfig = STATUS_BADGE[status];
                const isSelf = u.id === user?.id;
                return (
                  <TableRow
                    key={u.id}
                    className={status === "FIRED" ? "opacity-50" : ""}
                  >
                    <TableCell className="font-medium">
                      {u.name || "—"}
                      {isSelf && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      {u.department?.name ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        {ROLE_ICONS[u.role]}
                        {ROLE_LABELS[u.role] ?? u.role}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {actionLoading[u.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isSelf}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            {ROLE_OPTIONS.map((opt) => (
                              <DropdownMenuItem
                                key={opt.value}
                                onClick={() =>
                                  patchUser(u.id, { role: opt.value })
                                }
                              >
                                {ROLE_ICONS[opt.value]}
                                <span className="ml-2">{opt.label}</span>
                                {u.role === opt.value && (
                                  <Check className="ml-auto h-4 w-4" />
                                )}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>
                              Employment Status
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                patchUser(u.id, { status: "ACTIVE" })
                              }
                            >
                              <Briefcase className="h-4 w-4 mr-2" />
                              Set Active
                              {status === "ACTIVE" && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                patchUser(u.id, { status: "ON_LEAVE" })
                              }
                            >
                              <PlaneTakeoff className="h-4 w-4 mr-2" />
                              Mark On Leave
                              {status === "ON_LEAVE" && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                patchUser(u.id, { status: "SUSPENDED" })
                              }
                              className="text-yellow-600 focus:text-yellow-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend
                              {status === "SUSPENDED" && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                patchUser(u.id, { status: "FIRED" })
                              }
                              className="text-destructive focus:text-destructive"
                            >
                              <DoorOpen className="h-4 w-4 mr-2" />
                              Terminate
                              {status === "FIRED" && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteUser(u.id, u.name)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center h-24 text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
