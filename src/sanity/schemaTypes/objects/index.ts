import { defineArrayMember, defineField, defineType } from "sanity";
import { LinkIcon } from "@sanity/icons/Link";
import { SearchIcon } from "@sanity/icons/Search";
import { ImageIcon } from "@sanity/icons/Image";
import { ICON_OPTIONS } from "../../../lib/icon-names";

/** Document types an internal link can point to. */
export const LINKABLE_TYPES = [
  { type: "page" },
  { type: "product" },
  { type: "productCategory" },
  { type: "industry" },
  { type: "project" },
  { type: "post" },
];

/** Image with required alt text and an optional caption. */
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "image",
  icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "Describe the image for screen readers and SEO.",
    }),
    defineField({ name: "caption", type: "string" }),
  ],
});

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  icon: SearchIcon,
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title",
      type: "string",
      description: "Keep under ~60 characters. Falls back to the page title.",
      validation: (r) => r.max(70).warning("Titles over 60–70 characters get cut off in Google."),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      description: "Keep under ~155 characters.",
      validation: (r) => r.max(170).warning("Descriptions over ~155 characters get cut off."),
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "image",
      description: "1200 × 630 px recommended. Falls back to the page image or the site default.",
    }),
    defineField({
      name: "keywords",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "canonicalUrl",
      title: "Canonical URL",
      type: "url",
      description: "Only set this if the content lives at another URL.",
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      initialValue: false,
    }),
  ],
});

export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({ name: "label", type: "string" }),
    defineField({
      name: "internal",
      title: "Internal page",
      type: "reference",
      to: LINKABLE_TYPES,
      description: "Pick a page on this site…",
    }),
    defineField({
      name: "url",
      title: "…or URL / path",
      type: "string",
      description: 'E.g. "/get-a-quote", "/contact#form", "https://…", "tel:+91…", "mailto:…"',
    }),
    defineField({ name: "newTab", title: "Open in new tab", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "label", url: "url", ref: "internal.title" },
    prepare: ({ title, url, ref }) => ({ title: title || ref || url, subtitle: ref || url }),
  },
});

export const button = defineType({
  name: "button",
  title: "Button",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "internal", title: "Internal page", type: "reference", to: LINKABLE_TYPES }),
    defineField({
      name: "url",
      title: "…or URL / path",
      type: "string",
      description: 'E.g. "/get-a-quote", "https://…". Use "#brochure" to download the company brochure, "#callback" to open the callback form.',
    }),
    defineField({
      name: "style",
      type: "string",
      initialValue: "primary",
      options: {
        list: [
          { title: "Primary (orange)", value: "primary" },
          { title: "Secondary (dark)", value: "secondary" },
          { title: "Outline", value: "outline" },
          { title: "Outline light (on dark backgrounds)", value: "outlineLight" },
          { title: "WhatsApp", value: "whatsapp" },
        ],
      },
    }),
    defineField({ name: "newTab", title: "Open in new tab", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "label", subtitle: "style" },
  },
});

export const navItem = defineType({
  name: "navItem",
  title: "Menu item",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "internal", title: "Internal page", type: "reference", to: LINKABLE_TYPES }),
    defineField({ name: "url", title: "…or URL / path", type: "string" }),
    defineField({
      name: "children",
      title: "Dropdown links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "navChild",
          fields: [
            defineField({ name: "label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "description", type: "string" }),
            defineField({ name: "internal", title: "Internal page", type: "reference", to: LINKABLE_TYPES }),
            defineField({ name: "url", title: "…or URL / path", type: "string" }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "label", children: "children" },
    prepare: ({ title, children }) => ({
      title,
      subtitle: children?.length ? `${children.length} dropdown links` : undefined,
    }),
  },
});

export const keyValue = defineType({
  name: "keyValue",
  title: "Label / value",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "value", type: "string", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "label", subtitle: "value" } },
});

export const iconItem = defineType({
  name: "iconItem",
  title: "Item",
  type: "object",
  fields: [
    defineField({ name: "icon", type: "string", options: { list: ICON_OPTIONS } }),
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", type: "text", rows: 3 }),
    defineField({ name: "image", type: "imageWithAlt" }),
  ],
  preview: { select: { title: "title", subtitle: "text", media: "image" } },
});

export const address = defineType({
  name: "address",
  title: "Address",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", description: 'E.g. "Plant", "Registered Office"' }),
    defineField({ name: "address", type: "text", rows: 3 }),
    defineField({
      name: "mapEmbedUrl",
      title: "Google Maps embed URL",
      type: "url",
      description: 'Google Maps → Share → Embed a map → copy only the "src" URL.',
    }),
    defineField({ name: "directionsUrl", title: "Get directions URL", type: "url" }),
  ],
  preview: { select: { title: "label", subtitle: "address" } },
});

export const blockContent = defineType({
  name: "blockContent",
  title: "Rich text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Heading 4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Underline", value: "underline" },
        ],
        annotations: [
          defineArrayMember({
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              defineField({ name: "href", type: "string", title: "URL or path" }),
              defineField({ name: "newTab", type: "boolean", title: "Open in new tab" }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({ type: "imageWithAlt" }),
  ],
});

export const objectTypes = [imageWithAlt, seo, link, button, navItem, keyValue, iconItem, address, blockContent];
