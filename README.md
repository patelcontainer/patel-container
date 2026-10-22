# Patel Container India — Website

Next.js 16 (App Router) + Sanity 6 (embedded Studio) + Tailwind CSS 4.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

- Website: http://localhost:3000
- CMS (Sanity Studio): http://localhost:3000/studio

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project (`8nmek9s0`) |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for canonical URLs, sitemap and Open Graph |
| `SANITY_API_WRITE_TOKEN` | Server-only token with write access. Saves form submissions and runs the seed |
| `SANITY_REVALIDATE_SECRET` | Shared secret for the Sanity webhook → `/api/revalidate` |

## Content model (all editable in /studio)

- **Site settings**: logo, phones, email, WhatsApp, addresses and map, hours, menu, header button, footer, default SEO, GA4/GTM, Search Console code.
- **Pages**: every page is built from reorderable **sections** (hero, text + image, feature grid, stats, product tiles, comparison table, certifications, clients, projects, posts, FAQ, forms, CTA, timeline, team, founder message, process steps, gallery, rich text, downloads, jobs, industries, contact + map, link cards, trust badges). Nested URLs use the slug, e.g. `about-us/careers`.
- **Products** and **product categories**: key specs plate, full spec tables, features, materials, applications, gallery, drawings, datasheet PDF, related products, FAQs.
- **Industries**, **Projects / case studies**, **Gallery albums**, **News / blog posts**, **FAQs**, **Certificates**, **Team**, **Jobs**, **Downloads**, **Clients**, **Redirects**.
- **Leads & enquiries**: every form (enquiry, contact, quote with drawing upload, career with CV, callback, newsletter) is saved as a submission. Submissions use private document IDs (`submission.*`), so they cannot be read through the public API.

Every page and document has an **SEO** tab (meta title, description, social image, keywords, canonical, noindex). The site also generates `sitemap.xml` and `robots.txt`, plus JSON-LD for Organization, Product, Breadcrumb, FAQ and Article.

## Seeding starter content

```bash
node --env-file=.env.local scripts/seed.mjs
```

This replaces the seeded documents (fixed IDs) with the starter content. It never touches form submissions. Images are read from `scripts/seed-assets/` (not committed).

## Editing guide (for the content team)

| I want to change… | Where in /studio |
| --- | --- |
| Logo, phone numbers, email, WhatsApp, addresses, map, hours | Site settings → Brand / Contact |
| Main menu, dropdowns, header button, top bar message | Site settings → Header & menu |
| Footer links, newsletter text, copyright | Site settings → Footer |
| Default SEO, Google Search Console code | Site settings → SEO defaults |
| Wording on product / category / industry / case study / article pages, 404, popup, form messages | Site settings → Page templates |
| GA4 / Tag Manager | Site settings → Integrations |
| Any page's sections (add, remove, reorder, edit) | Pages → pick the page → Sections |
| Products, specs, datasheets, galleries | Products |
| News and blog posts | Media → News / Blog |
| Certificates (with PDFs), team, jobs, FAQs | Company |
| Enquiries and quote requests | Leads & enquiries (change status as you follow up) |
| Old URL → new URL | Redirects (applies on next deploy) |

Every page and product has an **SEO** tab. After publishing, the live site updates within a few seconds (the site reads Sanity on every visit, so the webhook is optional).

## Go-live checklist

1. Rotate the Sanity token: sanity.io/manage → API → Tokens → create an **Editor** token, put it in `SANITY_API_WRITE_TOKEN`, delete the old one.
2. Set `NEXT_PUBLIC_SITE_URL` to the real domain (e.g. `https://www.patelcontainerindia.com`). Canonical URLs, sitemap and social previews depend on it.
3. Set a long random `SANITY_REVALIDATE_SECRET` and create the webhook (below).
4. Add the production domain to Sanity **CORS origins** (allow credentials) so /studio works on the live domain.
5. Point DNS to Vercel; submit `https://<domain>/sitemap.xml` in Google Search Console.
6. Replace placeholder content: brochure PDF, certificates, leadership, timeline years, business hours, social links, plant photos.
7. Delete test leads marked "spam" in Leads & enquiries.

## Deploying (Vercel)

1. Import the repo into Vercel and add the environment variables above.
2. In sanity.io/manage → API:
   - **CORS origins**: add the production domain with credentials allowed.
   - **Webhooks**: URL `https://<domain>/api/revalidate`, triggers on create/update/delete, projection `{_type}`, secret `SANITY_REVALIDATE_SECRET`.
3. Redirects added in the Studio take effect on the next deploy.
