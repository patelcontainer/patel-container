import Link from "next/link";

type Props = {
  name: string;
  light?: boolean;
  className?: string;
};

/** Vahana lockup from /public/brand; `light` uses the white version for dark backgrounds. */
export function Logo({ name, light, className = "h-11" }: Props) {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label={`${name} home`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={light ? "/brand/vahana-logo-white.svg" : "/brand/vahana-logo.svg"} alt={name} width={350} height={179} className={`${className} w-auto`} />
    </Link>
  );
}
