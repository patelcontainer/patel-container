"use client";

import { useEffect, useState } from "react";
import { ArrowUp, PhoneCall, X } from "lucide-react";
import { useSite } from "./SiteContext";
import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import { LeadForm } from "@/components/forms/LeadForm";

const fab =
  "group relative grid size-12 place-items-center rounded-full shadow-[0_6px_20px_-6px_rgb(10_22_38/0.45)] transition-transform duration-200 hover:-translate-y-0.5 sm:size-14";
const tip =
  "pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block";

/** Floating WhatsApp + callback buttons on every page, and the callback modal. */
export function StickyActions() {
  const site = useSite();
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const t = site.templates;

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onScroll = () => setShowTop(window.scrollY > 800);
    window.addEventListener("open-callback", onOpen);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("open-callback", onOpen);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-center gap-3 sm:bottom-6 sm:right-6">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`grid size-10 place-items-center rounded-full border border-line bg-white text-ink shadow-card transition-all hover:border-ink ${
            showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
          }`}
          aria-label="Back to top"
        >
          <ArrowUp className="size-4" />
        </button>
        <button type="button" onClick={() => setOpen(true)} className={`${fab} bg-navy-900 text-white`} aria-label={t.callbackLabel}>
          <PhoneCall className="size-5" />
          <span className={tip}>{t.callbackLabel}</span>
        </button>
        {site.whatsappUrl && (
          <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${fab} bg-whatsapp text-white`} aria-label={t.whatsappLabel}>
            <WhatsAppIcon className="size-6 sm:size-7" />
            <span className={tip}>{t.whatsappLabel}</span>
          </a>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-end sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="cb-title">
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative max-h-[92svh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-xl sm:p-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-surface text-ink"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            <p className="eyebrow">{t.callbackLabel}</p>
            <h2 id="cb-title" className="mt-3 pr-10 text-2xl font-bold">
              {t.callbackHeading}
            </h2>
            {t.callbackText && <p className="mt-2 text-sm text-steel-600">{t.callbackText}</p>}
            <div className="mt-6">
              <LeadForm type="callback" compact onDone={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
