"use server";

import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { writeClient } from "@/sanity/lib/write-client";

export type FormState = { ok: boolean; message?: string; errors?: Record<string, string> } | null;

const FORM_TYPES = ["enquiry", "contact", "quote", "career", "callback", "newsletter"] as const;
type FormType = (typeof FORM_TYPES)[number];

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXT = /\.(pdf|docx?|dwg|dxf|png|jpe?g|zip)$/i;
const TEXT_FIELDS = ["name", "company", "email", "phone", "product", "quantity", "destination", "timeline", "customisation", "role", "message"] as const;

const str = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);

export async function submitLead(_prev: FormState, fd: FormData): Promise<FormState> {
  // Honeypot: real users never fill this hidden field.
  if (str(fd, "website")) return { ok: true };

  const formType = str(fd, "formType") as FormType;
  if (!FORM_TYPES.includes(formType)) return { ok: false, message: "Invalid form." };

  const data: Record<string, string> = {};
  for (const k of TEXT_FIELDS) {
    const v = str(fd, k, k === "message" ? 4000 : 300);
    if (v) data[k] = v;
  }
  if (fd.get("customisationNeeded") === "yes") {
    data.customisation = `Yes${data.customisation ? `: ${data.customisation}` : ""}`;
  }

  const errors: Record<string, string> = {};
  const emailOk = !data.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  const phoneOk = !data.phone || /^[\d\s()+-]{7,20}$/.test(data.phone);
  if (formType === "newsletter") {
    if (!data.email) errors.email = "Please enter your email.";
  } else {
    if (!data.name) errors.name = "Please enter your name.";
    if (formType === "callback") {
      if (!data.phone) errors.phone = "Please enter a phone number.";
    } else if (!data.email && !data.phone) {
      errors.email = "Please give an email or phone number so we can reply.";
    }
  }
  if (!emailOk) errors.email = "Please enter a valid email address.";
  if (!phoneOk) errors.phone = "Please enter a valid phone number.";
  if (Object.keys(errors).length) return { ok: false, errors, message: "Please check the highlighted fields." };

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("[forms] SANITY_API_WRITE_TOKEN is not set");
    return { ok: false, message: "The form is temporarily unavailable. Please call or WhatsApp us." };
  }

  try {
    let attachment: { _type: "file"; asset: { _type: "reference"; _ref: string } } | undefined;
    const file = fd.get("attachment");
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_BYTES) return { ok: false, errors: { attachment: "File must be under 10 MB." } };
      if (!ALLOWED_EXT.test(file.name)) return { ok: false, errors: { attachment: "Allowed: PDF, DOC, DWG, DXF, JPG, PNG, ZIP." } };
      const asset = await writeClient.assets.upload("file", Buffer.from(await file.arrayBuffer()), { filename: file.name });
      attachment = { _type: "file", asset: { _type: "reference", _ref: asset._id } };
    }

    const h = await headers();
    // IDs under "submission." are not readable through the public API, keeping leads private.
    await writeClient.create({
      _id: `submission.${randomUUID()}`,
      _type: "submission",
      status: "new",
      formType,
      ...data,
      ...(attachment ? { attachment } : {}),
      pageUrl: str(fd, "pageUrl") || h.get("referer") || "",
      submittedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[forms] failed to save submission", err);
    return { ok: false, message: "Something went wrong. Please try again or contact us on WhatsApp." };
  }

  return { ok: true };
}
