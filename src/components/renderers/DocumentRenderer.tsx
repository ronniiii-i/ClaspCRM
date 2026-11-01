"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Archive,
  Eye,
  FileText,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDocument,
  useDocumentMutations,
  useDocuments,
} from "@/hooks/workspace/useDocuments";
import { useModuleContext } from "./ModuleContext";
import type { ModuleRendererProps } from "./types";
import type {
  DocumentConfig,
  DocumentFormat,
  DocumentInput,
  DocumentRecord,
  DocumentStatus,
} from "@/lib/workspace-types";
import { moduleLocation } from "@/lib/workspace-navigation";
import { WorkspaceService } from "@/services/workspace";
import { MarkdownContent } from "./shared/MarkdownContent";
import { ErrorState } from "./shared/ErrorState";
import { formatRelative } from "@/lib/format";

const STATUSES: DocumentStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

interface EditorState {
  id: string | null;
  title: string;
  content: string;
  format: DocumentFormat;
  status: DocumentStatus;
  category: string;
}

function emptyEditor(config: DocumentConfig): EditorState {
  return {
    id: null,
    title: "",
    content: "",
    format: config.allowRichText ? config.defaultFormat : "MARKDOWN",
    status: "DRAFT",
    category: "",
  };
}

function editorFrom(doc: DocumentRecord & { content?: string }): EditorState {
  return {
    id: doc.id,
    title: doc.title,
    content: doc.content ?? "",
    format: doc.format,
    status: doc.status,
    category: doc.category ?? "",
  };
}

function statusTone(status: DocumentStatus): string {
  if (status === "PUBLISHED") return "border-emerald-500/30 bg-emerald-500/10";
  if (status === "ARCHIVED") return "border-border bg-muted text-muted-foreground";
  return "border-amber-500/30 bg-amber-500/10";
}

