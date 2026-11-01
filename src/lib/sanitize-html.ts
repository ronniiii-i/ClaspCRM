/**
 * Conservative rich-text sanitiser.
 *
 * The backend already strips executable tags before storing RICH_TEXT
 * documents; this mirrors those rules so a document edited in a stale client
 * tab can never inject script into the reader.
 */
export function sanitizeRichText(html: string): string {
  return html
    .replace(
      /<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      "",
    )
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"');
}
