"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";
import { youtubeId } from "@/lib/utils";

export function VideoButton({ url, label = "Play video", className = "" }: { url: string; label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const yt = youtubeId(url);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group grid size-20 place-items-center rounded-full bg-accent text-white shadow-lift transition hover:scale-105 ${className}`}
        aria-label={label}
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-25" />
        <Play className="relative ml-1 size-7 fill-current" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/90 p-4" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <button type="button" className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white" aria-label="Close video">
            <X className="size-5" />
          </button>
          <div className="aspect-video w-full max-w-5xl overflow-hidden rounded-lg bg-black" onClick={(e) => e.stopPropagation()}>
            {yt ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`}
                title={label}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            ) : (
              <video src={url} controls autoPlay className="size-full" />
            )}
          </div>
        </div>
      )}
    </>
  );
}
