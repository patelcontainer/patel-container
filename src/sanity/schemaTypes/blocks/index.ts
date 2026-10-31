import { defineArrayMember, defineField, defineType, type FieldDefinition } from "sanity";
import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { BulbOutlineIcon } from "@sanity/icons/BulbOutline";
import { CheckmarkCircleIcon } from "@sanity/icons/CheckmarkCircle";
import { CommentIcon } from "@sanity/icons/Comment";
import { DocumentPdfIcon } from "@sanity/icons/DocumentPdf";
import { DocumentsIcon } from "@sanity/icons/Documents";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import { ImagesIcon } from "@sanity/icons/Images";
import { InlineIcon } from "@sanity/icons/Inline";
import { LaunchIcon } from "@sanity/icons/Launch";
import { ListIcon } from "@sanity/icons/List";
import { NumberIcon } from "@sanity/icons/Number";
import { PackageIcon } from "@sanity/icons/Package";
import { ProjectsIcon } from "@sanity/icons/Projects";
import { RocketIcon } from "@sanity/icons/Rocket";
import { SplitHorizontalIcon } from "@sanity/icons/SplitHorizontal";
import { StarIcon } from "@sanity/icons/Star";
import { ThListIcon } from "@sanity/icons/ThList";
import { TimelineIcon } from "@sanity/icons/Timeline";
import { UsersIcon } from "@sanity/icons/Users";
import { CaseIcon } from "@sanity/icons/Case";
import { PinIcon } from "@sanity/icons/Pin";
import { ComposeIcon } from "@sanity/icons/Compose";
import { HEADING_TAGS } from "../../../lib/headings";

/** HTML tag for a heading (SEO outline only; the look never changes). */
function tagField(name: string, title: string, initialValue: string, description?: string) {
  return defineField({
    name,
    title,
    type: "string",
    group: "settings",
    initialValue,
    options: { list: [...HEADING_TAGS] },
    description: `${description ? `${description} ` : ""}Changes the HTML tag for SEO only; the heading looks the same. Empty means ${initialValue.toUpperCase()}.`,
  });
}
const headingTagField = tagField("headingTag", "Heading tag", "h2");
const itemHeadingTagField = (what: string) => tagField("itemHeadingTag", `${what} tag`, "h3");

/** Fields shared by every section: anchor, background, heading. */
function sectionFields(opts: { heading?: boolean } = {}): FieldDefinition[] {
  const fields: FieldDefinition[] = [];
  if (opts.heading !== false) {
    fields.push(
      defineField({ name: "eyebrow", title: "Small label above heading", type: "string", group: "content" }),
      defineField({ name: "heading", type: "string", group: "content" }),
      defineField({ name: "intro", type: "text", rows: 3, group: "content" }),
      headingTagField,
    );
  }
  fields.push(
    defineField({
      name: "background",
      type: "string",
      group: "settings",
      initialValue: "white",
      options: {
        list: [
          { title: "White", value: "white" },
          { title: "Light grey", value: "light" },
          { title: "Dark navy", value: "dark" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "sectionId",
      title: "Anchor ID",
      type: "string",
      group: "settings",
      description: 'Optional. Lets you link to this section, e.g. "form" → /contact#form',
    }),
  );
  return fields;
}

const groups = [
  { name: "content", title: "Content", default: true },
  { name: "settings", title: "Settings" },
];

const preview = (fallback: string) => ({
  select: { title: "heading", eyebrow: "eyebrow" },
  prepare: ({ title, eyebrow }: { title?: string; eyebrow?: string }) => ({
    title: title || eyebrow || fallback,
    subtitle: fallback,
  }),
});

const buttonsField = defineField({
  name: "buttons",
  type: "array",
  group: "content",
  of: [defineArrayMember({ type: "button" })],
});

export const heroBlock = defineType({
  name: "heroBlock",
  title: "Hero",
  type: "object",
  icon: RocketIcon,
  groups,
  fields: [
    defineField({ name: "eyebrow", type: "string", group: "content" }),
    defineField({ name: "heading", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({ name: "subheading", type: "text", rows: 3, group: "content" }),
    buttonsField,
    defineField({
      name: "images",
      title: "Background images",
      description: "Add more than one to make a slow crossfading slideshow.",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "imageWithAlt" })],
    }),
    defineField({
      name: "videoUrl",
      title: "Background video (MP4 URL)",
      type: "url",
      group: "content",
      description: "Optional. Plays muted on loop over the images.",
    }),
    defineField({
      name: "highlights",
      title: "Highlight strip",
      description: "3–4 short proof points shown along the bottom of the hero.",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "iconItem" })],
    }),
  ],
  preview: { select: { title: "heading", media: "images.0" }, prepare: ({ title, media }) => ({ title, subtitle: "Hero", media }) },
});

