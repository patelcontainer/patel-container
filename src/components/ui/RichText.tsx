import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import Link from "next/link";
import { SanityImg } from "./SanityImg";
import { isExternal } from "@/lib/links";
import { slugify } from "@/lib/utils";

const components: PortableTextComponents = {
  block: {
    h2: ({ children, value }) => <h2 id={slugify(blockText(value))}>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
  },
  marks: {
    link: ({ children, value }) => {
      const href: string = value?.href || "#";
      if (isExternal(href)) {
        return (
          <a href={href} target={value?.newTab ? "_blank" : undefined} rel={value?.newTab ? "noopener noreferrer" : undefined}>
            {children}
          </a>
        );
      }
      return <Link href={href}>{children}</Link>;
    },
  },
  types: {
    imageWithAlt: ({ value }) => (
      <figure className="my-8">
        <SanityImg image={value} className="w-full rounded-md" sizes="(min-width: 1024px) 760px, 100vw" />
        {value?.caption && <figcaption className="mt-2 text-sm text-steel-500">{value.caption}</figcaption>}
      </figure>
    ),
  },
};

export function blockText(block: unknown): string {
  const b = block as { children?: { text?: string }[] };
  return (b?.children || []).map((c) => c.text || "").join("");
}

export function RichText({ value, dark, className = "" }: { value?: readonly unknown[] | null; dark?: boolean; className?: string }) {
  if (!value?.length) return null;
  return (
    <div className={`rich ${dark ? "rich-dark" : ""} ${className}`}>
      <PortableText value={value as PortableTextBlock[]} components={components} />
    </div>
  );
}
