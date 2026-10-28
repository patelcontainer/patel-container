"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Mail, Menu, Phone, X, ArrowUpRight, Clock } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { SocialIcon } from "@/components/ui/SocialIcons";
import { docHref, linkHref, telHref } from "@/lib/links";
import type { NavItem, Settings } from "@/lib/types";

const itemHref = (i: { internal?: NavItem["internal"]; url?: string }) => (i.internal?.slug ? docHref(i.internal) : i.url || "#");

export function Header({ settings }: { settings: Settings }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  // Dropdown just clicked: keep it shut until the pointer leaves, since hover/focus would hold it open after navigation
  const [dismissed, setDismissed] = useState<string | null>(null);
  const nav = settings.mainNav || [];
  const phone = settings.phones?.[0];
  const cta = settings.headerCta;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigation (state adjusted during render, per React docs).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const isActive = (item: NavItem) => {
    const href = itemHref(item);
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/") || (item.children || []).some((c) => pathname.startsWith(itemHref(c)));
  };

  return (
    <>
      {/* Top bar */}
      <div className="hidden bg-navy-950 text-[0.8rem] text-steel-300 lg:block">
        <div className="wrap flex h-10 items-center justify-between gap-6">
          <p className="min-w-0 truncate">{settings.announcement}</p>
          <div className="flex shrink-0 items-center gap-6 whitespace-nowrap">
            {settings.businessHours && (
              <span className="hidden items-center gap-2 2xl:flex">
                <Clock className="size-3.5 text-accent" /> {settings.businessHours}
              </span>
            )}
            {phone && (
              <a href={telHref(phone)} className="flex items-center gap-2 transition hover:text-white">
                <Phone className="size-3.5 text-accent" /> {phone}
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 transition hover:text-white">
                <Mail className="size-3.5 text-accent" /> {settings.email}
              </a>
            )}
            {!!settings.socialLinks?.length && (
              <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                {settings.socialLinks.map((s) => (
                  <a key={s._key} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform} className="transition hover:text-white">
                    <SocialIcon platform={s.platform} className="size-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md transition-shadow duration-300 ${
          scrolled ? "border-line shadow-[0_6px_24px_-12px_rgb(6_26_56/0.18)]" : "border-transparent"
        }`}
      >
        <div className="wrap flex h-[72px] items-center justify-between gap-4 lg:h-[84px] 2xl:gap-5">
          <Logo name={settings.siteName} className="h-12 lg:h-14" />

          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-0.5">
              {nav.map((item) => {
                const active = isActive(item);
                const hasChildren = !!item.children?.length;
                const shut = dismissed === item._key;
                const dismiss = () => {
                  setDismissed(item._key);
                  (document.activeElement as HTMLElement | null)?.blur();
                };
                return (
                  <li key={item._key} className="group relative" onMouseLeave={() => shut && setDismissed(null)}>
                    <Link
                      href={itemHref(item)}
                      onClick={dismiss}
                      className={`relative flex items-center gap-0.5 whitespace-nowrap px-[0.4rem] py-7 text-[0.875rem] 2xl:gap-1 2xl:px-[0.5rem] 2xl:text-[0.9375rem] font-medium transition-colors ${
                        active ? "text-accent" : "text-ink hover:text-accent"
                      }`}
                      aria-haspopup={hasChildren || undefined}
                    >
                      {item.label}
                      {hasChildren && <ChevronDown className={`size-3.5 opacity-60 transition-transform ${shut ? "" : "group-hover:rotate-180"}`} />}
                      <span
                        className={`absolute inset-x-[0.4rem] bottom-5 2xl:inset-x-[0.5rem] h-0.5 origin-left bg-accent transition-transform duration-300 ${
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                    {hasChildren && (
                      <div
                        className={`invisible absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-200 ${
                          shut ? "" : "group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
                        }`}
                      >
                        <div
                          className={`overflow-hidden rounded-lg border border-line bg-white p-2 shadow-lift ${
                            item.children!.length > 4 ? "grid w-[560px] grid-cols-2" : "w-[300px]"
                          }`}
                        >
                          {item.children!.map((c) => (
                            <Link key={c._key} href={itemHref(c)} onClick={dismiss} className="group/item flex items-start gap-3 rounded-md p-3 transition hover:bg-surface">
                              <span className="mt-1.5 size-1.5 shrink-0 bg-accent opacity-40 transition group-hover/item:opacity-100" />
                              <span>
                                <span className="block text-sm font-semibold text-ink group-hover/item:text-accent">{c.label}</span>
                                {c.description && <span className="mt-0.5 block text-[0.8rem] leading-snug text-steel-500">{c.description}</span>}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {cta?.label && (
              <span className="hidden sm:block">
                <Button href={linkHref(cta)} style="primary" className="xl:h-11 xl:px-5 2xl:h-12 2xl:px-6">
                  {cta.label}
                </Button>
              </span>
            )}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid size-11 place-items-center rounded-md border border-line text-ink xl:hidden"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-[60] overflow-hidden xl:hidden ${open ? "" : "pointer-events-none invisible delay-300"}`} aria-hidden={!open}>
        <div className={`absolute inset-0 bg-ink/50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
        <div
          className={`absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex h-[76px] items-center justify-between border-b border-line px-4">
            <Logo name={settings.siteName} className="h-11" />
            <button type="button" onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-md border border-line" aria-label="Close menu">
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-3" aria-label="Mobile">
            <ul className="divide-y divide-line">
              {nav.map((item) => {
                const hasChildren = !!item.children?.length;
                const isOpen = expanded === item._key;
                return (
                  <li key={item._key}>
                    <div className="flex items-center justify-between">
                      <Link href={itemHref(item)} className={`flex-1 py-3.5 text-base font-semibold ${isActive(item) ? "text-accent" : "text-ink"}`}>
                        {item.label}
                      </Link>
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => setExpanded(isOpen ? null : item._key)}
                          className="grid size-10 place-items-center"
                          aria-label={`Show ${item.label} links`}
                          aria-expanded={isOpen}
                        >
                          <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                    {hasChildren && isOpen && (
                      <ul className="mb-3 space-y-1 border-l-2 border-accent pl-4">
                        {item.children!.map((c) => (
                          <li key={c._key}>
                            <Link href={itemHref(c)} className="block py-2 text-[0.95rem] text-steel-600">
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="space-y-3 border-t border-line bg-surface p-4">
            {cta?.label && (
              <Button href={linkHref(cta)} className="w-full">
                {cta.label}
              </Button>
            )}
            {phone && (
              <a href={telHref(phone)} className="flex items-center justify-center gap-2 py-1 text-sm font-semibold text-ink">
                <Phone className="size-4 text-accent" /> {phone}
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center justify-center gap-2 text-sm text-steel-600">
                <ArrowUpRight className="size-4" /> {settings.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