export const splitContentBlock = defineType({
  name: "splitContentBlock",
  title: "Text + image",
  type: "object",
  icon: SplitHorizontalIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({ name: "body", type: "blockContent", group: "content" }),
    defineField({
      name: "bullets",
      title: "Check-list points",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
    }),
    defineField({ name: "image", type: "imageWithAlt", group: "content" }),
    defineField({ name: "secondaryImage", title: "Small overlapping image", type: "imageWithAlt", group: "content" }),
    defineField({
      name: "videoUrl",
      title: "Video URL (YouTube or MP4)",
      type: "url",
      group: "content",
      description: "Shows a play button over the image.",
    }),
    defineField({
      name: "badge",
      title: "Image badge",
      description: 'Small stat on the image, e.g. value "30+" / label "Engineering projects"',
      type: "keyValue",
      group: "content",
    }),
    buttonsField,
    defineField({
      name: "imagePosition",
      type: "string",
      group: "settings",
      initialValue: "right",
      options: { list: ["left", "right"], layout: "radio", direction: "horizontal" },
    }),
  ],
  preview: {
    select: { title: "heading", media: "image" },
    prepare: ({ title, media }) => ({ title, subtitle: "Text + image", media }),
  },
});

export const featureGridBlock = defineType({
  name: "featureGridBlock",
  title: "Feature / icon grid",
  type: "object",
  icon: ThListIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "items",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "iconItem" })],
    }),
    defineField({
      name: "columns",
      type: "number",
      group: "settings",
      initialValue: 3,
      options: { list: [2, 3, 4], layout: "radio", direction: "horizontal" },
    }),
    defineField({
      name: "variant",
      type: "string",
      group: "settings",
      initialValue: "cards",
      options: {
        list: [
          { title: "Cards with icons", value: "cards" },
          { title: "Numbered", value: "numbered" },
          { title: "Image cards", value: "images" },
          { title: "Compact list", value: "list" },
        ],
      },
    }),
    buttonsField,
    itemHeadingTagField("Item title"),
  ],
  preview: preview("Feature grid"),
});

export const statsBlock = defineType({
  name: "statsBlock",
  title: "Stats counters",
  type: "object",
  icon: NumberIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "stats",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "stat",
          fields: [
            defineField({ name: "value", type: "number", validation: (r) => r.required() }),
            defineField({ name: "prefix", type: "string" }),
            defineField({ name: "suffix", type: "string", description: 'E.g. "+", "%", "K"' }),
            defineField({ name: "label", type: "string", validation: (r) => r.required() }),
          ],
          preview: {
            select: { v: "value", s: "suffix", label: "label" },
            prepare: ({ v, s, label }) => ({ title: `${v ?? ""}${s ?? ""}`, subtitle: label }),
          },
        }),
      ],
    }),
  ],
  preview: preview("Stats"),
});

export const productCategoriesBlock = defineType({
  name: "productCategoriesBlock",
  title: "Product category tiles",
  type: "object",
  icon: PackageIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "categories",
      type: "array",
      group: "content",
      description: "Leave empty to show all categories in their set order.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "productCategory" }] })],
    }),
    buttonsField,
    itemHeadingTagField("Category title"),
  ],
  preview: preview("Product categories"),
});

