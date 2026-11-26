import { Sparkles } from "lucide-react";

/** Opens the article in an AI assistant with a ready-made "summarize this" prompt. */
const TOOLS = [
  { name: "ChatGPT", href: (q: string) => `https://chatgpt.com/?q=${q}` },
  { name: "Claude", href: (q: string) => `https://claude.ai/new?q=${q}` },
  { name: "Perplexity", href: (q: string) => `https://www.perplexity.ai/search/new?q=${q}` },
  { name: "Google AI", href: (q: string) => `https://www.google.com/search?udm=50&q=${q}` },
  { name: "Grok", href: (q: string) => `https://grok.com/?q=${q}` },
];

export function AiSummary({ heading, prompt, className = "" }: { heading: string; prompt: string; className?: string }) {
  const q = encodeURIComponent(prompt);
  return (
    <div className={className}>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-steel-500">
        <Sparkles className="size-3.5 text-accent" aria-hidden /> {heading}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {TOOLS.map((t) => (
          <a
            key={t.name}
            href={t.href(q)}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="rounded-full bg-white px-3.5 py-1.5 text-[0.8rem] font-semibold text-ink ring-1 ring-line transition-colors hover:bg-accent hover:text-white hover:ring-accent"
          >
            {t.name}
          </a>
        ))}
      </div>
    </div>
  );
}
