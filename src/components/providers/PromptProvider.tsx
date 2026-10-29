"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PromptOptions {
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "text" | "number" | "email";
  required?: boolean;
  min?: number;
  max?: number;
}

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type DialogState =
  | {
      id: number;
      kind: "prompt";
      options: PromptOptions;
      resolve: (value: string | null) => void;
    }
  | {
      id: number;
      kind: "confirm";
      options: ConfirmOptions;
      resolve: (value: boolean) => void;
    };

interface PromptContextValue {
  prompt: (options: PromptOptions) => Promise<string | null>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const PromptContext = React.createContext<PromptContextValue | null>(null);

let nextDialogId = 1;

/**
 * Application-wide replacement for `window.prompt` / `window.confirm`.
 *
 * Mounted once in the root layout so every surface (tenant app, system admin,
 * auth screens) gets the same accessible dialog instead of a browser-native
 * popup.
 */
export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = React.useState<DialogState | null>(null);
  const [value, setValue] = React.useState("");
  const dialogRef = React.useRef<DialogState | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    dialogRef.current = dialog;
  }, [dialog]);

  const open = React.useCallback((next: DialogState) => {
    const current = dialogRef.current;
    if (current) {
      // Never leave an awaiting caller hanging if a second dialog opens.
      if (current.kind === "confirm") current.resolve(false);
      else current.resolve(null);
    }
    setDialog(next);
    setValue(
      next.kind === "prompt"
        ? ((next.options as PromptOptions).defaultValue ?? "")
        : "",
    );
  }, []);

  const prompt = React.useCallback(
    (options: PromptOptions) =>
      new Promise<string | null>((resolve) => {
        open({
          id: nextDialogId++,
          kind: "prompt",
          options,
          resolve,
        });
      }),
    [open],
  );

  const confirm = React.useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        open({
          id: nextDialogId++,
          kind: "confirm",
          options,
          resolve,
        });
      }),
    [open],
  );

  React.useEffect(() => {
    if (!dialog) return;
    const timer = window.setTimeout(() => {
      if (dialog.kind === "prompt") {
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }, 30);
    return () => window.clearTimeout(timer);
  }, [dialog?.id, dialog?.kind, dialog]);

  const settle = React.useCallback(
    (result: string | boolean | null) => {
      const current = dialogRef.current;
      if (current?.kind === "confirm") current.resolve(result === true);
      else if (current) current.resolve(typeof result === "string" ? result : null);
      setDialog(null);
      setValue("");
    },
    [],
  );

  const contextValue = React.useMemo(() => ({ prompt, confirm }), [prompt, confirm]);

  const promptOptions =
    dialog?.kind === "prompt" ? (dialog.options as PromptOptions) : null;
  const confirmOptions =
    dialog?.kind === "confirm" ? (dialog.options as ConfirmOptions) : null;

  const inputType = promptOptions?.type ?? "text";
  const canSubmit =
    !promptOptions?.required || value.trim().length > 0;

  return (
    <PromptContext.Provider value={contextValue}>
      {children}

      {promptOptions && (
        <Modal
          open={dialog?.kind === "prompt"}
          onClose={() => settle(null)}
          title={promptOptions.title}
          description={promptOptions.description}
          footer={
            <>
              <Button variant="outline" onClick={() => settle(null)}>
                {promptOptions.cancelLabel ?? "Cancel"}
              </Button>
              <Button
                onClick={() => settle(value)}
                disabled={!canSubmit}
              >
                {promptOptions.confirmLabel ?? "Continue"}
              </Button>
            </>
          }
        >
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (canSubmit) settle(value);
            }}
          >
            {promptOptions.label && (
              <Label htmlFor="app-prompt-input">{promptOptions.label}</Label>
            )}
            <Input
              id="app-prompt-input"
              ref={inputRef}
              type={inputType}
              min={promptOptions.min}
              max={promptOptions.max}
              placeholder={promptOptions.placeholder}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            {/* Hidden submit keeps Enter working inside the form. */}
            <button type="submit" className="hidden" aria-hidden="true" />
          </form>
        </Modal>
      )}

      {confirmOptions && (
        <Modal
          open={dialog?.kind === "confirm"}
          onClose={() => settle(false)}
          title={confirmOptions.title}
          description={confirmOptions.description}
          footer={
            <>
              <Button variant="outline" onClick={() => settle(false)}>
                {confirmOptions.cancelLabel ?? "Cancel"}
              </Button>
              <Button
                variant={confirmOptions.destructive ? "destructive" : "default"}
                onClick={() => settle(true)}
              >
                {confirmOptions.confirmLabel ?? "Confirm"}
              </Button>
            </>
          }
        />
      )}
    </PromptContext.Provider>
  );
}

export function usePrompt(): PromptContextValue {
  const context = React.useContext(PromptContext);
  if (!context) {
    throw new Error("usePrompt must be used inside <PromptProvider>");
  }
  return context;
}
