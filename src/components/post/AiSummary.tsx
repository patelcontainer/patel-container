import { Sparkles } from "lucide-react";

/** Opens the article in an AI assistant with a ready-made "summarize this" prompt. */
const TOOLS = [
  { name: "ChatGPT", href: (q: string) => `https://chatgpt.com/?q=${q}` },
  { name: "Claude", href: (q: string) => `https://claude.ai/new?q=${q}` },
  { name: "Perplexity", href: (q: string) => `https://www.perplexity.ai/search/new?q=${q}` },
  { name: "Google AI", href: (q: string) => `https://www.google.com/search?udm=50&q=${q}` },
  { name: "Grok", href: (q: string) => `https://grok.com/?q=${q}` },
];

export function AiSummary({ heading, prompt, className = "bg-surface" }: { heading: string; prompt: string; className?: string }) {
  const q = encodeURIComponent(prompt);
  return (
    <div className={`rounded-md p-5 ring-1 ring-line sm:p-6 ${className}`}>
      <p className="flex items-center gap-2 font-semibold text-ink">
        <Sparkles className="size-5 text-accent" /> {heading}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {TOOLS.map((t) => (
          <a
            key={t.name}
            href={t.href(q)}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink ring-1 ring-line transition-colors hover:bg-accent hover:text-white hover:ring-accent"
          >
            {t.name}
          </a>
        ))}
      </div>
    </div>
  );
}
