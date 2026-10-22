import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  heading,
  intro,
  align = "left",
  dark,
  as: H = "h2",
  className = "",
  children,
}: {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  align?: "left" | "center";
  dark?: boolean;
  as?: "h1" | "h2";
  className?: string;
  children?: React.ReactNode;
}) {
  if (!eyebrow && !heading && !intro) return null;
  const center = align === "center";
  return (
    <Reveal className={`${center ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow && <p className={`eyebrow ${center ? "justify-center" : ""}`}>{eyebrow}</p>}
      {heading && (
        <H className={`mt-4 text-[1.85rem] font-bold leading-[1.12] sm:text-4xl xl:text-[2.6rem] 2xl:text-[2.75rem] ${dark ? "text-white" : "text-ink"}`}>
          {heading}
        </H>
      )}
      {intro && <p className={`mt-4 text-base leading-relaxed sm:mt-5 sm:text-lg ${dark ? "text-steel-300" : "text-steel-600"}`}>{intro}</p>}
      {children}
    </Reveal>
  );
}
