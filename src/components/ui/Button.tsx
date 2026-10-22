"use client";

import Link from "next/link";
import { ArrowRight, Download, PhoneCall } from "lucide-react";
import type { ReactNode } from "react";
import { isExternal, linkHref, type LinkLike } from "@/lib/links";
import { openCallback, useSite } from "@/components/layout/SiteContext";
import { WhatsAppIcon } from "./SocialIcons";

import { buttonClass, type ButtonStyle } from "./button-styles";

export { buttonClass, type ButtonStyle };

type Props = {
  href: string;
  style?: ButtonStyle;
  size?: "md" | "lg" | "sm";
  newTab?: boolean;
  children: ReactNode;
  className?: string;
  icon?: "arrow" | "download" | "none";
};

export function Button({ href, style = "primary", size = "md", newTab, children, className = "", icon }: Props) {
  const site = useSite();
  const cls = `${buttonClass(style, size)} ${className}`;

  if (href === "#callback") {
    return (
      <button type="button" onClick={openCallback} className={cls}>
        <PhoneCall className="size-4" />
        {children}
      </button>
    );
  }

  let target = href;
  let resolvedIcon = icon;
  let download = false;
  if (href === "#brochure") {
    target = site.brochureUrl ? `${site.brochureUrl}?dl=` : "/media/downloads";
    resolvedIcon = "download";
    download = Boolean(site.brochureUrl);
  }
  if (href === "#whatsapp" || style === "whatsapp") {
    target = href === "#whatsapp" ? site.whatsappUrl || "/contact" : href;
  }

  const content = (
    <>
      {style === "whatsapp" && <WhatsAppIcon className="size-[18px]" />}
      {children}
      {resolvedIcon === "download" ? (
        <Download className="size-4" />
      ) : resolvedIcon !== "none" && style !== "whatsapp" ? (
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      ) : null}
    </>
  );

  if (isExternal(target) || download) {
    const blank = newTab || target.startsWith("http");
    return (
      <a href={target} className={cls} target={blank ? "_blank" : undefined} rel={blank ? "noopener noreferrer" : undefined}>
        {content}
      </a>
    );
  }
  return (
    <Link href={target} className={cls}>
      {content}
    </Link>
  );
}

export type CmsButton = LinkLike & { _key?: string; label?: string; style?: ButtonStyle };

export function CmsButtons({ buttons, className = "", size, dark }: { buttons?: CmsButton[] | null; className?: string; size?: "md" | "lg"; dark?: boolean }) {
  if (!buttons?.length) return null;
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center ${className}`}>
      {buttons.map((b, i) => {
        let style = (b.style || (i === 0 ? "primary" : "outline")) as ButtonStyle;
        if (dark && style === "outline") style = "outlineLight";
        if (!dark && style === "outlineLight") style = "outline";
        return (
          <Button key={b._key || i} href={linkHref(b)} style={style} newTab={b.newTab} size={size} className="w-full sm:w-auto">
            {b.label}
          </Button>
        );
      })}
    </div>
  );
}
