/** Shared by server and client components, so it lives outside the "use client" Button module. */
export type ButtonStyle = "primary" | "secondary" | "outline" | "outlineLight" | "whatsapp" | "white";

const styles: Record<ButtonStyle, string> = {
  primary: "bg-accent text-white shadow-sm hover:bg-accent-600 active:bg-accent-700",
  secondary: "bg-navy-900 text-white shadow-sm hover:bg-navy-700",
  outline: "border border-ink/20 bg-white text-ink hover:border-ink hover:bg-ink hover:text-white",
  outlineLight: "border border-white/40 bg-white/5 text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-ink",
  whatsapp: "bg-whatsapp text-white shadow-sm hover:bg-[#1ebe5b]",
  white: "bg-white text-ink shadow-sm hover:bg-accent hover:text-white",
};

const sizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-12 px-6 text-[0.9375rem] sm:h-14 sm:px-8 sm:text-base",
};

export const buttonClass = (style: ButtonStyle = "primary", size: keyof typeof sizes = "md") =>
  `group inline-flex items-center justify-center gap-2.5 rounded-md font-semibold leading-none tracking-[0.01em] whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${sizes[size]} ${styles[style] ?? styles.primary}`;
