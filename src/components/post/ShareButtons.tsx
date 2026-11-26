"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { SocialIcon } from "@/components/ui/SocialIcons";

const btn =
  "grid size-10 place-items-center rounded-full bg-white text-steel-600 ring-1 ring-line transition-colors hover:bg-accent hover:text-white hover:ring-accent";

export function ShareButtons({ title, url, label }: { title: string; url: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { platform: "linkedin", name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { platform: "x", name: "X", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { platform: "facebook", name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { platform: "whatsapp", name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };

  return (
    <div>
      {label && <p className="text-xs font-semibold uppercase tracking-wider text-steel-500">{label}</p>}
      <div className={`flex flex-wrap gap-2 ${label ? "mt-3" : ""}`}>
        {links.map((l) => (
          <a key={l.platform} href={l.href} target="_blank" rel="noopener noreferrer" className={btn} aria-label={`Share on ${l.name}`} title={`Share on ${l.name}`}>
            <SocialIcon platform={l.platform} className="size-4" />
          </a>
        ))}
        <button type="button" onClick={copy} className={btn} aria-label="Copy link" title={copied ? "Link copied" : "Copy link"}>
          {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        </button>
      </div>
      <span className="sr-only" role="status">{copied ? "Link copied" : ""}</span>
    </div>
  );
}
