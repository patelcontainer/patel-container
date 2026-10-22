import { defineArrayMember, defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons/Cog";
import { DocumentIcon } from "@sanity/icons/Document";
import { PackageIcon } from "@sanity/icons/Package";
import { TagIcon } from "@sanity/icons/Tag";
import { BulbOutlineIcon } from "@sanity/icons/BulbOutline";
import { ProjectsIcon } from "@sanity/icons/Projects";
import { ImagesIcon } from "@sanity/icons/Images";
import { ComposeIcon } from "@sanity/icons/Compose";
import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import { CheckmarkCircleIcon } from "@sanity/icons/CheckmarkCircle";
import { UserIcon } from "@sanity/icons/User";
import { CaseIcon } from "@sanity/icons/Case";
import { DownloadIcon } from "@sanity/icons/Download";
import { StarIcon } from "@sanity/icons/Star";
import { ArrowRightIcon } from "@sanity/icons/ArrowRight";
import { InboxIcon } from "@sanity/icons/Inbox";
import { TagsIcon } from "@sanity/icons/Tags";
import { pageBuilderMembers } from "../blocks";
import { ICON_OPTIONS } from "../../../lib/icon-names";
import { TEMPLATE_FIELDS, TEMPLATE_FIELDSETS } from "../../../lib/templates";

const seoField = defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" });
const orderField = defineField({
  name: "order",
  title: "Sort order",
  type: "number",
  description: "Lower numbers show first.",
  group: "settings",
});
const slugField = (source = "title") =>
  defineField({
    name: "slug",
    type: "slug",
    options: { source, maxLength: 96 },
    validation: (r) => r.required(),
    group: "content",
  });

const contentGroups = [
  { name: "content", title: "Content", default: true },
  { name: "seo", title: "SEO" },
  { name: "settings", title: "Settings" },
];

/* ───────────────────────── Site settings (singleton) ───────────────────────── */

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "brand", title: "Brand", default: true },
    { name: "contact", title: "Contact" },
    { name: "header", title: "Header & menu" },
    { name: "footer", title: "Footer" },
    { name: "seo", title: "SEO defaults" },
    { name: "templates", title: "Page templates" },
    { name: "integrations", title: "Integrations" },
  ],
  fields: [
    defineField({ name: "siteName", type: "string", group: "brand", validation: (r) => r.required() }),
    defineField({ name: "legalName", type: "string", group: "brand" }),
    defineField({ name: "tagline", type: "string", group: "brand" }),
    defineField({ name: "logo", type: "image", group: "brand", description: "Full logo. Used on light backgrounds.", options: { hotspot: true } }),
    defineField({
      name: "logoMark",
      title: "Logo mark (symbol only)",
      type: "image",
      group: "brand",
      options: { hotspot: true },
      description: "Optional. If set, the header shows this symbol next to the company name in text, which stays readable at small sizes. Use the crop tool to frame just the symbol.",
    }),
    defineField({ name: "logoText", title: "Name shown next to the mark", type: "string", group: "brand" }),
    defineField({ name: "logoSubtext", title: "Small line under the name", type: "string", group: "brand" }),
    defineField({
      name: "logoLight",
      title: "Logo for dark backgrounds",
      type: "image",
      group: "brand",
      description: "Optional. If empty, the main logo is shown inverted to white.",
    }),
    defineField({ name: "brochure", title: "Company brochure (PDF)", type: "file", group: "brand" }),
    defineField({ name: "foundingYear", type: "string", group: "brand" }),

    defineField({
      name: "phones",
      type: "array",
      group: "contact",
      of: [{ type: "string" }],
      description: 'Formatted for display, e.g. "+91 70464 68484". First number is the primary.',
    }),
    defineField({ name: "email", type: "string", group: "contact" }),
    defineField({ name: "salesEmail", title: "Sales / export email", type: "string", group: "contact" }),
    defineField({
      name: "whatsappNumber",
      title: "WhatsApp number",
      type: "string",
      group: "contact",
      description: "Digits with country code, no + or spaces, e.g. 917046468484",
    }),
    defineField({
      name: "whatsappMessage",
      title: "WhatsApp pre-filled message",
      type: "string",
      group: "contact",
    }),
    defineField({ name: "addresses", type: "array", group: "contact", of: [defineArrayMember({ type: "address" })] }),
    defineField({ name: "businessHours", type: "string", group: "contact" }),
    defineField({
      name: "responseTime",
      title: "Response time promise",
      type: "string",
      group: "contact",
      description: 'Used across forms, e.g. "one working day".',
    }),
    defineField({
      name: "socialLinks",
      type: "array",
      group: "contact",
      of: [
        defineArrayMember({
          type: "object",
          name: "social",
          fields: [
            defineField({
              name: "platform",
              type: "string",
              options: { list: ["linkedin", "facebook", "instagram", "youtube", "x", "whatsapp"] },
            }),
            defineField({ name: "url", type: "url" }),
          ],
          preview: { select: { title: "platform", subtitle: "url" } },
        }),
      ],
    }),

    defineField({
      name: "announcement",
      title: "Top bar message",
      type: "string",
      group: "header",
      description: "Short line shown in the slim top bar. Leave empty to hide the message.",
    }),
    defineField({ name: "mainNav", title: "Main menu", type: "array", group: "header", of: [defineArrayMember({ type: "navItem" })] }),
    defineField({ name: "headerCta", title: "Header button", type: "button", group: "header" }),

    defineField({ name: "footerText", title: "Footer about text", type: "text", rows: 3, group: "footer" }),
    defineField({
      name: "footerColumns",
      type: "array",
      group: "footer",
      of: [
        defineArrayMember({
          type: "object",
          name: "footerColumn",
          fields: [
            defineField({ name: "title", type: "string" }),
            defineField({ name: "links", type: "array", of: [defineArrayMember({ type: "link" })] }),
          ],
          preview: { select: { title: "title" } },
        }),
      ],
    }),
    defineField({ name: "legalLinks", type: "array", group: "footer", of: [defineArrayMember({ type: "link" })] }),
    defineField({ name: "newsletterHeading", type: "string", group: "footer" }),
    defineField({ name: "newsletterText", type: "string", group: "footer" }),
    defineField({ name: "copyright", type: "string", group: "footer", description: "Use {year} for the current year." }),

    defineField({
      name: "titleTemplate",
      type: "string",
      group: "seo",
      description: 'Appended to page titles, e.g. "%s | Patel Container India"',
    }),
    defineField({ name: "defaultSeo", title: "Default SEO", type: "seo", group: "seo" }),
    defineField({
      name: "googleSiteVerification",
      title: "Google Search Console verification code",
      type: "string",
      group: "seo",
    }),

    defineField({
      name: "templates",
      title: "Page template text",
      type: "object",
      group: "templates",
      description: 'Wording used on product, category, industry, case study and article pages, the 404 page, forms and the callback popup. Leave a field empty to use the default shown as placeholder. Use {title} for the product/industry name and {time} for the response-time promise.',
      fieldsets: TEMPLATE_FIELDSETS.map((f) => ({ ...f, options: { collapsible: true, collapsed: f.name !== "general" } })),
      fields: TEMPLATE_FIELDS.map((f) =>
        defineField({
          name: f.name,
          title: f.title,
          type: "rows" in f ? "text" : "string",
          ...("rows" in f ? { rows: f.rows } : {}),
          fieldset: f.fieldset,
          placeholder: f.default,
        }),
      ),
    }),
    defineField({
      name: "gaId",
      title: "Google Analytics 4 ID",
      type: "string",
      group: "integrations",
      description: "e.g. G-XXXXXXX",
    }),
    defineField({
      name: "gtmId",
      title: "Google Tag Manager ID",
      type: "string",
      group: "integrations",
      description: "e.g. GTM-XXXXXX",
    }),
    defineField({
      name: "notificationEmails",
      title: "Lead notification emails",
      type: "array",
      group: "integrations",
      of: [{ type: "string" }],
      description: "Who should be emailed when a form is submitted (requires email service setup).",
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

/* ───────────────────────── Pages ───────────────────────── */

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: DocumentIcon,
  groups: contentGroups,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required(), group: "content" }),
    defineField({
      name: "slug",
      title: "URL path",
      type: "slug",
      group: "content",
      description: 'Full path without leading slash, e.g. "about-us/careers". Use "home" for the homepage.',
      options: { source: "title", maxLength: 120, slugify: (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9/]+/g, "-").replace(/^-+|-+$/g, "") },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "parent",
      title: "Parent page (for breadcrumbs)",
      type: "reference",
      to: [{ type: "page" }],
      group: "settings",
    }),
    defineField({
      name: "header",
      title: "Page header",
      type: "object",
      group: "content",
      description: "The title banner at the top of inner pages. Not used if the page starts with a Hero section.",
      options: { collapsible: true },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "heading", type: "string", description: "Defaults to the page title. This is the page's H1." }),
        defineField({ name: "intro", type: "text", rows: 3 }),
        defineField({ name: "image", type: "imageWithAlt" }),
        defineField({ name: "buttons", type: "array", of: [defineArrayMember({ type: "button" })] }),
      ],
    }),
    defineField({
      name: "pageBuilder",
      title: "Sections",
      type: "array",
      group: "content",
      of: pageBuilderMembers,
      options: {
        insertMenu: {
          views: [{ name: "list" }],
        },
      },
    }),
    seoField,
  ],
  preview: {
    select: { title: "title", slug: "slug.current" },
    prepare: ({ title, slug }) => ({ title, subtitle: slug === "home" ? "/" : `/${slug ?? ""}` }),
  },
});

