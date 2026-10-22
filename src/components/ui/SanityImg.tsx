"use client";

import Image from "next/image";
import { urlFor, hasImage, imageDimensions, type SanityImage } from "@/sanity/lib/image";

type Props = {
  image?: SanityImage | null;
  alt?: string;
  className?: string;
  sizes?: string;
  /** Above-the-fold image: preloads and loads eagerly. */
  priority?: boolean;
  /** Load eagerly without preloading (e.g. later hero slides). */
  eager?: boolean;
  /** Fill the parent (parent must be relative + sized). */
  fill?: boolean;
  /** Crop to this aspect ratio (width / height) when not using fill. */
  aspect?: number;
  quality?: number;
};

export function SanityImg({ image, alt, className, sizes = "100vw", priority, eager, fill, aspect, quality = 80 }: Props) {
  if (!hasImage(image)) return null;
  const dims = imageDimensions(image);
  const width = dims.width;
  const height = aspect ? Math.round(width / aspect) : dims.height;
  const altText = alt ?? image.alt ?? "";

  const loader = ({ width: w, quality: q }: { width: number; quality?: number }) => {
    let b = urlFor(image).width(w).quality(q || quality);
    if (aspect) b = b.height(Math.round(w / aspect)).fit("crop");
    return b.url();
  };

  if (fill) {
    return <Image loader={loader} src={urlFor(image).url()} alt={altText} fill sizes={sizes} preload={priority} loading={priority || eager ? "eager" : undefined} className={className} />;
  }
  return (
    <Image
      loader={loader}
      src={urlFor(image).url()}
      alt={altText}
      width={width}
      height={height}
      sizes={sizes}
      preload={priority}
      loading={priority || eager ? "eager" : undefined}
      className={className}
    />
  );
}
