"use client";

import { useCallback, useEffect, useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePrompt } from "@/components/providers/PromptProvider";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API || "http://localhost:3030";

interface Department {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  isSystem?: boolean;
  _count?: { members?: number; teams?: number };
}

export default function DepartmentsSettingsPage() {
  const { token } = useAuthStore();
  const { prompt, confirm } = usePrompt();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      const res = await fetch(`${API_BASE}/departments`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load departments");
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : data.departments || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load departments");
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const create = async () => {
    if (!name.trim()) {
      toast.error("Department name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/departments`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message || "Failed to create department",
        );
      }
      setName("");
      setDescription("");
      toast.success(`${data.department?.name ?? "Department"} created`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create department");
    } finally {
      setSaving(false);
    }
  };

  const rename = async (department: Department) => {
    const next = await prompt({
      title: "Rename department",
      description: "The department key stays the same so permissions and modules keep working.",
      label: "Department name",
      defaultValue: department.name,
      required: true,
      confirmLabel: "Rename",
    });
    if (next === null || next.trim() === department.name) return;

    try {
      const res = await fetch(`${API_BASE}/departments/${department.id}`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({ name: next.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to rename department");
      }
      toast.success("Department renamed");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename department");
    }
  };

  const remove = async (department: Department) => {
    const approved = await confirm({
      title: `Delete ${department.name}?`,
      description:
        "Members, teams, and expenses must be moved first. Navigation modules attached to it will become global.",
      confirmLabel: "Delete department",
      destructive: true,
    });
    if (!approved) return;

    try {
      const res = await fetch(`${API_BASE}/departments/${department.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message || "Failed to delete department",
        );
      }
      toast.success("Department deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete department");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
        <p className="text-sm text-muted-foreground">
          Every workspace starts with the default departments. Rename or remove the ones you do not use.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Add a department</CardTitle>
          <CardDescription>The key is generated automatically from the name.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end">
            <div className="flex flex-col gap-2">
              <Label htmlFor="department-name">Name</Label>
              <Input
                id="department-name"
                placeholder="Finance"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="department-description">Description (optional)</Label>
              <Input
                id="department-description"
                placeholder="Owns billing, invoicing, and payroll"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <Button onClick={create} disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? "Creating…" : "Create"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">All departments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{department.name}</span>
                      {department.isSystem && <Badge variant="outline">Default</Badge>}
                    </div>
                    {department.description && (
                      <p className="text-xs text-muted-foreground">{department.description}</p>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{department.key}</TableCell>
                  <TableCell>{department._count?.members ?? 0}</TableCell>
                  <TableCell>{department._count?.teams ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${department.name}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => rename(department)}>Rename</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => remove(department)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loading && <p className="mt-3 text-sm text-muted-foreground">Loading…</p>}
          {!loading && departments.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">No departments yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
