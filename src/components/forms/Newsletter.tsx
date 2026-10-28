"use client";

import { useActionState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { submitLead, type FormState } from "@/app/actions/forms";

export function Newsletter({ light }: { light?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitLead, null);

  if (state?.ok) {
    return (
      <p className={`flex items-center gap-2 font-medium ${light ? "text-ink" : "text-white"}`} role="status">
        <CheckCircle2 className="size-5 text-green-500" /> You&apos;re subscribed. Thank you!
      </p>
    );
  }

  return (
    <form action={action} className="w-full lg:w-[440px]">
      <input type="hidden" name="formType" value="newsletter" />
      <div className="absolute -left-[9999px]" aria-hidden>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={`flex rounded-md p-1.5 ${light ? "border border-line bg-white" : "bg-white/[0.07] ring-1 ring-white/15"}`}>
        <label htmlFor="nl-email" className="sr-only">
          Email address
        </label>
        <input
          id="nl-email"
          name="email"
          type="email"
          required
          placeholder="Your email address"
          className={`min-w-0 flex-1 bg-transparent px-3 text-[0.95rem] outline-none ${light ? "text-ink placeholder:text-steel-400" : "text-white placeholder:text-white/60"}`}
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          Subscribe
        </button>
      </div>
      {state && !state.ok && <p className="mt-2 text-sm text-red-400">{state.errors?.email || state.message}</p>}
    </form>
  );
}
