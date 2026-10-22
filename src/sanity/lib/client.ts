import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// Sanity's API CDN is purged within seconds of a publish; "noStale" stops it serving old copies meanwhile.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});

type FetchArgs = { query: string; params?: Record<string, unknown>; tags?: string[] };

/**
 * Published content, fetched on every request (no Next cache), so edits in the Studio
 * show on the site within seconds of publishing — no webhook needed.
 */
export async function sanityFetch<T>({ query, params = {}, tags = [] }: FetchArgs): Promise<T> {
  return client.fetch<T>(query, params, {
    cacheMode: "noStale",
    cache: "no-store",
    next: { tags: ["sanity", ...tags] },
  });
}