export const productsBlock = defineType({
  name: "productsBlock",
  title: "Products grid",
  type: "object",
  icon: PackageIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "products",
      type: "array",
      group: "content",
      description: "Leave empty to show all products.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
    }),
    buttonsField,
    itemHeadingTagField("Product title"),
  ],
  preview: preview("Products"),
});

export const comparisonTableBlock = defineType({
  name: "comparisonTableBlock",
  title: "Comparison / data table",
  type: "object",
  icon: ThListIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "columns",
      title: "Column headings",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "rows",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "row",
          fields: [
            defineField({ name: "cells", type: "array", of: [{ type: "string" }] }),
            defineField({
              name: "product",
              title: "Link row to product",
              type: "reference",
              to: [{ type: "product" }],
            }),
          ],
          preview: {
            select: { cells: "cells" },
            prepare: ({ cells }) => ({ title: (cells || []).join(" · ") }),
          },
        }),
      ],
    }),
    defineField({ name: "note", type: "string", group: "content" }),
    buttonsField,
  ],
  preview: preview("Table"),
});

export const certificationsBlock = defineType({
  name: "certificationsBlock",
  title: "Certifications",
  type: "object",
  icon: CheckmarkCircleIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "layout",
      type: "string",
      group: "settings",
      initialValue: "strip",
      options: {
        list: [
          { title: "Logo strip", value: "strip" },
          { title: "Cards with downloads", value: "cards" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "certificates",
      type: "array",
      group: "content",
      description: "Leave empty to show all.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "certificate" }] })],
    }),
    buttonsField,
    itemHeadingTagField("Certificate title (cards layout)"),
  ],
  preview: preview("Certifications"),
});

export const clientsBlock = defineType({
  name: "clientsBlock",
  title: "Clients & projects",
  type: "object",
  icon: StarIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "clients",
      type: "array",
      group: "content",
      description: "Leave empty to show all client logos.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "client" }] })],
    }),
    defineField({
      name: "projects",
      title: "Featured projects",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "reference", to: [{ type: "project" }] })],
    }),
    buttonsField,
    itemHeadingTagField("Project title"),
  ],
  preview: preview("Clients & projects"),
});

export const projectsBlock = defineType({
  name: "projectsBlock",
  title: "Projects list (with filters)",
  type: "object",
  icon: ProjectsIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "projects",
      type: "array",
      group: "content",
      description: "Pick specific projects, or leave empty to list all projects.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "project" }] })],
    }),
    defineField({ name: "showFilters", type: "boolean", initialValue: true, group: "settings" }),
    buttonsField,
    itemHeadingTagField("Project title"),
  ],
  preview: preview("Projects list"),
});

export const newsletterBlock = defineType({
  name: "newsletterBlock",
  title: "Newsletter signup",
  type: "object",
  icon: EnvelopeIcon,
  groups,
  fields: [...sectionFields()],
  preview: preview("Newsletter signup"),
});

export const postsBlock = defineType({
  name: "postsBlock",
  title: "News / blog posts",
  type: "object",
  icon: ComposeIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "postType",
      type: "string",
      group: "content",
      initialValue: "all",
      options: {
        list: [
          { title: "News and blog", value: "all" },
          { title: "News only", value: "news" },
          { title: "Blog only", value: "blog" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "mode",
      type: "string",
      group: "settings",
      initialValue: "latest",
      options: {
        list: [
          { title: "Latest 3 (teaser)", value: "latest" },
          { title: "Full listing with categories", value: "full" },
        ],
        layout: "radio",
      },
    }),
    buttonsField,
    itemHeadingTagField("Post title"),
    tagField("featuredHeadingTag", "Featured post title tag", "h3", "Full listing only: tag for the large featured post at the top."),
  ],
  preview: preview("Posts"),
});

export const faqBlock = defineType({
  name: "faqBlock",
  title: "FAQ",
  type: "object",
  icon: HelpCircleIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "faqs",
      type: "array",
      group: "content",
      description: "Pick questions. Leave empty to show all questions grouped by topic.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "faq" }] })],
    }),
    buttonsField,
  ],
  preview: preview("FAQ"),
});