export function DocumentRenderer({ definition }: ModuleRendererProps) {
  const { can } = useModuleContext();
  const config = definition.config as DocumentConfig;
  const { deptKey, moduleKey } = moduleLocation(definition);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"" | DocumentStatus>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const documents = useDocuments(deptKey, moduleKey, {
    search: search || undefined,
    category: category || undefined,
    status: status || undefined,
    page,
    pageSize: 20,
  });

  const { create, update, remove } = useDocumentMutations(deptKey, moduleKey);

  const [readerId, setReaderId] = useState<string | null>(null);
  const reader = useDocument(deptKey, moduleKey, readerId);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<EditorState>(() => emptyEditor(config));
  const [preview, setPreview] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);

  const [archiveTarget, setArchiveTarget] = useState<DocumentRecord | null>(null);

  const canCreate = can("CREATE") && config.allowCreate;
  const canEdit = can("EDIT");
  const canDelete = can("DELETE");

  const rows = documents.data?.data ?? [];
  const meta = documents.data?.meta;

  const categories = useMemo(() => config.categories ?? [], [config.categories]);

  const openCreate = () => {
    setEditor(emptyEditor(config));
    setPreview(false);
    setEditorError(null);
    setEditorOpen(true);
  };

  const openEdit = (doc: DocumentRecord) => {
    setReaderId(null);
    setEditorError(null);
    setPreview(false);
    setEditor(editorFrom(doc));
    setEditorOpen(true);

    // The list payload omits `content`; fetch it before editing.
    void (async () => {
      try {
        const full = await WorkspaceService.getDocument(deptKey, moduleKey, doc.id);
        setEditor((current) =>
          current.id === doc.id
            ? { ...current, content: full.content ?? "" }
            : current,
        );
      } catch (error) {
        setEditorError(
          error instanceof Error ? error.message : "Failed to load document.",
        );
      }
    })();
  };

  const saveEditor = () => {
    if (editor.title.trim().length === 0) {
      setEditorError("Title is required.");
      return;
    }
    if (editor.content.trim().length === 0) {
      setEditorError("Content is required.");
      return;
    }

    const payload: DocumentInput = {
      title: editor.title.trim(),
      content: editor.content,
      format: editor.format,
      status: editor.status,
      category: editor.category || null,
    };

    const onSuccess = () => {
      toast.success(editor.id ? "Document updated." : "Document created.");
      setEditorOpen(false);
      setEditorError(null);
    };
    const onError = (error: Error) => setEditorError(error.message);

    if (editor.id) {
      update.mutate(
        { id: editor.id, input: payload },
        { onSuccess, onError },
      );
      return;
    }

    create.mutate(payload, { onSuccess, onError });
  };

  const confirmArchive = () => {
    if (!archiveTarget) return;
    remove.mutate(
      { id: archiveTarget.id },
      {
        onSuccess: () => {
          toast.success("Document archived.");
          setArchiveTarget(null);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const changeStatus = (value: "" | DocumentStatus) => {
    setStatus(value);
    setPage(1);
  };

  const changeCategory = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  if (documents.isError) {
    return (
      <ErrorState
        title="Could not load documents"
        message={documents.error.message}
        onRetry={() => void documents.refetch()}
      />
    );
  }

  return (
    <section className="flex flex-col gap-4" aria-label={definition.name}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search documents…"
            aria-label="Search documents"
            className="pl-8"
          />
        </div>

        {categories.length > 0 ? (
          <Select
            value={category}
            onChange={(event) => changeCategory(event.target.value)}
            aria-label="Filter by category"
            className="w-auto min-w-36"
          >
            <option value="">All categories</option>
            {categories.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </Select>
        ) : null}

        <Select
          value={status}
          onChange={(event) =>
            changeStatus(event.target.value as "" | DocumentStatus)
          }
          aria-label="Filter by status"
          className="w-auto min-w-32"
        >
          <option value="">All statuses</option>
          {STATUSES.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </Select>

        <div className="ml-auto flex items-center gap-2">
          {meta ? (
            <span className="text-xs text-muted-foreground">
              {meta.total} document{meta.total === 1 ? "" : "s"}
            </span>
          ) : null}
          {canCreate ? (
            <Button size="sm" onClick={openCreate}>
              <Plus aria-hidden="true" />
              New document
            </Button>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.isPending ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`document-skeleton-${index}`}>
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No documents match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      <FileText
                        className="size-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                      {doc.title}
                    </span>
                  </TableCell>
                  <TableCell>{doc.category ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusTone(doc.status)}
                    >
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{doc.format === "RICH_TEXT" ? "Rich text" : "Markdown"}</TableCell>
                  <TableCell className="tabular-nums">v{doc.version}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatRelative(doc.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Read ${doc.title}`}
                        onClick={() => setReaderId(doc.id)}
                      >
                        <Eye aria-hidden="true" />
                      </Button>
                      {canEdit ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${doc.title}`}
                          onClick={() => openEdit(doc)}
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Archive ${doc.title}`}
                          onClick={() => setArchiveTarget(doc)}
                        >
                          <Archive aria-hidden="true" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {meta ? `Page ${meta.page} of ${meta.totalPages}` : ""}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!meta || meta.page <= 1 || documents.isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!meta || meta.page >= meta.totalPages || documents.isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Modal
        open={Boolean(readerId)}
        onClose={() => setReaderId(null)}
        title={reader.data?.title ?? "Document"}
        description={
          reader.data
            ? [reader.data.category, `v${reader.data.version}`]
                .filter(Boolean)
                .join(" · ")
            : undefined
        }
        className="max-w-3xl"
        footer={<Button onClick={() => setReaderId(null)}>Close</Button>}
      >
        <div className="max-h-[65vh] overflow-y-auto pr-1">
          {reader.isPending ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : reader.isError ? (
            <ErrorState
              title="Could not load this document"
              message={reader.error.message}
              onRetry={() => void reader.refetch()}
            />
          ) : (
            <MarkdownContent
              content={reader.data?.content ?? ""}
              format={reader.data?.format ?? "MARKDOWN"}
            />
          )}
        </div>
      </Modal>

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editor.id ? "Edit document" : "New document"}
        description={definition.name}
        className="max-w-3xl"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setEditorOpen(false)}
              disabled={create.isPending || update.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={saveEditor}
              disabled={create.isPending || update.isPending}
            >
              {create.isPending || update.isPending
                ? "Saving…"
                : editor.id
                  ? "Save changes"
                  : "Create document"}
            </Button>
          </>
        }
      >
        <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1">
          <label className="flex flex-col gap-1.5">
            <Label htmlFor="document-title">Title</Label>
            <Input
              id="document-title"
              value={editor.title}
              onChange={(event) =>
                setEditor((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Document title"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <Label htmlFor="document-category">Category</Label>
              <Select
                id="document-category"
                value={editor.category}
                onChange={(event) =>
                  setEditor((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
              >
                <option value="">Uncategorised</option>
                {categories.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </Select>
            </label>

            <label className="flex flex-col gap-1.5">
              <Label htmlFor="document-status">Status</Label>
              <Select
                id="document-status"
                value={editor.status}
                onChange={(event) =>
                  setEditor((current) => ({
                    ...current,
                    status: event.target.value as DocumentStatus,
                  }))
                }
              >
                {STATUSES.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </Select>
            </label>

            <label className="flex flex-col gap-1.5">
              <Label htmlFor="document-format">Format</Label>
              <Select
                id="document-format"
                value={editor.format}
                onChange={(event) =>
                  setEditor((current) => ({
                    ...current,
                    format: event.target.value as DocumentFormat,
                  }))
                }
              >
                <option value="MARKDOWN">Markdown</option>
                {config.allowRichText ? (
                  <option value="RICH_TEXT">Rich text</option>
                ) : null}
              </Select>
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="document-content">Content</Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setPreview((current) => !current)}
              >
                {preview ? (
                  <>
                    <X aria-hidden="true" />
                    Write
                  </>
                ) : (
                  <>
                    <Eye aria-hidden="true" />
                    Preview
                  </>
                )}
              </Button>
            </div>

            {preview ? (
              <div className="min-h-40 rounded-md border border-input bg-background px-3 py-2">
                <MarkdownContent
                  content={editor.content || "_Nothing to preview yet._"}
                  format={editor.format}
                />
              </div>
            ) : (
              <Textarea
                id="document-content"
                value={editor.content}
                onChange={(event) =>
                  setEditor((current) => ({
                    ...current,
                    content: event.target.value,
                  }))
                }
                placeholder={
                  editor.format === "RICH_TEXT"
                    ? "<p>Write formatted content…</p>"
                    : "# Heading\n\nWrite markdown content…"
                }
                className="min-h-48 font-mono text-xs"
              />
            )}
          </div>

          {editorError ? (
            <p role="alert" className="text-sm text-destructive">
              {editorError}
            </p>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        title="Archive document"
        description="Archived documents stay readable and can be filtered from the list."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setArchiveTarget(null)}
              disabled={remove.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmArchive}
              disabled={remove.isPending}
            >
              {remove.isPending ? "Archiving…" : "Archive"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Archive{" "}
          <span className="font-medium text-foreground">
            {archiveTarget?.title}
          </span>
          ?
        </p>
      </Modal>
    </section>
  );
}
