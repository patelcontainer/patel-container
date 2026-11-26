import "server-only";

/** Turnstile is on only when both keys are set (Vercel env + .env.local). */
export const turnstileEnabled = () => Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET);

export const TURNSTILE_ACTION = "contact";

const DEFAULT_HOSTS = ["vahanacontainers.com", "www.vahanacontainers.com", "patel-container.vercel.app"];

function allowedHosts() {
  const fromEnv = (process.env.TURNSTILE_HOSTNAMES || "").split(",").map((h) => h.trim()).filter(Boolean);
  const hosts = fromEnv.length ? fromEnv : DEFAULT_HOSTS;
  return process.env.NODE_ENV === "production" ? hosts : [...hosts, "localhost", "127.0.0.1"];
}

/** Server-side check of a Turnstile token. Tokens are single-use. */
export async function verifyTurnstile(token: string, remoteip?: string): Promise<boolean> {
  if (!token || token.length > 2048) return false;
  try {
    const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET || "", response: token });
    if (remoteip) body.set("remoteip", remoteip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) return false;
    const r: { success?: boolean; action?: string; hostname?: string; "error-codes"?: string[] } = await res.json();
    if (!r.success) {
      console.warn("[turnstile] rejected", r["error-codes"]);
      return false;
    }
    if (r.action !== TURNSTILE_ACTION || !r.hostname || !allowedHosts().includes(r.hostname)) {
      console.warn("[turnstile] action/hostname mismatch", r.action, r.hostname);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[turnstile] verification failed", err);
    return false;
  }
}
