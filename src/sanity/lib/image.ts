import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

export type SanityImage = {
  _type?: string;
  asset?: { _ref?: string; _id?: string; url?: string };
  alt?: string;
  caption?: string;
  hotspot?: { x: number; y: number };
  crop?: unknown;
};

export function urlFor(source: SanityImage) {
  return builder.image(source as Parameters<typeof builder.image>[0]).auto("format").fit("max");
}

export function hasImage(img?: SanityImage | null): img is SanityImage {
  return Boolean(img?.asset?._ref || img?.asset?._id);
}

/** Width/height are encoded in the asset id: image-<hash>-<w>x<h>-<ext> */
export function imageDimensions(img?: SanityImage | null) {
  const ref = img?.asset?._ref || img?.asset?._id || "";
  const m = ref.match(/-(\d+)x(\d+)-/);
  return m ? { width: Number(m[1]), height: Number(m[2]) } : { width: 1600, height: 1000 };
}

/** File asset URL from its reference: file-<hash>-<ext> */
export function fileUrl(file?: { asset?: { _ref?: string; url?: string } } | null) {
  if (!file?.asset) return undefined;
  if (file.asset.url) return file.asset.url;
  const m = file.asset._ref?.match(/^file-([a-f0-9]+)-(\w+)$/);
  return m ? `https://cdn.sanity.io/files/${projectId}/${dataset}/${m[1]}.${m[2]}` : undefined;
}
