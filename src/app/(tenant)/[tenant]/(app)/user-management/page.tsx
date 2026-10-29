"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban,
  CircleCheck,
  Mail,
  MailPlus,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePrompt } from "@/components/providers/PromptProvider";
import { useAuthStore } from "@/stores/auth-store";
import { formatDate, formatEnum, formatRelative, initials, isTenantAdminRole } from "@/lib/format";

const API_BASE = process.env.NEXT_PUBLIC_API || "http://localhost:3030";

const STATUSES = ["ACTIVE", "SUSPENDED", "ON_LEAVE", "FIRED"];

interface RoleOption {
  id: string;
  name: string;
  isTenantAdmin?: boolean;
  currentOnly?: boolean;
}

interface DepartmentOption {
  id: string;
  name: string;
}

interface Member {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  status?: string;
  roleId?: string;
  role?: RoleOption | null;
  departmentId?: string | null;
  department?: DepartmentOption | null;
  lastLoginAt?: string | null;
}

interface Invitation {
  id: string;
  email: string;
  status: string;
  expiresAt?: string | null;
  role?: RoleOption | null;
  department?: DepartmentOption | null;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
  SUSPENDED: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  ON_LEAVE: "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-400",
  FIRED: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
};

const INVITATION_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  ACCEPTED: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
  REVOKED: "bg-muted text-muted-foreground",
  EXPIRED: "bg-muted text-muted-foreground",
};

function StatusBadge({ status }: { status?: string }) {
  const value = status || "ACTIVE";
  return (
    <Badge variant="outline" className={STATUS_STYLES[value] ?? ""}>
      {formatEnum(value)}
    </Badge>
  );
}

