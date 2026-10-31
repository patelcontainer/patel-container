import type { HTMLAttributes } from "react";
import type { HeadingTag } from "@/lib/headings";

/** Heading rendered with a configurable tag. A "p" keeps the heading font via the .heading-text class. */
export function Heading({ as: Tag = "h2", className = "", ...props }: { as?: HeadingTag } & HTMLAttributes<HTMLHeadingElement>) {
  return <Tag className={Tag === "p" ? `heading-text ${className}` : className} {...props} />;
}
