/**
 * HTML tag choices for headings. Editors pick these in Studio to shape the page outline for SEO;
 * the tag never changes how the heading looks (styling comes from classes).
 */
export const HEADING_TAGS = [
  { title: "H2", value: "h2" },
  { title: "H3", value: "h3" },
  { title: "H4", value: "h4" },
  { title: "H5", value: "h5" },
  { title: "H6", value: "h6" },
  { title: "Paragraph (not a heading)", value: "p" },
] as const;

export type HeadingTag = "h1" | (typeof HEADING_TAGS)[number]["value"];

const VALID = new Set<string>(HEADING_TAGS.map((t) => t.value));

/** Returns the tag if it is a valid choice, otherwise the fallback. */
export const headingTag = (value: unknown, fallback: HeadingTag = "h2"): HeadingTag =>
  typeof value === "string" && VALID.has(value) ? (value as HeadingTag) : fallback;