/* ───────────────────────── Products ───────────────────────── */

export const productCategory = defineType({
  name: "productCategory",
  title: "Product category",
  type: "document",
  icon: TagIcon,
  groups: contentGroups,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required(), group: "content" }),
    slugField(),
    defineField({ name: "icon", type: "string", group: "content", options: { list: ICON_OPTIONS }, description: "Shown when there is no image." }),
    defineField({ name: "shortDescription", type: "text", rows: 2, group: "content" }),
    defineField({ name: "image", type: "imageWithAlt", group: "content" }),
    defineField({ name: "body", title: "Category page content", type: "blockContent", group: "content" }),
    defineField({
      name: "highlights",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "iconItem" })],
      description: "Shown on the category page, useful when there are no product pages yet.",
    }),
    orderField,
    seoField,
  ],
  orderings: [{ title: "Sort order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "shortDescription", media: "image" } },
});

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  icon: PackageIcon,
  groups: [
    { name: "content", title: "Overview", default: true },
    { name: "specs", title: "Specifications" },
    { name: "media", title: "Gallery & files" },
    { name: "related", title: "Related" },
    { name: "seo", title: "SEO" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required(), group: "content" }),
    slugField(),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "productCategory" }],
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({ name: "shortDescription", type: "text", rows: 3, group: "content" }),
    defineField({ name: "mainImage", type: "imageWithAlt", group: "content" }),
    defineField({ name: "body", title: "Detailed description", type: "blockContent", group: "content" }),
    defineField({
      name: "keySpecs",
      title: "Key specs summary",
      description: "Shown as a spec plate near the top: length, width, height, payload, gross weight…",
      type: "array",
      group: "specs",
      of: [defineArrayMember({ type: "keyValue" })],
    }),
    defineField({
      name: "specGroups",
      title: "Full specification table",
      type: "array",
      group: "specs",
      of: [
        defineArrayMember({
          type: "object",
          name: "specGroup",
          fields: [
            defineField({ name: "title", type: "string", description: 'E.g. "External dimensions"' }),
            defineField({ name: "rows", type: "array", of: [defineArrayMember({ type: "keyValue" })] }),
          ],
          preview: { select: { title: "title" } },
        }),
      ],
    }),
    defineField({ name: "features", title: "Features", type: "array", group: "specs", of: [defineArrayMember({ type: "iconItem" })] }),
    defineField({ name: "materials", title: "Materials & construction", type: "array", group: "specs", of: [{ type: "string" }] }),
    defineField({ name: "applications", type: "array", group: "specs", of: [{ type: "string" }] }),
    defineField({
      name: "industries",
      type: "array",
      group: "related",
      of: [defineArrayMember({ type: "reference", to: [{ type: "industry" }] })],
    }),
    defineField({ name: "gallery", type: "array", group: "media", of: [defineArrayMember({ type: "imageWithAlt" })], options: { layout: "grid" } }),
    defineField({ name: "drawings", title: "Technical drawings", type: "array", group: "media", of: [defineArrayMember({ type: "imageWithAlt" })], options: { layout: "grid" } }),
    defineField({ name: "datasheet", title: "Datasheet (PDF)", type: "file", group: "media" }),
    defineField({
      name: "relatedProducts",
      type: "array",
      group: "related",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
    }),
    defineField({
      name: "faqs",
      type: "array",
      group: "related",
      of: [defineArrayMember({ type: "reference", to: [{ type: "faq" }] })],
    }),
    defineField({ name: "featured", title: "Show in footer / top products", type: "boolean", group: "settings" }),
    orderField,
    seoField,
  ],
  orderings: [{ title: "Sort order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "category.title", media: "mainImage" } },
});

