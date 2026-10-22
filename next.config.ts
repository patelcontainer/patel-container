import type { NextConfig } from "next";
import { createClient } from "next-sanity";

/** Redirects managed in Sanity (e.g. old .html URLs from the previous website). Applied at build time. */
async function cmsRedirects() {
  try {
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "8nmek9s0",
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      apiVersion: "2025-10-01",
      useCdn: false,
    });
    const rows = await client.fetch<{ source: string; destination: string; permanent?: boolean }[]>(
      `*[_type == "redirect" && defined(source) && defined(destination)]{source, destination, permanent}`,
    );
    return rows
      .filter((r) => r.source.startsWith("/") && r.source !== r.destination)
      .map((r) => ({ source: encodeURI(r.source), destination: r.destination, permanent: r.permanent !== false }));
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async redirects() {
    return [
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      ...(await cmsRedirects()),
    ];
  },
  async headers() {
    return [
      {
        source: "/((?!studio).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
