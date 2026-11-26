import { webPageSchema } from "@/lib/seo";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here once "<" is escaped
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** WebPage schema for the current page; pass the same inputs as the page's buildMetadata call. */
export async function WebPageJsonLd(props: Parameters<typeof webPageSchema>[0]) {
  return <JsonLd data={await webPageSchema(props)} />;
}