/* ───────────────────────── Industries ───────────────────────── */

export const industry = defineType({
  name: "industry",
  title: "Industry",
  type: "document",
  icon: BulbOutlineIcon,
  groups: contentGroups,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required(), group: "content" }),
    slugField(),
    defineField({ name: "icon", type: "string", group: "content", options: { list: ICON_OPTIONS } }),
    defineField({ name: "shortDescription", type: "text", rows: 2, group: "content" }),
    defineField({ name: "image", type: "imageWithAlt", group: "content" }),
    defineField({ name: "challenge", title: "The challenge", type: "blockContent", group: "content" }),
    defineField({ name: "solution", title: "Our solution", type: "blockContent", group: "content" }),
    defineField({ name: "solutionPoints", title: "Solution highlights", type: "array", group: "content", of: [{ type: "string" }] }),
    defineField({
      name: "recommendedProducts",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }, { type: "productCategory" }] })],
    }),
    defineField({ name: "caseStudy", title: "Related case study", type: "reference", to: [{ type: "project" }], group: "content" }),
    orderField,
    seoField,
  ],
  orderings: [{ title: "Sort order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "shortDescription", media: "image" } },
});

/* ───────────────────────── Projects & gallery ───────────────────────── */

export const project = defineType({
  name: "project",
  title: "Project / case study",
  type: "document",
  icon: ProjectsIcon,
  groups: contentGroups,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required(), group: "content" }),
    slugField(),
    defineField({
      name: "filter",
      title: "Filter group",
      type: "string",
      group: "content",
      options: { list: ["Containers", "Rail", "EV", "Engineering"] },
    }),
    defineField({ name: "industry", type: "reference", to: [{ type: "industry" }], group: "content" }),
    defineField({ name: "client", type: "string", group: "content" }),
    defineField({ name: "productLabel", title: "Product", type: "string", group: "content" }),
    defineField({ name: "quantity", type: "string", group: "content" }),
    defineField({ name: "year", type: "string", group: "content" }),
    defineField({ name: "location", type: "string", group: "content" }),
    defineField({ name: "mainImage", type: "imageWithAlt", group: "content" }),
    defineField({ name: "summary", type: "text", rows: 3, group: "content" }),
    defineField({ name: "isCaseStudy", title: "Has a full case study page", type: "boolean", initialValue: false, group: "content" }),
    defineField({ name: "requirement", title: "Customer requirement", type: "blockContent", group: "content" }),
    defineField({ name: "solution", title: "Our solution", type: "blockContent", group: "content" }),
    defineField({ name: "result", title: "Result", type: "blockContent", group: "content" }),
    defineField({ name: "resultStats", type: "array", group: "content", of: [defineArrayMember({ type: "keyValue" })] }),
    defineField({ name: "gallery", type: "array", group: "content", of: [defineArrayMember({ type: "imageWithAlt" })], options: { layout: "grid" } }),
    defineField({
      name: "testimonial",
      title: "Client quote",
      type: "object",
      group: "content",
      fields: [
        defineField({ name: "quote", type: "text", rows: 3 }),
        defineField({ name: "name", type: "string" }),
        defineField({ name: "role", type: "string" }),
      ],
    }),
    defineField({ name: "featured", type: "boolean", group: "settings" }),
    orderField,
    seoField,
  ],
  orderings: [{ title: "Sort order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "client", media: "mainImage" } },
});

