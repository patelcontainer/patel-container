"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { SanityImg } from "@/components/ui/SanityImg";
import { urlFor } from "@/sanity/lib/image";
import { youtubeId } from "@/lib/utils";
import type { Block } from "@/lib/types";

type Img = Block & { category?: string };

function Lightbox({ images, index, onClose, onNav }: { images: Img[]; index: number; onClose: () => void; onNav: (i: number) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav((index + 1) % images.length);
      if (e.key === "ArrowLeft") onNav((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onClose, onNav]);
  const img = images[index];
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <button type="button" className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white" aria-label="Close">
        <X className="size-5" />
      </button>
      {images.length > 1 && (
        <>
          <button type="button" onClick={(e) => { e.stopPropagation(); onNav((index - 1 + images.length) % images.length); }} className="absolute left-3 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Previous">
            <ChevronLeft className="size-6" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onNav((index + 1) % images.length); }} className="absolute right-3 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Next">
            <ChevronRight className="size-6" />
          </button>
        </>
      )}
      <figure className="max-h-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urlFor(img).width(1800).url()} alt={img.alt || ""} className="max-h-[82vh] w-auto rounded" />
        <figcaption className="mt-3 text-center text-sm text-steel-300">
          {img.caption || img.alt} <span className="ml-2 text-steel-500">{index + 1} / {images.length}</span>
        </figcaption>
      </figure>
    </div>
  );
}

export function ImageGrid({ images }: { images: Img[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img._key || i}
            type="button"
            onClick={() => setOpen(i)}
            className={`group relative overflow-hidden rounded-md bg-surface ${images.length >= 5 && i % 5 === 0 ? "row-span-2 aspect-[3/4] lg:aspect-auto" : "aspect-[4/3]"}`}
            aria-label={`Open image${img.alt ? `: ${img.alt}` : ""}`}
          >
            <SanityImg image={img} fill sizes="(min-width:1024px) 33vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-ink/0 transition group-hover:bg-ink/25" />
            {(img.caption || img.alt) && (
              <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ink/80 p-3 text-left text-sm font-medium text-white transition group-hover:translate-y-0">
                {img.caption || img.alt}
              </span>
            )}
          </button>
        ))}
      </div>
      {open !== null && <Lightbox images={images} index={open} onClose={() => setOpen(null)} onNav={setOpen} />}
    </>
  );
}

export function AlbumsGallery({ albums }: { albums: Block[] }) {
  const [tab, setTab] = useState<"photos" | "videos">("photos");
  const [cat, setCat] = useState("All");
  const [video, setVideo] = useState<string | null>(null);
  const categories = useMemo(() => ["All", ...new Set(albums.map((a) => a.category).filter(Boolean))], [albums]);
  const filtered = albums.filter((a) => cat === "All" || a.category === cat);
  const images: Img[] = filtered.flatMap((a) => (a.images || []).map((im: Block) => ({ ...im, category: a.category })));
  const videos: Block[] = filtered.flatMap((a) => a.videos || []);

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-md bg-surface p-1" role="tablist">
          {(["photos", "videos"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`h-10 rounded px-6 text-sm font-semibold capitalize transition ${tab === t ? "bg-white text-ink shadow-card" : "text-steel-500 hover:text-ink"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setCat(c)} className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium transition ${cat === c ? "bg-navy-900 text-white" : "text-steel-600 ring-1 ring-line hover:ring-ink"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {tab === "photos" ? (
        images.length ? <ImageGrid images={images} /> : <p className="text-steel-500">No photos in this category yet.</p>
      ) : videos.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => {
            const id = youtubeId(v.url);
            return (
              <button key={v._key} type="button" onClick={() => id && setVideo(id)} className="group text-left">
                <div className="relative aspect-video overflow-hidden rounded-md bg-navy-900">
                  {v.thumbnail?.asset ? (
                    <SanityImg image={v.thumbnail} fill sizes="33vw" className="object-cover" />
                  ) : id ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="size-full object-cover" />
                  ) : null}
                  <span className="absolute inset-0 grid place-items-center bg-ink/30 transition group-hover:bg-ink/10">
                    <span className="grid size-14 place-items-center rounded-full bg-accent text-white">
                      <Play className="ml-0.5 size-6 fill-current" />
                    </span>
                  </span>
                </div>
                <p className="mt-3 font-semibold text-ink">{v.title}</p>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-steel-500">Videos will be added soon.</p>
      )}
      {video && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/95 p-4" role="dialog" aria-modal="true" onClick={() => setVideo(null)}>
          <div className="aspect-video w-full max-w-5xl">
            <iframe src={`https://www.youtube-nocookie.com/embed/${video}?autoplay=1&rel=0`} title="Video" allow="autoplay; encrypted-media" allowFullScreen className="size-full rounded" />
          </div>
        </div>
      )}
    </>
  );
}