export const formBlock = defineType({
  name: "formBlock",
  title: "Form",
  type: "object",
  icon: EnvelopeIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "formType",
      type: "string",
      group: "content",
      initialValue: "enquiry",
      options: {
        list: [
          { title: "Enquiry (short)", value: "enquiry" },
          { title: "Contact (with timeline)", value: "contact" },
          { title: "Detailed quote request", value: "quote" },
          { title: "Job application", value: "career" },
        ],
      },
    }),
    defineField({ name: "submitLabel", title: "Button label", type: "string", group: "content" }),
    defineField({
      name: "points",
      title: "Side points",
      description: "Short reassurance points shown next to the form.",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "iconItem" })],
    }),
    defineField({
      name: "showContactDetails",
      title: "Show phone / email / WhatsApp next to the form",
      type: "boolean",
      initialValue: true,
      group: "settings",
    }),
  ],
  preview: preview("Form"),
});

export const ctaBlock = defineType({
  name: "ctaBlock",
  title: "Call to action banner",
  type: "object",
  icon: LaunchIcon,
  groups,
  fields: [
    defineField({ name: "eyebrow", type: "string", group: "content" }),
    defineField({ name: "heading", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({ name: "text", type: "text", rows: 2, group: "content" }),
    buttonsField,
    defineField({ name: "image", title: "Background image", type: "imageWithAlt", group: "content" }),
    headingTagField,
    defineField({ name: "sectionId", title: "Anchor ID", type: "string", group: "settings" }),
  ],
  preview: preview("CTA"),
});

export const timelineBlock = defineType({
  name: "timelineBlock",
  title: "Timeline / milestones",
  type: "object",
  icon: TimelineIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "items",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "milestone",
          fields: [
            defineField({ name: "year", type: "string", validation: (r) => r.required() }),
            defineField({ name: "title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", type: "text", rows: 3 }),
            defineField({ name: "image", type: "imageWithAlt" }),
          ],
          preview: { select: { title: "title", subtitle: "year", media: "image" } },
        }),
      ],
    }),
    itemHeadingTagField("Milestone title"),
  ],
  preview: preview("Timeline"),
});

export const teamBlock = defineType({
  name: "teamBlock",
  title: "Team",
  type: "object",
  icon: UsersIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "members",
      type: "array",
      group: "content",
      description: "Leave empty to show everyone in their set order.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "teamMember" }] })],
    }),
    itemHeadingTagField("Member name"),
  ],
  preview: preview("Team"),
});

export const messageBlock = defineType({
  name: "messageBlock",
  title: "Founder / leader message",
  type: "object",
  icon: CommentIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({ name: "message", type: "blockContent", group: "content" }),
    defineField({ name: "name", type: "string", group: "content" }),
    defineField({ name: "role", type: "string", group: "content" }),
    defineField({ name: "photo", type: "imageWithAlt", group: "content" }),
    defineField({ name: "signature", title: "Signature image", type: "image", group: "content" }),
  ],
  preview: preview("Message"),
});

export const processBlock = defineType({
  name: "processBlock",
  title: "Process steps",
  type: "object",
  icon: ListIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "steps",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "step",
          fields: [
            defineField({ name: "title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", type: "text", rows: 3 }),
            defineField({ name: "qualityCheck", title: "Quality check at this step", type: "string" }),
            defineField({ name: "image", type: "imageWithAlt" }),
          ],
          preview: { select: { title: "title", subtitle: "qualityCheck", media: "image" } },
        }),
      ],
    }),
    defineField({ name: "note", type: "string", group: "content" }),
    itemHeadingTagField("Step title"),
  ],
  preview: preview("Process"),
});