export const galleryAlbum = defineType({
  name: "galleryAlbum",
  title: "Gallery album",
  type: "document",
  icon: ImagesIcon,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "category",
      type: "string",
      options: { list: ["Products", "Plant and Machinery", "Testing", "Events"] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "images", type: "array", of: [defineArrayMember({ type: "imageWithAlt" })], options: { layout: "grid" } }),
    defineField({
      name: "videos",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "video",
          fields: [
            defineField({ name: "title", type: "string" }),
            defineField({ name: "url", title: "YouTube URL", type: "url" }),
            defineField({ name: "thumbnail", type: "image" }),
          ],
          preview: { select: { title: "title", subtitle: "url", media: "thumbnail" } },
        }),
      ],
    }),
    defineField({ name: "order", title: "Sort order", type: "number" }),
  ],
  preview: { select: { title: "title", subtitle: "category", media: "images.0" } },
});

/* ───────────────────────── Media: posts ───────────────────────── */

export const postCategory = defineType({
  name: "postCategory",
  title: "Post category",
  type: "document",
  icon: TagsIcon,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
  ],
});

export const post = defineType({
  name: "post",
  title: "News / blog post",
  type: "document",
  icon: ComposeIcon,
  groups: contentGroups,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required(), group: "content" }),
    slugField(),
    defineField({
      name: "postType",
      title: "Type",
      type: "string",
      initialValue: "blog",
      group: "content",
      options: { list: [{ title: "News", value: "news" }, { title: "Blog article", value: "blog" }], layout: "radio", direction: "horizontal" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "publishedAt", type: "datetime", group: "content", initialValue: () => new Date().toISOString() }),
    defineField({ name: "categories", type: "array", group: "content", of: [defineArrayMember({ type: "reference", to: [{ type: "postCategory" }] })] }),
    defineField({ name: "excerpt", type: "text", rows: 3, group: "content" }),
    defineField({ name: "mainImage", type: "imageWithAlt", group: "content" }),
    defineField({ name: "body", type: "blockContent", group: "content" }),
    defineField({ name: "author", type: "string", group: "content" }),
    defineField({ name: "featured", title: "Featured post", type: "boolean", group: "settings" }),
    seoField,
  ],
  orderings: [{ title: "Newest", name: "newest", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", type: "postType", date: "publishedAt", media: "mainImage" },
    prepare: ({ title, type, date, media }) => ({
      title,
      subtitle: `${type === "news" ? "News" : "Blog"}${date ? " · " + new Date(date).toLocaleDateString() : ""}`,
      media,
    }),
  },
});

