import type { ReactNode } from "react";
import { bgClass } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CmsButtons } from "@/components/ui/Button";
import { headingTag } from "@/lib/headings";
import type { Block } from "@/lib/types";

/** Standard section shell: background, anchor id, heading, content and trailing buttons. */
export function Section({
  block,
  children,
  align = "left",
  headingAside,
  className = "",
  showButtons = true,
}: {
  block: Block;
  children?: ReactNode;
  align?: "left" | "center";
  headingAside?: ReactNode;
  className?: string;
  showButtons?: boolean;
}) {
  const dark = block.background === "dark";
  const hasHeading = block.eyebrow || block.heading || block.intro;
  return (
    <section id={block.sectionId || undefined} className={`section relative ${bgClass(block.background)} ${dark ? "corrugated" : ""} ${className}`}>
      <div className="wrap">
        {hasHeading && (
          <div className={`mb-12 flex flex-col gap-6 lg:mb-14 ${headingAside ? "lg:flex-row lg:items-end lg:justify-between" : ""}`}>
            <SectionHeading as={headingTag(block.headingTag)} eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} dark={dark} align={headingAside ? "left" : align} />
            {headingAside}
          </div>
        )}
        {children}
        {showButtons && <CmsButtons buttons={block.buttons} dark={dark} className={`mt-12 ${align === "center" ? "sm:justify-center" : ""}`} />}
      </div>
    </section>
  );
}
