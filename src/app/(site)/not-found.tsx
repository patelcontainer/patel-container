import Link from "next/link";
import { Search } from "lucide-react";
import { buttonClass } from "@/components/ui/button-styles";
import { getTemplates } from "@/lib/seo";

export default async function NotFound() {
  const t = await getTemplates();
  return (
    <section className="corrugated relative overflow-hidden bg-navy-900">
      <div className="wrap flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="font-display text-[7rem] font-extrabold leading-none text-white/10 sm:text-[10rem]">404</p>
        <h1 className="-mt-6 text-4xl font-extrabold text-white sm:text-5xl">{t.notFoundHeading}</h1>
        <p className="mt-4 max-w-md text-lg text-steel-300">{t.notFoundText}</p>
        <form action="/search" className="mt-8 flex w-full max-w-md rounded-md bg-white p-1.5">
          <label htmlFor="nf-q" className="sr-only">Search</label>
          <input id="nf-q" name="q" placeholder="Search the site" className="min-w-0 flex-1 px-3 text-ink outline-none" />
          <button className="inline-flex h-11 items-center gap-2 rounded bg-accent px-4 text-sm font-semibold text-white"><Search className="size-4" /> Search</button>
        </form>
        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link href="/" className={buttonClass("primary")}>Go to Home</Link>
          <Link href="/products" className={buttonClass("outlineLight")}>View Products</Link>
          <Link href="/contact" className={buttonClass("outlineLight")}>Contact Us</Link>
        </div>
      </div>
    </section>
  );
}
