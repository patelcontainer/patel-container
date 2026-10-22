import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Sanity webhook target. In sanity.io/manage → API → Webhooks, add:
 *   URL: https://<domain>/api/revalidate   Trigger: create/update/delete   Secret: SANITY_REVALIDATE_SECRET
 * Any published change refreshes the whole site cache (small site, simplest and always correct).
 */
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, process.env.SANITY_REVALIDATE_SECRET);
    if (!isValidSignature) return new NextResponse("Invalid signature", { status: 401 });
    revalidatePath("/", "layout");
    return NextResponse.json({ revalidated: true, type: body?._type, now: Date.now() });
  } catch (err) {
    console.error(err);
    return new NextResponse("Error", { status: 500 });
  }
}
