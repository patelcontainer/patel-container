import { defineQuery } from "next-sanity";

/* ── Fragments ─────────────────────────────────────────────────────────── */

const internalRef = `internal->{_type, title, "slug": slug.current, postType}`;
const link = `..., ${internalRef}`;
const seo = `seo{..., "ogImageUrl": ogImage.asset->url}`;

const categoryCard = `_id, title, "slug": slug.current, icon, shortDescription, image, "productCount": count(*[_type == "product" && references(^._id)])`;
const productCard = `_id, title, "slug": slug.current, shortDescription, mainImage, keySpecs, "category": category->title`;
const projectCard = `_id, title, "slug": slug.current, client, productLabel, quantity, year, location, filter, summary, mainImage, isCaseStudy, "industry": industry->title`;
const postCard = `_id, title, "slug": slug.current, postType, publishedAt, excerpt, mainImage, featured, "categories": categories[]->{title, "slug": slug.current}`;
const industryCard = `_id, title, "slug": slug.current, icon, shortDescription, image`;
const faqItem = `_id, question, answer, topic`;

const pageBuilder = `pageBuilder[]{
  ...,
  buttons[]{${link}},
  _type == "productCategoriesBlock" => {
    "categories": select(count(categories) > 0 => categories[]->{${categoryCard}}, *[_type == "productCategory"] | order(order asc){${categoryCard}})
  },
  _type == "productsBlock" => {
    "products": select(count(products) > 0 => products[]->{${productCard}}, *[_type == "product"] | order(order asc){${productCard}})
  },
  _type == "comparisonTableBlock" => { rows[]{..., "href": "/products/" + product->slug.current} },
  _type == "certificationsBlock" => {
    "certificates": select(count(certificates) > 0 => certificates[]->{..., "fileUrl": file.asset->url}, *[_type == "certificate"] | order(order asc){..., "fileUrl": file.asset->url})
  },
  _type == "clientsBlock" => {
    "clients": select(count(clients) > 0 => clients[]->, *[_type == "client"] | order(order asc)),
    "projects": projects[]->{${projectCard}}
  },
  _type == "projectsBlock" => {
    "projects": select(count(projects) > 0 => projects[]->{${projectCard}}, *[_type == "project"] | order(order asc, year desc){${projectCard}})
  },
  _type == "postsBlock" => {
    "posts": *[_type == "post" && (^.postType == "all" || !defined(^.postType) || postType == ^.postType)] | order(publishedAt desc)[0...60]{${postCard}},
    "categories": *[_type == "postCategory"] | order(title asc){title, "slug": slug.current}
  },
  _type == "faqBlock" => {
    "faqs": select(count(faqs) > 0 => faqs[]->{${faqItem}}, *[_type == "faq"] | order(order asc){${faqItem}}),
    "grouped": !defined(faqs) || count(faqs) == 0
  },
  _type == "teamBlock" => {
    "members": select(count(members) > 0 => members[]->, *[_type == "teamMember"] | order(order asc))
  },
  _type == "galleryBlock" => {
    "albums": select(source == "albums" => *[_type == "galleryAlbum"] | order(order asc))
  },
  _type == "downloadsBlock" => {
    "downloads": *[_type == "download" && (!defined(^.groups) || count(^.groups) == 0 || group in ^.groups)] | order(order asc){
      _id, title, group, description, "fileUrl": file.asset->url, "size": file.asset->size, "ext": file.asset->extension
    }
  },
  _type == "jobsBlock" => { "jobs": *[_type == "job" && isOpen != false] | order(postedAt desc) },
  _type == "industriesBlock" => {
    "industries": select(count(industries) > 0 => industries[]->{${industryCard}}, *[_type == "industry"] | order(order asc){${industryCard}})
  },
  _type == "linkCardsBlock" => { cards[]{..., link{${link}}} },
  _type == "formBlock" => {
    "productOptions": *[_type == "product"] | order(order asc).title,
    "jobOptions": *[_type == "job" && isOpen != false].title
  }
}`;

/* ── Site-wide ─────────────────────────────────────────────────────────── */

export const settingsQuery = defineQuery(`*[_type == "siteSettings"][0]{
  ...,
  "brochureUrl": brochure.asset->url,
  mainNav[]{..., ${internalRef}, children[]{..., ${internalRef}}},
  headerCta{${link}},
  footerColumns[]{..., links[]{${link}}},
  legalLinks[]{${link}},
  defaultSeo{..., "ogImageUrl": ogImage.asset->url},
  "topProducts": *[_type == "product" && featured == true] | order(order asc)[0...5]{title, "slug": slug.current},
  "productOptions": *[_type == "product"] | order(order asc).title
}`);

/* ── Pages ─────────────────────────────────────────────────────────────── */

