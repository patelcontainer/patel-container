import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

const isDev = process.env.NODE_ENV === "development";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: !isDev,
  perspective: "published",
});

type FetchArgs = { query: string; params?: Record<string, unknown>; tags?: string[] };

/**
 * Cached fetch for published content. Pages revalidate hourly and immediately
 * when the Sanity webhook hits /api/revalidate (tag "sanity"). In dev, always fresh.
 */
export async function sanityFetch<T>({ query, params = {}, tags = [] }: FetchArgs): Promise<T> {
  return client.fetch<T>(query, params, {
    next: { revalidate: isDev ? 0 : 3600, tags: ["sanity", ...tags] },
  });
}