/* ───────────────────────── Supporting content ───────────────────────── */

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  icon: HelpCircleIcon,
  fields: [
    defineField({ name: "question", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", type: "blockContent", validation: (r) => r.required() }),
    defineField({
      name: "topic",
      type: "string",
      options: { list: ["Products", "Ordering", "Shipping and export", "Quality"] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Sort order", type: "number" }),
  ],
  orderings: [{ title: "Sort order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "question", subtitle: "topic" } },
});

export const certificate = defineType({
  name: "certificate",
  title: "Certificate / standard",
  type: "document",
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "issuer", title: "Issuing body", type: "string" }),
    defineField({ name: "description", type: "text", rows: 2 }),
    defineField({ name: "validity", type: "string", description: 'E.g. "Valid until March 2028"' }),
    defineField({ name: "logo", type: "image" }),
    defineField({ name: "file", title: "Certificate PDF", type: "file" }),
    defineField({ name: "order", title: "Sort order", type: "number" }),
  ],
  orderings: [{ title: "Sort order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "issuer", media: "logo" } },
});

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "photo", type: "imageWithAlt" }),
    defineField({ name: "bio", type: "text", rows: 3 }),
    defineField({ name: "linkedin", type: "url" }),
    defineField({ name: "order", title: "Sort order", type: "number" }),
  ],
  orderings: [{ title: "Sort order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "role", media: "photo" } },
});

export const job = defineType({
  name: "job",
  title: "Job opening",
  type: "document",
  icon: CaseIcon,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "department", type: "string" }),
    defineField({ name: "location", type: "string" }),
    defineField({ name: "experience", type: "string" }),
    defineField({ name: "employmentType", type: "string", options: { list: ["Full-time", "Part-time", "Contract", "Internship"] } }),
    defineField({ name: "description", type: "blockContent" }),
    defineField({ name: "isOpen", title: "Accepting applications", type: "boolean", initialValue: true }),
    defineField({ name: "postedAt", type: "date" }),
  ],
  preview: { select: { title: "title", subtitle: "location" } },
});