export const pageQuery = defineQuery(`*[_type == "page" && slug.current == $slug][0]{
  _id, _type, _updatedAt, title, "slug": slug.current,
  header{..., buttons[]{${link}}},
  "parent": parent->{title, "slug": slug.current, "parent": parent->{title, "slug": slug.current}},
  ${seo},
  ${pageBuilder}
}`);

export const pageSlugsQuery = defineQuery(`*[_type == "page" && defined(slug.current) && slug.current != "home"].slug.current`);

/* ── Products ──────────────────────────────────────────────────────────── */

export const productQuery = defineQuery(`*[_type == "product" && slug.current == $slug][0]{
  ...,
  "slug": slug.current,
  "category": category->{title, "slug": slug.current},
  "datasheetUrl": datasheet.asset->url,
  "industries": industries[]->{${industryCard}},
  "relatedProducts": coalesce(relatedProducts[]->{${productCard}}, *[_type == "product" && category._ref == ^.category._ref && _id != ^._id][0...3]{${productCard}}),
  "faqs": faqs[]->{${faqItem}},
  ${seo}
}`);

export const productSlugsQuery = defineQuery(`*[_type == "product" && defined(slug.current)].slug.current`);

export const categoryQuery = defineQuery(`*[_type == "productCategory" && slug.current == $slug][0]{
  ...,
  "slug": slug.current,
  "products": *[_type == "product" && references(^._id)] | order(order asc){${productCard}},
  "otherCategories": *[_type == "productCategory" && slug.current != $slug] | order(order asc){${categoryCard}},
  ${seo}
}`);

export const categorySlugsQuery = defineQuery(`*[_type == "productCategory" && defined(slug.current)].slug.current`);

/* ── Industries ────────────────────────────────────────────────────────── */

export const industryQuery = defineQuery(`*[_type == "industry" && slug.current == $slug][0]{
  ...,
  "slug": slug.current,
  "recommendedProducts": recommendedProducts[]->{_type, ${productCard}, "image": image},
  "caseStudy": caseStudy->{${projectCard}},
  "otherIndustries": *[_type == "industry" && slug.current != $slug] | order(order asc){${industryCard}},
  ${seo}
}`);

export const industrySlugsQuery = defineQuery(`*[_type == "industry" && defined(slug.current)].slug.current`);

/* ── Projects ──────────────────────────────────────────────────────────── */

export const projectQuery = defineQuery(`*[_type == "project" && isCaseStudy == true && slug.current == $slug][0]{
  ...,
  "slug": slug.current,
  "industry": industry->{title, "slug": slug.current},
  "more": *[_type == "project" && slug.current != $slug] | order(order asc)[0...3]{${projectCard}},
  ${seo}
}`);

export const projectSlugsQuery = defineQuery(`*[_type == "project" && isCaseStudy == true && defined(slug.current)].slug.current`);

/* ── Posts ─────────────────────────────────────────────────────────────── */

export const postQuery = defineQuery(`*[_type == "post" && slug.current == $slug && postType == $postType][0]{
  ...,
  "slug": slug.current,
  "categories": categories[]->{title, "slug": slug.current},
  "related": *[_type == "post" && postType == ^.postType && slug.current != $slug] | order(publishedAt desc)[0...3]{${postCard}},
  ${seo}
}`);

export const postSlugsQuery = defineQuery(`*[_type == "post" && postType == $postType && defined(slug.current)].slug.current`);

/* ── Utility ───────────────────────────────────────────────────────────── */

export const sitemapQuery = defineQuery(`{
  "pages": *[_type == "page" && defined(slug.current) && seo.noIndex != true]{title, "slug": slug.current, _updatedAt, "parent": parent->slug.current} | order(slug asc),
  "products": *[_type == "product" && defined(slug.current) && seo.noIndex != true] | order(order asc){title, "slug": slug.current, _updatedAt},
  "categories": *[_type == "productCategory" && defined(slug.current)] | order(order asc){title, "slug": slug.current, _updatedAt},
  "industries": *[_type == "industry" && defined(slug.current)] | order(order asc){title, "slug": slug.current, _updatedAt},
  "projects": *[_type == "project" && defined(slug.current) && isCaseStudy == true] | order(order asc){title, "slug": slug.current, _updatedAt},
  "posts": *[_type == "post" && defined(slug.current) && seo.noIndex != true] | order(publishedAt desc){title, "slug": slug.current, postType, _updatedAt}
}`);

export const searchQuery = defineQuery(`*[
  _type in ["page", "product", "productCategory", "industry", "project", "post"]
  && defined(slug.current)
  && (title match $q || shortDescription match $q || excerpt match $q || summary match $q || pt::text(body) match $q)
] | score(boost(title match $q, 3)) | order(_score desc)[0...20]{
  _type, title, "slug": slug.current, postType,
  "text": coalesce(shortDescription, excerpt, summary, header.intro, seo.metaDescription)
}`);

export const redirectsQuery = defineQuery(`*[_type == "redirect" && defined(source) && defined(destination)]{source, destination, permanent}`);
