import Link from "next/link";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Logo } from "./Logo";
import { Newsletter } from "@/components/forms/Newsletter";
import { SocialIcon } from "@/components/ui/SocialIcons";
import { linkHref, telHref } from "@/lib/links";
import type { Settings } from "@/lib/types";

export function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  const copyright = (settings.copyright || `© {year} ${settings.legalName || settings.siteName}. All rights reserved.`).replace("{year}", String(year));
  const primaryAddress = settings.addresses?.[0];

  return (
    <footer className="relative overflow-hidden bg-navy-950 text-steel-300">
      <div className="hazard h-1.5 w-full opacity-90" />
      <div className="corrugated">
        {/* Newsletter band (hidden when the page has its own newsletter section) */}
        <div className="footer-newsletter border-b border-white/10">
          <div className="wrap grid items-center gap-6 py-10 lg:grid-cols-[1fr_auto] lg:py-12 [&>*]:min-w-0">
            <div>
              <h2 className="text-2xl font-bold text-white">{settings.newsletterHeading || "Get industry updates"}</h2>
              {settings.newsletterText && <p className="mt-2 text-steel-300">{settings.newsletterText}</p>}
            </div>
            <Newsletter />
          </div>
        </div>

        <div className="wrap grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-16">
          <div className="lg:col-span-3">
            <Logo name={settings.siteName} light className="h-16" />
            {settings.footerText && <p className="mt-6 max-w-sm leading-relaxed">{settings.footerText}</p>}
            {!!settings.socialLinks?.length && (
              <div className="mt-6 flex gap-2.5">
                {settings.socialLinks.map((s) => (
                  <a
                    key={s._key}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    className="grid size-10 place-items-center rounded-md border border-white/15 text-white transition hover:border-accent hover:bg-accent"
                  >
                    <SocialIcon platform={s.platform} className="size-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {(settings.footerColumns || []).map((col) => (
            <div key={col._key} className="lg:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">{col.title}</h3>
              <ul className="mt-5 space-y-3 text-[0.925rem]">
                {(col.links || []).map((l) => (
                  <li key={l._key}>
                    <Link href={linkHref(l)} className="transition hover:text-accent">
                      {l.label || l.internal?.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {!!settings.topProducts?.length && (
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">Products</h3>
              <ul className="mt-5 space-y-3 text-[0.925rem]">
                {settings.topProducts.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/products/${p.slug}`} className="transition hover:text-accent">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="md:col-span-2 lg:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">Contact</h3>
            <ul className="mt-5 space-y-4 text-[0.925rem]">
              {primaryAddress?.address && (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span className="whitespace-pre-line">{primaryAddress.address}</span>
                </li>
              )}
              {(settings.phones || []).map((p) => (
                <li key={p}>
                  <a href={telHref(p)} className="flex gap-3 transition hover:text-white">
                    <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
                    {p}
                  </a>
                </li>
              ))}
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="flex gap-3 [overflow-wrap:anywhere] transition hover:text-white">
                    <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.businessHours && (
                <li className="flex gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
                  {settings.businessHours}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="wrap flex flex-col gap-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p>{copyright}</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {(settings.legalLinks || []).map((l) => (
                <li key={l._key}>
                  <Link href={linkHref(l)} className="transition hover:text-white">
                    {l.label || l.internal?.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