export const galleryBlock = defineType({
  name: "galleryBlock",
  title: "Gallery",
  type: "object",
  icon: ImagesIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "source",
      type: "string",
      group: "content",
      initialValue: "inline",
      options: {
        list: [
          { title: "Images added below", value: "inline" },
          { title: "All gallery albums (photo/video tabs + category filter)", value: "albums" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "images",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      options: { layout: "grid" },
      hidden: ({ parent }) => parent?.source === "albums",
    }),
  ],
  preview: preview("Gallery"),
});

export const richTextBlock = defineType({
  name: "richTextBlock",
  title: "Rich text",
  type: "object",
  icon: BlockContentIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({ name: "content", type: "blockContent", group: "content" }),
    defineField({
      name: "showToc",
      title: "Show table of contents",
      type: "boolean",
      initialValue: false,
      group: "settings",
      description: "Builds a sidebar menu from the H2 headings. Good for legal pages.",
    }),
  ],
  preview: preview("Rich text"),
});

export const downloadsBlock = defineType({
  name: "downloadsBlock",
  title: "Downloads",
  type: "object",
  icon: DocumentPdfIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "groups",
      title: "Only show these groups",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Company Brochure", value: "brochure" },
          { title: "Product Datasheets", value: "datasheet" },
          { title: "Certificates", value: "certificate" },
          { title: "Other", value: "other" },
        ],
      },
    }),
  ],
  preview: preview("Downloads"),
});

export const jobsBlock = defineType({
  name: "jobsBlock",
  title: "Open positions",
  type: "object",
  icon: CaseIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({ name: "emptyText", title: "Text when there are no openings", type: "string", group: "content" }),
  ],
  preview: preview("Open positions"),
});

export const industriesBlock = defineType({
  name: "industriesBlock",
  title: "Industries grid",
  type: "object",
  icon: BulbOutlineIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "industries",
      type: "array",
      group: "content",
      description: "Leave empty to show all.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "industry" }] })],
    }),
    itemHeadingTagField("Industry title"),
  ],
  preview: preview("Industries"),
});

export const contactInfoBlock = defineType({
  name: "contactInfoBlock",
  title: "Contact details + map",
  type: "object",
  icon: PinIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "exportNote",
      title: "Export enquiry note",
      type: "text",
      rows: 3,
      group: "content",
    }),
    defineField({ name: "showMap", type: "boolean", initialValue: true, group: "settings" }),
    itemHeadingTagField("Card title"),
  ],
  preview: preview("Contact details"),
});

export const linkCardsBlock = defineType({
  name: "linkCardsBlock",
  title: "Link cards",
  type: "object",
  icon: DocumentsIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({
      name: "cards",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "linkCard",
          fields: [
            defineField({ name: "title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", type: "text", rows: 2 }),
            defineField({ name: "image", type: "imageWithAlt" }),
            defineField({ name: "link", type: "link" }),
          ],
          preview: { select: { title: "title", subtitle: "text", media: "image" } },
        }),
      ],
    }),
    itemHeadingTagField("Card title"),
  ],
  preview: preview("Link cards"),
});

export const badgesBlock = defineType({
  name: "badgesBlock",
  title: "Trust badges",
  type: "object",
  icon: InlineIcon,
  groups,
  fields: [
    ...sectionFields(),
    defineField({ name: "items", type: "array", group: "content", of: [defineArrayMember({ type: "iconItem" })] }),
  ],
  preview: preview("Trust badges"),
});

export const blockTypes = [
  heroBlock,
  splitContentBlock,
  featureGridBlock,
  statsBlock,
  productCategoriesBlock,
  productsBlock,
  comparisonTableBlock,
  certificationsBlock,
  clientsBlock,
  projectsBlock,
  postsBlock,
  faqBlock,
  formBlock,
  ctaBlock,
  timelineBlock,
  teamBlock,
  messageBlock,
  processBlock,
  galleryBlock,
  richTextBlock,
  downloadsBlock,
  jobsBlock,
  industriesBlock,
  contactInfoBlock,
  linkCardsBlock,
  badgesBlock,
  newsletterBlock,
];

/** The list of sections an editor can add to a page. */
export const pageBuilderMembers = blockTypes.map((b) => defineArrayMember({ type: b.name }));
