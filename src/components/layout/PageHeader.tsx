import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { SanityImg } from "@/components/ui/SanityImg";
import { CmsButtons, type CmsButton } from "@/components/ui/Button";
import type { SanityImage } from "@/sanity/lib/image";

/** Dark title banner used at the top of every inner page (holds the page H1). */
export function PageHeader({
  eyebrow,
  heading,
  intro,
  image,
  crumbs,
  buttons,
  children,
}: {
  eyebrow?: string;
  heading: string;
  intro?: string;
  image?: SanityImage | null;
  crumbs: Crumb[];
  buttons?: CmsButton[] | null;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-900">
      {image && (
        <div className="absolute inset-0 -z-10">
          <SanityImg image={image} fill priority sizes="100vw" className="object-cover opacity-30" />
        </div>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950 via-navy-900/90 to-navy-900/40" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-60" />
      <div className="wrap relative py-12 sm:py-16 xl:py-24">
        <Breadcrumbs items={crumbs} dark />
        <div className="mt-8 max-w-3xl">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-3 text-[2.15rem] font-extrabold leading-[1.08] text-white sm:text-5xl xl:text-6xl">{heading}</h1>
          {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-steel-300">{intro}</p>}
          <CmsButtons buttons={buttons} dark className="mt-8" />
          {children}
        </div>
      </div>
      <div className="absolute bottom-0 right-0 hidden h-1.5 w-1/3 bg-accent lg:block" />
    </section>
  );
}
