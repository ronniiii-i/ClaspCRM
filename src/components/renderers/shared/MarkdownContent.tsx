"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/sanitize-html";

const MARKDOWN_CLASSES = cn(
  "text-sm leading-6 text-foreground",
  "[&_h1]:mt-5 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:tracking-tight",
  "[&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold",
  "[&_p]:mt-2 [&_p]:text-muted-foreground",
  "[&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1",
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
  "[&_blockquote]:mt-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
  "[&_pre]:mt-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:text-xs",
  "[&_table]:mt-3 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left",
  "[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1",
  "[&_hr]:my-4 [&_hr]:border-border",
);

/**
 * Safe markdown reader. Raw HTML is stripped by `rehype-sanitize` even if a
 * future renderer enables HTML input; RICH_TEXT documents go through the
 * mirrored backend sanitiser before `dangerouslySetInnerHTML`.
 */
export function MarkdownContent({
  content,
  format = "MARKDOWN",
  className,
}: {
  content: string;
  format?: "MARKDOWN" | "RICH_TEXT";
  className?: string;
}) {
  if (format === "RICH_TEXT") {
    return (
      <div
        className={cn(MARKDOWN_CLASSES, className)}
        data-format="RICH_TEXT"
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(content) }}
      />
    );
  }

  return (
    <div className={cn(MARKDOWN_CLASSES, className)} data-format="MARKDOWN">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