export const download = defineType({
  name: "download",
  title: "Download",
  type: "document",
  icon: DownloadIcon,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "group",
      type: "string",
      options: {
        list: [
          { title: "Company Brochure", value: "brochure" },
          { title: "Product Datasheets", value: "datasheet" },
          { title: "Certificates", value: "certificate" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "description", type: "string" }),
    defineField({ name: "file", type: "file", validation: (r) => r.required() }),
    defineField({ name: "order", title: "Sort order", type: "number" }),
  ],
  preview: { select: { title: "title", subtitle: "group" } },
});

export const client = defineType({
  name: "client",
  title: "Client",
  type: "document",
  icon: StarIcon,
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "logo", type: "image" }),
    defineField({ name: "website", type: "url" }),
    defineField({ name: "order", title: "Sort order", type: "number" }),
  ],
  preview: { select: { title: "name", media: "logo" } },
});

export const redirect = defineType({
  name: "redirect",
  title: "Redirect",
  type: "document",
  icon: ArrowRightIcon,
  description: "Send old URLs (e.g. from the previous website) to new pages. Applies after the next deploy.",
  fields: [
    defineField({ name: "source", title: "From path", type: "string", description: 'E.g. "/20 ft ISO Container.html"', validation: (r) => r.required() }),
    defineField({ name: "destination", title: "To path", type: "string", validation: (r) => r.required() }),
    defineField({ name: "permanent", type: "boolean", initialValue: true }),
  ],
  preview: { select: { title: "source", subtitle: "destination" } },
});

export const submission = defineType({
  name: "submission",
  title: "Form submission",
  type: "document",
  icon: InboxIcon,
  readOnly: ({ currentUser }) => !currentUser,
  fields: [
    defineField({
      name: "status",
      type: "string",
      initialValue: "new",
      options: { list: ["new", "contacted", "quoted", "won", "closed", "spam"], layout: "radio", direction: "horizontal" },
    }),
    defineField({ name: "formType", type: "string", readOnly: true }),
    defineField({ name: "name", type: "string", readOnly: true }),
    defineField({ name: "company", type: "string", readOnly: true }),
    defineField({ name: "email", type: "string", readOnly: true }),
    defineField({ name: "phone", type: "string", readOnly: true }),
    defineField({ name: "product", type: "string", readOnly: true }),
    defineField({ name: "quantity", type: "string", readOnly: true }),
    defineField({ name: "destination", type: "string", readOnly: true }),
    defineField({ name: "timeline", type: "string", readOnly: true }),
    defineField({ name: "customisation", type: "string", readOnly: true }),
    defineField({ name: "role", title: "Role applied for", type: "string", readOnly: true }),
    defineField({ name: "message", type: "text", readOnly: true }),
    defineField({ name: "attachment", type: "file", readOnly: true }),
    defineField({ name: "pageUrl", type: "string", readOnly: true }),
    defineField({ name: "submittedAt", type: "datetime", readOnly: true }),
    defineField({ name: "notes", title: "Internal notes", type: "text" }),
  ],
  orderings: [{ title: "Newest", name: "newest", by: [{ field: "submittedAt", direction: "desc" }] }],
  preview: {
    select: { name: "name", type: "formType", company: "company", date: "submittedAt", status: "status" },
    prepare: ({ name, type, company, date, status }) => ({
      title: `${name ?? "—"}${company ? ` · ${company}` : ""}`,
      subtitle: `${status === "new" ? "● NEW · " : ""}${type ?? ""}${date ? " · " + new Date(date).toLocaleString() : ""}`,
    }),
  },
});

export const documentTypes = [
  siteSettings,
  page,
  productCategory,
  product,
  industry,
  project,
  galleryAlbum,
  postCategory,
  post,
  faq,
  certificate,
  teamMember,
  job,
  download,
  client,
  redirect,
  submission,
];
