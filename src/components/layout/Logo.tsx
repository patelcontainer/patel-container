import Link from "next/link";
import { urlFor, hasImage, type SanityImage } from "@/sanity/lib/image";

type Props = {
  logo?: SanityImage;
  mark?: SanityImage;
  name: string;
  text?: string;
  subtext?: string;
  light?: boolean;
  className?: string;
};

/** Mark + text lockup when a logo mark is set; otherwise the full logo image. */
export function Logo({ logo, mark, name, text, subtext, light, className = "h-11" }: Props) {
  const invert = light ? "brightness-0 invert" : "";
  if (hasImage(mark)) {
    return (
      <Link href="/" className="flex shrink-0 items-center gap-2.5 2xl:gap-3" aria-label={`${name} home`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urlFor(mark).height(160).url()} alt="" className={`${className} w-auto ${invert}`} />
        <span className="min-w-0 leading-none">
          <span className={`block font-display text-[0.95rem] font-extrabold uppercase tracking-[0.02em] sm:text-[1.1rem] xl:text-[0.98rem] 2xl:text-[1.15rem] ${light ? "text-white" : "text-ink"}`}>
            {text || name}
          </span>
          {subtext && (
            <span className={`mt-1.5 block text-[0.6rem] font-semibold uppercase tracking-[0.2em] xl:tracking-[0.14em] 2xl:tracking-[0.22em] ${light ? "text-steel-300" : "text-steel-500"}`}>{subtext}</span>
          )}
        </span>
      </Link>
    );
  }
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label={`${name} home`}>
      {hasImage(logo) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={urlFor(logo).height(160).url()} alt={name} className={`${className} w-auto ${invert}`} />
      ) : (
        <span className={`font-display text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}>{name}</span>
      )}
    </Link>
  );
}
