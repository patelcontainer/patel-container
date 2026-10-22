import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, dark }: { items: Crumb[]; dark?: boolean }) {
  const all: Crumb[] = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className={`flex flex-wrap items-center gap-1.5 text-[0.8rem] ${dark ? "text-steel-300" : "text-steel-500"}`}>
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3.5 opacity-50" />}
                {c.href && !last ? (
                  <Link href={c.href} className={`flex items-center gap-1 transition ${dark ? "hover:text-white" : "hover:text-accent"}`}>
                    {i === 0 && <Home className="size-3.5" />}
                    {i === 0 ? <span className="sr-only">{c.label}</span> : c.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined} className={last ? (dark ? "text-white" : "text-ink") : ""}>
                    {c.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            ...(c.href ? { item: absoluteUrl(c.href) } : {}),
          })),
        }}
      />
    </>
  );
}