export default function UserManagementPage() {
  const { user: currentUser, token } = useAuthStore();
  const { confirm } = usePrompt();

  const [tab, setTab] = useState("members");
  const [users, setUsers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lastInvite, setLastInvite] = useState<{ email: string; token: string } | null>(null);

  const [inviteForm, setInviteForm] = useState({ email: "", roleId: "", departmentId: "" });
  const [inviting, setInviting] = useState(false);

  const [editing, setEditing] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ name: "", roleId: "", departmentId: "", status: "ACTIVE" });
  const [savingEdit, setSavingEdit] = useState(false);

  const isTenantAdmin = useMemo(
    () =>
      isTenantAdminRole(
        currentUser?.role as unknown as
          | { isTenantAdmin?: boolean; slug?: string }
          | string
          | undefined,
      ),
    [currentUser],
  );

  const authHeaders = useCallback(
    (json = false) => ({
      ...(json ? { "Content-Type": "application/json" } : {}),
      Authorization: token ? `Bearer ${token}` : "",
    }),
    [token],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, invitationsRes, rolesRes, departmentsRes] = await Promise.all([
        fetch(`${API_BASE}/users`, { headers: authHeaders() }),
        fetch(`${API_BASE}/invitations`, { headers: authHeaders() }),
        fetch(`${API_BASE}/roles/assignable`, { headers: authHeaders() }),
        fetch(`${API_BASE}/departments`, { headers: authHeaders() }),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(Array.isArray(data) ? data : data.users || []);
      }
      if (invitationsRes.ok) {
        const data = await invitationsRes.json();
        setInvitations(data.invitations || []);
      }
      if (rolesRes.ok) {
        const data = await rolesRes.json();
        setRoles(data.roles || []);
      }
      if (departmentsRes.ok) {
        const data = await departmentsRes.json();
        setDepartments(Array.isArray(data) ? data : data.departments || []);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load user management data");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  useEffect(() => {
    if (!inviteForm.roleId && roles.length > 0) {
      setInviteForm((current) => ({ ...current, roleId: roles[roles.length - 1]?.id ?? roles[0].id }));
    }
  }, [roles, inviteForm.roleId]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (member) =>
        member.name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.role?.name?.toLowerCase().includes(query) ||
        member.department?.name?.toLowerCase().includes(query),
    );
  }, [users, search]);

  const pendingInvitations = invitations.filter((invitation) => invitation.status === "PENDING").length;

  const sendInvite = async () => {
    if (!inviteForm.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!inviteForm.roleId) {
      toast.error("Choose a role for the invite");
      return;
    }
    setInviting(true);
    try {
      const res = await fetch(`${API_BASE}/invitations`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          email: inviteForm.email.trim(),
          roleId: inviteForm.roleId,
          departmentId: inviteForm.departmentId || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message || "Failed to send invitation",
        );
      }
      toast.success(`Invitation sent to ${inviteForm.email.trim()}`);
      if (data.token) {
        setLastInvite({ email: inviteForm.email.trim(), token: data.token });
      }
      setInviteForm({ email: "", roleId: inviteForm.roleId, departmentId: "" });
      await load();
      setTab("invitations");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const openEdit = (member: Member) => {
    setEditing(member);
    setEditForm({
      name: member.name ?? "",
      roleId: member.role?.id ?? member.roleId ?? "",
      departmentId: member.department?.id ?? member.departmentId ?? "",
      status: member.status ?? "ACTIVE",
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!editForm.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSavingEdit(true);
    try {
      const res = await fetch(`${API_BASE}/users/${editing.id}`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({
          name: editForm.name.trim(),
          roleId: editForm.roleId || undefined,
          departmentId: editForm.departmentId,
          status: editForm.status,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message || "Failed to update member",
        );
      }
      toast.success("Member updated");
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update member");
    } finally {
      setSavingEdit(false);
    }
  };

  const patchStatus = async (member: Member, status: string, label: string) => {
    if (member.id === currentUser?.id) {
      toast.error("You cannot change your own status here");
      return;
    }
    if (status === "FIRED") {
      const approved = await confirm({
        title: `Fire ${member.name || member.email}?`,
        description: "Their sessions are invalidated and they can no longer sign in.",
        confirmLabel: "Fire member",
        destructive: true,
      });
      if (!approved) return;
    }
    try {
      const res = await fetch(`${API_BASE}/users/${member.id}`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update member");
      }
      toast.success(`${member.name || member.email} marked ${label.toLowerCase()}`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update member");
    }
  };

  const deleteMember = async (member: Member) => {
    if (member.id === currentUser?.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    const approved = await confirm({
      title: `Delete ${member.name || member.email}?`,
      description: "This permanently removes the account. Prefer suspending or firing for a reversible option.",
      confirmLabel: "Delete permanently",
      destructive: true,
    });
    if (!approved) return;

    try {
      const res = await fetch(`${API_BASE}/users/${member.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete member");
      }
      toast.success("Member deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete member");
    }
  };

  const resendInvitation = async (invitation: Invitation) => {
    try {
      const res = await fetch(`${API_BASE}/invitations/${invitation.id}/resend`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to resend invitation");
      }
      toast.success(`Invitation resent to ${invitation.email}`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend invitation");
    }
  };

  const revokeInvitation = async (invitation: Invitation) => {
    const approved = await confirm({
      title: `Revoke invitation for ${invitation.email}?`,
      description: "The invite link stops working immediately. You can send a new invite afterwards.",
      confirmLabel: "Revoke invitation",
      destructive: true,
    });
    if (!approved) return;

    try {
      const res = await fetch(`${API_BASE}/invitations/${invitation.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to revoke invitation");
      }
      toast.success("Invitation revoked");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to revoke invitation");
    }
  };

  const copyInviteLink = async () => {
    if (!lastInvite) return;
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = process.env.NEXT_PUBLIC_ROOT_PROTOCOL || "http";
    const slug = currentUser?.tenantSlug;
    const url = `${protocol}://${slug ? `${slug}.` : ""}${rootDomain}/invite/${lastInvite.token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invite link copied");
    } catch {
      toast.error(url);
    }
  };

  const roleOptions = useMemo(() => {
    const options = [...roles];
    const currentRole = editing?.role;
    if (currentRole && !options.some((role) => role.id === currentRole.id)) {
      options.unshift({ ...currentRole, currentOnly: true });
    }
    return options;
  }, [roles, editing]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">User management</h1>
        <p className="text-sm text-muted-foreground">
          Members, invitations, and roles for this workspace.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList>
          <TabsTrigger value="members">Members ({users.length})</TabsTrigger>
          <TabsTrigger value="invitations">Invitations ({pendingInvitations})</TabsTrigger>
          <TabsTrigger value="invite">Invite user</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="flex flex-col gap-4">
          <Card className="border-border">
            <CardHeader className="gap-3">
              <CardTitle className="text-base">Members</CardTitle>
              <CardDescription>Everyone with an account in this workspace.</CardDescription>
              <Input
                placeholder="Search by name, email, role, or department…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="mt-2 max-w-sm"
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {member.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={member.avatarUrl}
                              alt={member.name || member.email}
                              className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                              {initials(member.name, member.email)}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {member.name || member.email}
                              {member.id === currentUser?.id && (
                                <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">{member.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.role?.isTenantAdmin ? (
                          <Badge>Tenant admin</Badge>
                        ) : (
                          member.role?.name || "—"
                        )}
                      </TableCell>
                      <TableCell>{member.department?.name || "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={member.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.lastLoginAt ? formatRelative(member.lastLoginAt) : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${member.name}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem onSelect={() => openEdit(member)}>
                              <Pencil className="h-4 w-4" />
                              Edit details
                            </DropdownMenuItem>
                            {member.status !== "SUSPENDED" ? (
                              <DropdownMenuItem
                                onSelect={() => patchStatus(member, "SUSPENDED", "Suspended")}
                              >
                                <Ban className="h-4 w-4" />
                                Suspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onSelect={() => patchStatus(member, "ACTIVE", "Active")}
                              >
                                <CircleCheck className="h-4 w-4" />
                                Reactivate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onSelect={() => patchStatus(member, "ON_LEAVE", "On leave")}
                            >
                              <Mail className="h-4 w-4" />
                              Mark on leave
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => patchStatus(member, "FIRED", "Fired")}
                            >
                              <UserMinus className="h-4 w-4" />
                              Fire
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => deleteMember(member)}>
                              <Trash2 className="h-4 w-4" />
                              Delete account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {loading && <p className="mt-3 text-sm text-muted-foreground">Loading…</p>}
              {!loading && filteredUsers.length === 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {search ? "No members match that search." : "No members yet."}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="flex flex-col gap-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Invitations</CardTitle>
              <CardDescription>Pending invites can be resent or revoked.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>{invitation.role?.name || "—"}</TableCell>
                      <TableCell>{invitation.department?.name || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={INVITATION_STYLES[invitation.status] ?? ""}
                        >
                          {formatEnum(invitation.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(invitation.expiresAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {invitation.status === "PENDING" && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resendInvitation(invitation)}
                            >
                              <Send className="h-3.5 w-3.5" />
                              Resend
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => revokeInvitation(invitation)}
                            >
                              Revoke
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {loading && <p className="mt-3 text-sm text-muted-foreground">Loading…</p>}
              {!loading && invitations.length === 0 && (
                <p className="mt-3 text-sm text-muted-foreground">No invitations yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invite" className="flex flex-col gap-4">
          <Card className="max-w-2xl border-border">
            <CardHeader>
              <CardTitle className="text-base">Invite a user</CardTitle>
              <CardDescription>
                They receive an email link and join with the role and department you choose.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="invite-email">Email address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="teammate@company.com"
                  value={inviteForm.email}
                  onChange={(event) => setInviteForm({ ...inviteForm, email: event.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select
                    id="invite-role"
                    value={inviteForm.roleId}
                    onChange={(event) => setInviteForm({ ...inviteForm, roleId: event.target.value })}
                    disabled={roles.length === 0}
                  >
                    {roles.length === 0 && <option value="">No assignable roles</option>}
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="invite-department">Department (optional)</Label>
                  <Select
                    id="invite-department"
                    value={inviteForm.departmentId}
                    onChange={(event) =>
                      setInviteForm({ ...inviteForm, departmentId: event.target.value })
                    }
                  >
                    <option value="">Unassigned</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <Button onClick={sendInvite} disabled={inviting || !isTenantAdmin}>
                  <UserPlus className="h-4 w-4" />
                  {inviting ? "Sending…" : "Send invitation"}
                </Button>
                {!isTenantAdmin && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Only tenant admins can invite new members.
                  </p>
                )}
              </div>

              {lastInvite && (
                <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
                  <p className="flex items-center gap-2 font-medium">
                    <MailPlus className="h-4 w-4" />
                    Invite link ready
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Email delivery is not configured? Share the link for {lastInvite.email} manually.
                  </p>
                  <Button variant="outline" size="sm" className="w-fit" onClick={copyInviteLink}>
                    Copy invite link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit member"
        description={editing ? `Update details for ${editing.name || editing.email}.` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={savingEdit}>
              {savingEdit ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-name">Full name</Label>
            <Input
              id="edit-name"
              value={editForm.name}
              onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                id="edit-role"
                value={editForm.roleId}
                onChange={(event) => setEditForm({ ...editForm, roleId: event.target.value })}
              >
                {roleOptions.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                    {role.currentOnly ? " (current)" : ""}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-department">Department</Label>
              <Select
                id="edit-department"
                value={editForm.departmentId}
                onChange={(event) =>
                  setEditForm({ ...editForm, departmentId: event.target.value })
                }
              >
                <option value="">Unassigned</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-status">Employment status</Label>
            <Select
              id="edit-status"
              value={editForm.status}
              onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}
              disabled={editing?.id === currentUser?.id}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatEnum(status)}
                </option>
              ))}
            </Select>
            {editing?.id === currentUser?.id && (
              <p className="text-xs text-muted-foreground">
                You cannot change your own employment status.
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
