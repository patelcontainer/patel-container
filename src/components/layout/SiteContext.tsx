"use client";

import { createContext, useContext, type ReactNode } from "react";
import { resolveTemplates, type Templates } from "@/lib/templates";

export type SiteInfo = {
  siteName: string;
  brochureUrl?: string;
  whatsappUrl?: string;
  phones: string[];
  email?: string;
  responseTime?: string;
  productOptions: string[];
  templates: Templates;
};

const Ctx = createContext<SiteInfo>({ siteName: "", phones: [], productOptions: [], templates: resolveTemplates() });

export function SiteProvider({ value, children }: { value: SiteInfo; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSite = () => useContext(Ctx);

/** Opens the callback modal from anywhere (buttons with url "#callback"). */
export const openCallback = () => window.dispatchEvent(new CustomEvent("open-callback"));
