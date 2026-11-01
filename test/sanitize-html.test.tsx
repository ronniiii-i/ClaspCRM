import { render, screen } from "@testing-library/react";
import { MarkdownContent } from "@/components/renderers/shared/MarkdownContent";
import { sanitizeRichText } from "@/lib/sanitize-html";

describe("sanitizeRichText", () => {
  it("strips script, style and embedded frames", () => {
    const dirty = [
      '<p>Hello</p><script>alert("x")</script>',
      "<style>body{display:none}</style>",
      '<iframe src="https://evil.test"></iframe>',
    ].join("");

    const clean = sanitizeRichText(dirty);

    expect(clean).not.toMatch(/<script/i);
    expect(clean).not.toMatch(/<style/i);
    expect(clean).not.toMatch(/<iframe/i);
    expect(clean).toContain("<p>Hello</p>");
  });

  it("removes inline handlers and javascript: URLs", () => {
    const clean = sanitizeRichText(
      '<a href="javascript:alert(1)" onclick="steal()">Click</a><img src="x" onerror="boom()">',
    );

    expect(clean).not.toMatch(/onclick/i);
    expect(clean).not.toMatch(/onerror/i);
    expect(clean).not.toMatch(/javascript:/i);
    expect(clean).toContain('href="#"');
  });

  it("leaves safe markup untouched", () => {
    expect(sanitizeRichText("<p><strong>Safe</strong></p>")).toBe(
      "<p><strong>Safe</strong></p>",
    );
  });
});

describe("MarkdownContent", () => {
  it("renders markdown through the sanitised pipeline", () => {
    render(<MarkdownContent content="# Title\n\nBody copy." />);

    expect(screen.getByTestId("markdown")).toHaveTextContent("# Title");
  });

  it("never injects script tags for rich text", () => {
    const { container } = render(
      <MarkdownContent
        format="RICH_TEXT"
        content={'<p>Safe</p><script>alert("x")</script>'}
      />,
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toContain("Safe");
  });
});
