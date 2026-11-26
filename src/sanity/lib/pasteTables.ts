import { htmlToPortableText, type DeserializerRule } from "@portabletext/html";
import { compileSchema, defineSchema } from "@portabletext/schema";

/**
 * Studio's default paste drops <table> elements. When the clipboard HTML has a table
 * (Google Docs, Word, Excel, Sheets, web pages), convert the whole paste ourselves:
 * text keeps its headings/lists/bold/links, and each table becomes a "table" block.
 * Must stay in sync with the blockContent type in schemaTypes/objects.
 */
const schema = compileSchema(
  defineSchema({
    styles: [{ name: "normal" }, { name: "h2" }, { name: "h3" }, { name: "h4" }, { name: "blockquote" }],
    decorators: [{ name: "strong" }, { name: "em" }, { name: "underline" }],
    annotations: [{ name: "link", fields: [{ name: "href", type: "string" }] }],
    lists: [{ name: "bullet" }, { name: "number" }],
    blockObjects: [{ name: "table" }],
  }),
);

const key = () => Math.random().toString(36).slice(2, 14);
const cellText = (el: Element) => (el.textContent || "").replace(/\s+/g, " ").trim();

const tableRule: DeserializerRule = {
  deserialize(el) {
    if (!(el instanceof Element) || el.tagName !== "TABLE") return undefined;
    const rows = Array.from(el.querySelectorAll("tr"))
      // Skip rows of nested tables; they are flattened into their parent cell's text.
      .filter((tr) => tr.closest("table") === el)
      .map((tr) => Array.from(tr.children).filter((c) => c.tagName === "TD" || c.tagName === "TH"))
      .filter((cells) => cells.length)
      .map((cells) => ({
        _type: "tableRow",
        _key: key(),
        cells: cells.flatMap((c) => Array(Math.max(1, Number(c.getAttribute("colspan")) || 1)).fill("").map((_, i) => (i ? "" : cellText(c)))),
      }))
      .filter((r) => r.cells.some(Boolean));
    if (!rows.length) return undefined;
    // Pad short rows so every row has the same number of columns.
    const cols = Math.max(...rows.map((r) => r.cells.length));
    rows.forEach((r) => r.cells.push(...Array(cols - r.cells.length).fill("")));
    return { _type: "table", _key: key(), headerRow: true, rows };
  },
};

export function htmlWithTablesToBlocks(html: string) {
  return htmlToPortableText(html, { schema, rules: [tableRule], keyGenerator: key, whitespaceMode: "normalize" });
}

type PasteInput = { event: { clipboardData?: DataTransfer | null } };

export function pasteTables({ event }: PasteInput) {
  const html = event.clipboardData?.getData("text/html");
  // Plain undefined (not a Promise) lets Studio fall back to its normal paste.
  if (!html || !/<table[\s>]/i.test(html)) return undefined;
  const blocks = htmlWithTablesToBlocks(html);
  if (!blocks.some((b) => b._type === "table")) return undefined;
  return { insert: blocks };
}
