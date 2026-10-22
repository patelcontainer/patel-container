"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Paperclip, Send } from "lucide-react";
import { submitLead, type FormState } from "@/app/actions/forms";
import { useSite } from "@/components/layout/SiteContext";

export type LeadFormType = "enquiry" | "contact" | "quote" | "career" | "callback";

type Props = {
  type: LeadFormType;
  submitLabel?: string;
  productOptions?: string[];
  jobOptions?: string[];
  defaultProduct?: string;
  compact?: boolean;
  onDone?: () => void;
};

const TIMELINES = ["Immediately", "Within 1 month", "1–3 months", "3–6 months", "Just exploring"];
const CALL_TIMES = ["Morning (9am–12pm)", "Afternoon (12pm–4pm)", "Evening (4pm–7pm)", "Any time"];

function Field({ label, name, error, required, children }: { label: string; name: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="field-label">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function LeadForm({ type, submitLabel, productOptions, jobOptions, defaultProduct, compact, onDone }: Props) {
  const site = useSite();
  const router = useRouter();
  const [state, action, pending] = useActionState<FormState, FormData>(submitLead, null);
  const [custom, setCustom] = useState("no");
  const [fileName, setFileName] = useState("");
  const products = productOptions?.length ? productOptions : site.productOptions;
  const e = state?.errors || {};

  useEffect(() => {
    if (state?.ok && type === "quote") router.push("/get-a-quote/thank-you");
  }, [state, type, router]);

  if (state?.ok && type !== "quote") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-green-200 bg-green-50 p-6 sm:p-8" role="status">
        <CheckCircle2 className="size-10 text-green-600" />
        <div>
          <p className="font-display text-xl font-bold text-ink">
            {type === "career" ? "Application received." : type === "callback" ? site.templates.callbackHeading : site.templates.formSuccessTitle}
          </p>
          <p className="mt-2 text-steel-600">{site.templates.formSuccessText}</p>
        </div>
        {onDone && (
          <button type="button" onClick={onDone} className="text-sm font-semibold text-accent">
            Close
          </button>
        )}
      </div>
    );
  }

  const productSelect = (
    <Field label={type === "quote" ? "Product type" : "Product of interest"} name="product" required={type === "quote"}>
      <select id="f-product" name="product" className="field" defaultValue={defaultProduct || ""} required={type === "quote"}>
        <option value="">Select a product</option>
        {products.map((p) => (
          <option key={p}>{p}</option>
        ))}
        <option>Other / custom</option>
      </select>
    </Field>
  );

  const grid = compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2 sm:gap-5";

  return (
    <form
      action={action}
      className="space-y-5"
      noValidate
      onSubmit={(e) => {
        const input = e.currentTarget.elements.namedItem("pageUrl");
        if (input instanceof HTMLInputElement) input.value = window.location.href;
      }}
    >
      <input type="hidden" name="formType" value={type} />
      <input type="hidden" name="pageUrl" defaultValue="" />
      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className={grid}>
        <Field label="Full name" name="name" required error={e.name}>
          <input id="f-name" name="name" className="field" autoComplete="name" required placeholder="Your name" />
        </Field>

        {type !== "career" && type !== "callback" && (
          <Field label="Company" name="company">
            <input id="f-company" name="company" className="field" autoComplete="organization" placeholder="Company name" />
          </Field>
        )}

        <Field label="Phone" name="phone" required={type === "callback"} error={e.phone}>
          <input id="f-phone" name="phone" type="tel" className="field" autoComplete="tel" placeholder="+91" required={type === "callback"} />
        </Field>

        {type !== "callback" && (
          <Field label="Email" name="email" error={e.email}>
            <input id="f-email" name="email" type="email" className="field" autoComplete="email" placeholder="you@company.com" />
          </Field>
        )}

        {type === "callback" && (
          <Field label="Best time to call" name="timeline">
            <select id="f-timeline" name="timeline" className="field" defaultValue="">
              <option value="">Any time</option>
              {CALL_TIMES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
        )}

        {(type === "enquiry" || type === "contact" || type === "quote") && productSelect}

        {(type === "enquiry" || type === "contact" || type === "quote") && (
          <Field label="Quantity" name="quantity">
            <input id="f-quantity" name="quantity" className="field" inputMode="numeric" placeholder="e.g. 20 units" />
          </Field>
        )}

        {type === "contact" && (
          <Field label="Expected timeline" name="timeline">
            <select id="f-timeline" name="timeline" className="field" defaultValue="">
              <option value="">Select</option>
              {TIMELINES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
        )}

        {type === "quote" && (
          <Field label="Delivery destination" name="destination">
            <input id="f-destination" name="destination" className="field" placeholder="City / port / country" />
          </Field>
        )}

        {type === "career" && (
          <Field label="Role applied for" name="role">
            {jobOptions?.length ? (
              <select id="f-role" name="role" className="field" defaultValue="">
                <option value="">Select a role</option>
                {jobOptions.map((j) => (
                  <option key={j}>{j}</option>
                ))}
                <option>General application</option>
              </select>
            ) : (
              <input id="f-role" name="role" className="field" placeholder="e.g. Welding supervisor" />
            )}
          </Field>
        )}
      </div>

      {type === "quote" && (
        <fieldset className="rounded-md border border-line p-4">
          <legend className="px-1 text-[0.8125rem] font-semibold text-ink">Customisation needed?</legend>
          <div className="flex gap-6">
            {["no", "yes"].map((v) => (
              <label key={v} className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="radio" name="customisationNeeded" value={v} checked={custom === v} onChange={() => setCustom(v)} className="size-4 accent-accent" />
                {v === "yes" ? "Yes" : "No, standard spec"}
              </label>
            ))}
          </div>
          {custom === "yes" && (
            <textarea name="customisation" rows={2} className="field mt-3" placeholder="Doors, ventilation, insulation, paint colour, partitions, fittings…" />
          )}
        </fieldset>
      )}

      {type !== "callback" && (
        <Field label={type === "career" ? "Cover note" : "Message"} name="message">
          <textarea
            id="f-message"
            name="message"
            rows={compact ? 3 : 4}
            className="field resize-y"
            placeholder={type === "career" ? "Tell us briefly about your experience" : "Tell us about your requirement"}
          />
        </Field>
      )}

      {(type === "quote" || type === "career") && (
        <Field label={type === "career" ? "Upload CV" : "Drawings / specs (optional)"} name="attachment" error={e.attachment}>
          <label
            htmlFor="f-attachment"
            className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-steel-300 bg-surface px-4 py-3.5 text-sm text-steel-600 transition hover:border-accent"
          >
            <Paperclip className="size-4 text-accent" />
            <span className="min-w-0 truncate">{fileName || "Choose a file — PDF, DOC, DWG, DXF, JPG, PNG or ZIP, up to 10 MB"}</span>
          </label>
          <input
            id="f-attachment"
            name="attachment"
            type="file"
            className="sr-only"
            accept=".pdf,.doc,.docx,.dwg,.dxf,.png,.jpg,.jpeg,.zip"
            onChange={(ev) => setFileName(ev.target.files?.[0]?.name || "")}
          />
        </Field>
      )}

      {state && !state.ok && state.message && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-7 text-[0.9rem] font-semibold text-white shadow-[0_8px_20px_-8px_rgb(236_106_30/0.6)] transition hover:bg-accent-600 disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {pending ? "Sending…" : submitLabel || (type === "quote" ? "Request Quote" : type === "career" ? "Submit Application" : type === "callback" ? "Request Callback" : "Send Enquiry")}
        </button>
        <PrivacyNote text={site.templates.formPrivacyNote} />
      </div>
    </form>
  );
}

/** Renders the CMS privacy note, linking the words "privacy policy" when present. */
function PrivacyNote({ text }: { text: string }) {
  const i = text.toLowerCase().indexOf("privacy policy");
  if (i < 0) return <p className="text-xs text-steel-500">{text}</p>;
  return (
    <p className="text-xs text-steel-500">
      {text.slice(0, i)}
      <Link href="/privacy-policy" className="underline">
        {text.slice(i, i + 14)}
      </Link>
      {text.slice(i + 14)}
    </p>
  );
}
