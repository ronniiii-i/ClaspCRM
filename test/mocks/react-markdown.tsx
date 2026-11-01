import type { ReactNode } from "react";

/**
 * Minimal stand-in for `react-markdown`.
 *
 * Jest cannot load the real package because it is ESM-only. Renderers that
 * embed markdown are tested for plumbing (sanitisation lives in
 * `sanitizeRichText` and in `rehype-sanitize` in production), not parsing.
 */
export default function ReactMarkdown({ children }: { children?: ReactNode }) {
  return <div data-testid="markdown">{children}</div>;
}
