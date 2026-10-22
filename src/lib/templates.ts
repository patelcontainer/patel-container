/**
 * Text used by the fixed page templates (product, category, industry, case study, article, 404, forms).
 * Editable in Studio → Site settings → Page templates. Defaults here apply until an editor overrides them.
 * "{title}" is replaced with the product / industry name; "{time}" with the response-time promise.
 */
export const TEMPLATE_FIELDS = [
  // General
  { name: "quoteLabel", title: "“Get a Quote” button label", fieldset: "general", default: "Get a Quote" },
  { name: "whatsappLabel", title: "WhatsApp button label", fieldset: "general", default: "Chat on WhatsApp" },
  { name: "callbackLabel", title: "Callback button label", fieldset: "general", default: "Request a callback" },
  { name: "callbackHeading", title: "Callback popup heading", fieldset: "general", default: "We'll call you back" },
  { name: "callbackText", title: "Callback popup text", fieldset: "general", default: "Leave your number and our sales team will call you within {time}.", rows: 2 },
  { name: "formSuccessTitle", title: "Form success heading", fieldset: "general", default: "Thank you. Your message has been sent." },
  { name: "formSuccessText", title: "Form success text", fieldset: "general", default: "Our team will get back to you within {time}." },
  { name: "formPrivacyNote", title: "Note under form button", fieldset: "general", default: "We respect your privacy. Read our privacy policy." },
  { name: "notFoundHeading", title: "404 heading", fieldset: "general", default: "Page not found" },
  { name: "notFoundText", title: "404 text", fieldset: "general", default: "The page you are looking for has moved or does not exist." },

  // Product page
  { name: "productOverviewHeading", title: "Overview heading", fieldset: "product", default: "About the {title}" },
  { name: "productSidebarHeading", title: "Sidebar heading", fieldset: "product", default: "Need a custom specification?" },
  { name: "productSidebarText", title: "Sidebar text", fieldset: "product", default: "Our engineers can adapt dimensions, doors, fittings, insulation and paint to your requirement.", rows: 2 },
  { name: "productSidebarPoints", title: "Sidebar points (one per line)", fieldset: "product", default: "In-house design and engineering\nBuilt and leak-tested in Bhavnagar\nBulk and export orders", rows: 3 },
  { name: "productSidebarButton", title: "Sidebar button", fieldset: "product", default: "Discuss your requirement" },
  { name: "productSpecsHeading", title: "Specification heading", fieldset: "product", default: "Full specifications" },
  { name: "productSpecsNote", title: "Specification note", fieldset: "product", default: "Specifications are nominal and may vary with custom builds. Final values are confirmed in the quotation." },
  { name: "productFeaturesHeading", title: "Features heading", fieldset: "product", default: "Features and materials" },
  { name: "productApplicationsHeading", title: "Applications heading", fieldset: "product", default: "Applications and industries" },
  { name: "productGalleryHeading", title: "Gallery heading", fieldset: "product", default: "Photos and drawings" },
  { name: "productDatasheetHeading", title: "Datasheet heading", fieldset: "product", default: "{title} datasheet" },
  { name: "productDatasheetText", title: "Datasheet text", fieldset: "product", default: "Dimensions, weights and construction details in one PDF, ready to share with your team.", rows: 2 },
  { name: "productRelatedHeading", title: "Related products heading", fieldset: "product", default: "Related products" },
  { name: "productFaqHeading", title: "FAQ heading", fieldset: "product", default: "Questions about the {title}" },
  { name: "productQuoteHeading", title: "Quote form heading", fieldset: "product", default: "Get a price for the {title}" },
  { name: "productQuoteText", title: "Quote form text", fieldset: "product", default: "Tell us the quantity, destination and any customisation. We'll reply with a detailed quote within {time}.", rows: 2 },

  // Category page
  { name: "categoryRangeHeading", title: "Products heading", fieldset: "category", default: "{title}: available models" },
  { name: "categoryCtaHeading", title: "CTA heading", fieldset: "category", default: "Need a size or spec that isn't listed?" },
  { name: "categoryCtaText", title: "CTA text", fieldset: "category", default: "Share your drawings or requirements and our engineering team will propose a solution.", rows: 2 },
  { name: "categoryOthersHeading", title: "Other categories heading", fieldset: "category", default: "Other product categories" },

  // Industry page
  { name: "industryChallengeHeading", title: "Challenge heading", fieldset: "industry", default: "The challenge" },
  { name: "industrySolutionHeading", title: "Solution heading", fieldset: "industry", default: "Our solution" },
  { name: "industryProductsHeading", title: "Recommended products heading", fieldset: "industry", default: "Recommended products for {title}" },
  { name: "industryQuoteHeading", title: "Quote form heading", fieldset: "industry", default: "Discuss your {title} requirement" },
  { name: "industryQuoteText", title: "Quote form text", fieldset: "industry", default: "Share your application and quantities. We'll recommend the right product and send a quote.", rows: 2 },
  { name: "industryOthersHeading", title: "Other industries heading", fieldset: "industry", default: "Other industries we serve" },

  // Case study + articles
  { name: "projectCtaHeading", title: "Case study CTA heading", fieldset: "content", default: "Let's engineer your next project together" },
  { name: "postCtaHeading", title: "Article CTA heading", fieldset: "content", default: "Looking for containers built to your specification?" },
] as const;

export type TemplateKey = (typeof TEMPLATE_FIELDS)[number]["name"];
export type Templates = Record<TemplateKey, string>;

export const TEMPLATE_FIELDSETS = [
  { name: "general", title: "General: buttons, popup, forms, 404" },
  { name: "product", title: "Product page" },
  { name: "category", title: "Product category page" },
  { name: "industry", title: "Industry page" },
  { name: "content", title: "Case studies and articles" },
];

/** Merge CMS overrides over defaults. */
export function resolveTemplates(cms?: Partial<Record<string, string>> | null, responseTime?: string): Templates {
  const out = {} as Templates;
  for (const f of TEMPLATE_FIELDS) {
    const v = cms?.[f.name]?.trim();
    out[f.name] = (v || f.default).replaceAll("{time}", responseTime || "one working day");
  }
  return out;
}

export const fill = (text: string, title: string) => text.replaceAll("{title}", title);
