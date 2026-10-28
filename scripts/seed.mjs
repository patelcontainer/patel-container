/**
 * Seeds Sanity with the starter content from the client's content draft and the current website.
 * Idempotent: documents use fixed IDs and are replaced on each run.
 *
 *   node --env-file=.env.local scripts/seed.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
import { basename, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const here = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(here, "seed-assets");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-10-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

/* ── helpers ─────────────────────────────────────────────────────────── */

const key = () => randomBytes(6).toString("hex");
const ref = (id) => ({ _type: "reference", _ref: id });
const refs = (ids) => ids.map((id) => ({ ...ref(id), _key: key() }));
const slug = (s) => ({ _type: "slug", current: s });

/** Adds _key to every object inside arrays (Sanity requirement). */
function withKeys(v) {
  if (Array.isArray(v)) return v.map((x) => (x && typeof x === "object" && !Array.isArray(x) ? { _key: x._key || key(), ...withKeys(x) } : withKeys(x)));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, withKeys(x)]));
  return v;
}

/** Tiny markdown → Portable Text: "## h2", "### h3", "- bullet", "> quote", **bold**, blank-line paragraphs. */
function pt(md) {
  const blocks = [];
  for (const raw of md.trim().split(/\n\s*\n|\n(?=- |## |### |> )/)) {
    const line = raw.trim().replace(/\n/g, " ");
    if (!line) continue;
    let style = "normal";
    let listItem;
    let text = line;
    const prefixes = [["### ", "h3"], ["## ", "h2"], ["> ", "blockquote"], ["- ", "bullet"]];
    const hit = prefixes.find(([p]) => text.startsWith(p));
    if (hit) {
      text = text.slice(hit[0].length);
      if (hit[1] === "bullet") listItem = "bullet";
      else style = hit[1];
    }
    const children = text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((t) =>
      t.startsWith("**") ? { _type: "span", _key: key(), text: t.slice(2, -2), marks: ["strong"] } : { _type: "span", _key: key(), text: t, marks: [] },
    );
    blocks.push({ _type: "block", _key: key(), style, markDefs: [], children, ...(listItem ? { listItem, level: 1 } : {}) });
  }
  return blocks;
}

const assetCache = {};
async function upload(file) {
  if (assetCache[file]) return assetCache[file];
  const existing = await client.fetch(`*[_type == "sanity.imageAsset" && originalFilename == $f][0]._id`, { f: file });
  if (existing) return (assetCache[file] = existing);
  const path = join(ASSETS, file);
  if (!existsSync(path)) throw new Error(`Missing seed asset ${path}`);
  const asset = await client.assets.upload("image", readFileSync(path), { filename: basename(path) });
  console.log("  ↑", file);
  return (assetCache[file] = asset._id);
}

/** Image field value; crop trims the white padding baked into some of the old site's images. */
const img = (assetId, alt, crop) => ({
  _type: "imageWithAlt",
  asset: ref(assetId),
  alt,
  ...(crop ? { crop: { _type: "sanity.imageCrop", ...crop }, hotspot: { _type: "sanity.imageHotspot", x: 0.5, y: 0.5, width: 1 - crop.left - crop.right, height: 1 - crop.top - crop.bottom } } : {}),
});
const btn = (label, url, style = "primary", internal) => ({ _type: "button", label, style, ...(url ? { url } : {}), ...(internal ? { internal: ref(internal) } : {}) });
const link = (label, internal, url) => ({ _type: "link", label, ...(internal ? { internal: ref(internal) } : {}), ...(url ? { url } : {}) });
const item = (icon, title, text) => ({ _type: "iconItem", icon, title, ...(text ? { text } : {}) });
const kv = (label, value) => ({ _type: "keyValue", label, value });
const seo = (metaTitle, metaDescription, extra = {}) => ({ _type: "seo", metaTitle, metaDescription, ...extra });

/** Reads the default template wording from src/lib/templates.ts so the CMS starts filled in. */
function templateDefaults() {
  const src = readFileSync(join(here, "../src/lib/templates.ts"), "utf8");
  const out = {};
  for (const m of src.matchAll(/name: "(\w+)",[^\n]*?default: ("(?:[^"\\]|\\.)*")/g)) out[m[1]] = JSON.parse(m[2]);
  return out;
}

/* ── content ─────────────────────────────────────────────────────────── */

async function run() {
  if (!client.config().token) throw new Error("SANITY_API_WRITE_TOKEN missing");
  console.log("Uploading images…");
  const A = {
    portCranes: await upload("port-cranes.jpg"),
    ship: await upload("container-ship.jpg"),
    portAerial: await upload("port-aerial.jpg"),
    shipCranes: await upload("ship-cranes.jpg"),
    stack: await upload("containers-stack.jpg"),
    deflag: await upload("deflagration-test.png"),
    enclosure: await upload("enclosure-test.png"),
    laser: await upload("laser-cutting.png"),
    belimo: await upload("client-belimo.png"),
  };
  const CROP = {
    deflag: { top: 0.13, bottom: 0.13, left: 0.158, right: 0.158 },
    enclosure: { top: 0.103, bottom: 0.103, left: 0.208, right: 0.208 },
    laser: { top: 0.152, bottom: 0.178, left: 0.143, right: 0.143 },
  };
  const I = {
    portCranes: img(A.portCranes, "Container terminal with gantry cranes and stacked shipping containers"),
    ship: img(A.ship, "Container ship loaded with ISO shipping containers at sea"),
    portAerial: img(A.portAerial, "Aerial view of a container yard with stacked ISO containers"),
    shipCranes: img(A.shipCranes, "Container ship being loaded under ship-to-shore cranes"),
    stack: img(A.stack, "Stacked steel shipping containers against a blue sky"),
    deflag: img(A.deflag, "Enclosure container after the deflagration test developed with GE Renewables India", CROP.deflag),
    enclosure: img(A.enclosure, "Technician testing a specialised enclosure container at the Patel Container plant", CROP.enclosure),
    laser: img(A.laser, "CNC fibre laser cutting machine used for container panel processing", CROP.laser),
  };

  const docs = [];
  const add = (d) => docs.push(withKeys(d));

  /* Product categories */
  const cats = [
    ["cat-standard", "Standard ISO Containers", "standard-iso-containers", "container", "20 ft and 40 ft general purpose containers built to ISO dimensions.", I.portAerial,
      "Our general purpose (GP) containers are the workhorse of global trade: cost-effective, stackable and built to ISO standard dimensions so they move seamlessly across ships, rail and road.\n\nEvery box is fabricated, shot-blasted, primed, painted and leak-tested in our Bhavnagar plant."],
    ["cat-highcube", "High Cube Containers", "high-cube-containers", "boxes", "Extra height for taller and higher-volume loads.", I.ship,
      "High Cube containers stand one foot taller than standard boxes (9.6 ft against 8.6 ft), giving more cubic capacity for light, bulky or tall cargo on the same footprint."],
    ["cat-truck", "Truck & Load-Body Containers", "truck-containers", "truck", "10, 20 and 40 ft containers and load bodies for road transport.", I.portCranes,
      "Truck containers are designed to sit on a truck chassis for road transport. We also manufacture application-based load bodies for commercial vehicles and cylindrical truck containers for fuel and other liquids."],
    ["cat-specialized", "Specialized Containers", "specialized-containers", "shield", "Engineered enclosures, refrigerated and custom-built containers.", I.enclosure,
      "When a standard box isn't enough, our engineers design to your specification: equipment and energy-storage enclosures, refrigerated containers and project-specific builds, including enclosures validated through deflagration testing."],
    ["cat-railway", "Railway & Rolling Stock", "railway-and-rolling-stock", "train", "Railway wagons, passenger coach components and alloy steel castings.", null,
      "The Patel group manufactures railway wagons, components for passenger coaches and alloy steel castings for rolling stock and track, built with the same in-house engineering and fabrication depth as our containers."],
    ["cat-ev", "Commercial EV", "commercial-ev", "zap", "Our eLCV range of electric light commercial vehicles.", null,
      "The group has entered the commercial electric vehicle space with the launch of two electric light commercial vehicles (eLCVs), bringing our load-body and fabrication expertise to clean last-mile mobility."],
  ];
  cats.forEach(([id, title, s, icon, short, image, body], i) =>
    add({
      _id: id, _type: "productCategory", title, slug: slug(s), icon, shortDescription: short, order: i + 1,
      ...(image ? { image } : {}),
      body: pt(body),
      seo: seo(`${title} Manufacturer in India`, `${short} Built by Patel Container India in Bhavnagar, Gujarat. Request a quote.`),
    }),
  );

  /* FAQs */
  const faqs = [
    ["faq-types", "Products", "What types of containers does Patel make?", "We make 20 ft and 40 ft ISO containers, 20 ft and 40 ft High Cube containers and truck containers. We also build specialized and refrigerated containers, railway wagons and components, and load bodies for commercial vehicles."],
    ["faq-hc-diff", "Products", "What is the difference between a standard and a High Cube container?", "A High Cube is one foot taller. A 40 ft standard container is 8.6 ft high and a 40 ft High Cube is 9.6 ft high, so you can load taller cargo or stack more volume on the same footprint."],
    ["faq-weights", "Products", "What are the weight limits?", "A 20 ft ISO container has a maximum gross weight of 30,480 kg and a 40 ft ISO container 32,500 kg. Maximum payload is 28,800 kg for both. A 40 ft High Cube has a maximum gross weight of 32,730 kg."],
    ["faq-order", "Ordering", "How do I place an order?", "Use the Get a Quote page, call +91 70464 68484, or message us on WhatsApp. We will confirm specifications and price."],
    ["faq-custom", "Ordering", "Do you accept custom specifications?", "Yes. Our in-house design and engineering team can adapt dimensions, doors, ventilation, insulation, fittings and paint to your requirement. Share your drawings or a short brief with your quote request."],
    ["faq-moq", "Ordering", "What is the minimum order?", "We handle both single units and bulk orders. Tell us your quantity and timeline and we will advise on pricing and lead time."],
    ["faq-export", "Shipping and export", "Do you export?", "Yes, we welcome export enquiries. Share your destination port and quantity and we will quote delivered or ex-works prices."],
    ["faq-leadtime", "Shipping and export", "What is the delivery time?", "Lead time depends on quantity, specification and destination. We confirm a firm delivery schedule in your quotation."],
    ["faq-testing", "Quality", "How are containers tested?", "Every container goes through in-house leak testing for water-tightness, with quality checks at each stage of fabrication, painting and final inspection before dispatch."],
    ["faq-deflag", "Quality", "What is your deflagration test?", "Patel is the first in Asia to perform the deflagration test, developed jointly with GE Renewables India. It verifies that an enclosure behaves safely when gases inside it ignite, which is critical for energy-storage and power equipment enclosures."],
  ];
  faqs.forEach(([id, topic, question, answer], i) => add({ _id: id, _type: "faq", topic, question, answer: pt(answer), order: i + 1 }));

  /* Industries */
  const industries = [
    ["ind-shipping", "Shipping & Logistics", "shipping-and-logistics", "ship", I.portAerial, "Standard, durable ISO boxes in volume for exporters and shipping lines.",
      "Exporters, freight forwarders and shipping lines need standard, durable boxes in volume, delivered on schedule.",
      "20 ft and 40 ft ISO and High Cube containers built in Bhavnagar, with precision-cut panels, in-house painting and leak testing on every unit.",
      ["ISO standard dimensions for intermodal transport", "Shot-blasted, primed and painted in-house", "Leak-tested before dispatch"],
      ["p-20-iso", "p-40-iso", "p-20-hc", "p-40-hc"]],
    ["ind-energy", "Renewable Energy", "renewable-energy", "wind", I.deflag, "Safe, tested enclosures for energy storage and power equipment.",
      "Energy storage and power equipment need enclosures that stay safe under fault conditions and protect sensitive equipment from the environment.",
      "Patel co-developed deflagration testing with GE Renewables India, the first of its kind in Asia, and builds enclosures to project specifications.",
      ["Asia's first deflagration-tested enclosure", "Built to project specifications", "In-house design, simulation and DFMEA"],
      ["cat-specialized"]],
    ["ind-railways", "Railways", "railways", "train", null, "Wagons, coach components and castings for rolling stock and track.",
      "Rail operators and coach builders need robust, precisely fabricated components that meet demanding standards.",
      "Our group manufactures railway wagons, components for passenger coaches and alloy steel castings for rolling stock and track.",
      ["Railway wagons", "Passenger coach components", "Alloy steel castings for rolling stock and track"],
      ["cat-railway"]],
    ["ind-cv", "Commercial Vehicles", "commercial-vehicles", "truck", I.portCranes, "Load bodies, truck containers and electric LCVs.",
      "Fleet owners and vehicle builders need load bodies matched to the chassis and the application, and a path to cleaner last-mile transport.",
      "We build application-based load bodies and truck containers in 10, 20 and 40 ft lengths, and offer two electric light commercial vehicles.",
      ["Truck containers in 10, 20 and 40 ft", "Cylindrical containers for fuel and liquids", "eLCV range for last-mile delivery"],
      ["p-truck", "cat-ev"]],
    ["ind-storage", "Storage & Site Use", "storage-and-site-use", "warehouse", I.stack, "Secure, weather-tight containers for on-site storage.",
      "Construction sites, factories and project sites need secure, weather-tight storage that can be moved when the job moves.",
      "Our ISO and High Cube containers make secure, portable storage units, and we can add doors, ventilation and fittings to suit your site.",
      ["Weather-tight, leak-tested boxes", "Portable and stackable", "Custom doors, vents and fittings"],
      ["p-20-iso", "p-20-hc"]],
  ];
  industries.forEach(([id, title, s, icon, image, short, challenge, solution, points, recs], i) =>
    add({
      _id: id, _type: "industry", title, slug: slug(s), icon, shortDescription: short, order: i + 1,
      ...(image ? { image } : {}),
      challenge: pt(challenge), solution: pt(solution), solutionPoints: points,
      recommendedProducts: refs(recs),
      ...(id === "ind-energy" ? { caseStudy: ref("proj-deflagration") } : {}),
      seo: seo(`Containers for ${title} | Patel Container India`, `${short} Engineered and built by Patel Container India, Bhavnagar.`),
    }),
  );

  /* Products */
  const commonFeatures = [
    item("scissors", "Precision-cut panels", "Laser and CNC plasma cutting with CNC press brakes keep every panel accurate."),
    item("layers", "Corrugated in-house", "Panel corrugations formed with our own tooling for consistent strength."),
    item("paint", "Shot blast, primer and paint", "Surface preparation and painting for containers up to 40 ft, done in-house."),
    item("droplets", "Leak-tested", "Every container is checked for water-tightness in our in-house test facility."),
    item("ruler", "ISO standard dimensions", "Built to standard external dimensions for intermodal transport."),
    item("cog", "Custom specifications", "Doors, vents, insulation, fittings and paint adapted to your needs."),
  ];
  const materials = ["Corten (weathering) steel body", "Marine-grade paint system", "Marine plywood floor", "Lashing points"];
  const dims = (l, lm, h, hm) => [
    { _type: "specGroup", title: "External dimensions", rows: [kv("Length", `${l} ft (${lm} m)`), kv("Width", "8 ft (2.438 m)"), kv("Height", `${h} ft (${hm} m)`)] },
  ];
  const products = [
    {
      _id: "p-20-iso", title: "20 ft ISO Container", s: "20-ft-iso-container", cat: "cat-standard", image: I.portAerial, order: 1,
      short: "The 20 ft general purpose (GP) container is one of the most cost-effective ways to move a wide range of goods.",
      body: "The 20 ft general purpose (GP) container is one of the most cost-effective ways to move a wide range of goods from one place to another. The 20 ft signifies the overall length of the container. It measures 8 ft wide and 8.6 ft high, with a maximum gross weight of 30,480 kg and a maximum payload of 28,800 kg.\n\nIts compact footprint makes it ideal for heavy, dense cargo, export packing and on-site storage.",
      key: [kv("Length", "20 ft"), kv("Width", "8 ft"), kv("Height", "8.6 ft"), kv("Max payload", "28,800 kg"), kv("Max gross weight", "30,480 kg")],
      specs: [...dims(20, "6.058", 8.6, "2.591"), { _type: "specGroup", title: "Weights", rows: [kv("Max gross weight", "30,480 kg"), kv("Max payload", "28,800 kg")] }],
      apps: ["General cargo", "Export packing", "On-site storage", "Heavy, dense goods"],
      related: ["p-40-iso", "p-20-hc"], inds: ["ind-shipping", "ind-storage"], faqs: ["faq-weights", "faq-custom", "faq-testing"],
      seo: seo("20 ft ISO Container Manufacturer in India", "20 ft GP container, 8 ft wide, 8.6 ft high, 28,800 kg payload. Request a quote from Patel Container India."),
    },
    {
      _id: "p-40-iso", title: "40 ft ISO Container", s: "40-ft-iso-container", cat: "cat-standard", image: I.shipCranes, order: 2,
      short: "The 40 ft GP container moves bulk cargo at a lower cost per cubic metre.",
      body: "The 40 ft GP container proves to be an extremely cost-effective way to transport a variety of goods. It moves bulk cargo at a lower cost per cubic metre. It measures 8 ft wide and 8.6 ft high, with a maximum gross weight of 32,500 kg and a maximum payload of 28,800 kg.",
      key: [kv("Length", "40 ft"), kv("Width", "8 ft"), kv("Height", "8.6 ft"), kv("Max payload", "28,800 kg"), kv("Max gross weight", "32,500 kg")],
      specs: [...dims(40, "12.192", 8.6, "2.591"), { _type: "specGroup", title: "Weights", rows: [kv("Max gross weight", "32,500 kg"), kv("Max payload", "28,800 kg")] }],
      apps: ["Bulk shipments", "Furniture", "Machinery", "Consumer goods"],
      related: ["p-20-iso", "p-40-hc"], inds: ["ind-shipping"], faqs: ["faq-weights", "faq-hc-diff", "faq-export"],
      seo: seo("40 ft ISO Container Manufacturer in India", "40 ft GP container, 8 ft wide, 8.6 ft high, 28,800 kg payload. Request a quote from Patel Container India."),
    },
    {
      _id: "p-20-hc", title: "20 ft High Cube Container", s: "20-ft-high-cube-container", cat: "cat-highcube", image: I.stack, order: 3,
      short: "Extra height in a compact footprint, for industries that need more volume.",
      body: "The 20 ft High Cube adds extra height so cargo can be stacked or loaded taller, and suits industries that need more volume in a compact footprint. It is one of the most cost-effective methods of transporting light, bulky goods and is readily preferred by many industries.",
      key: [kv("Length", "20 ft"), kv("Width", "8 ft"), kv("Height", "9.6 ft"), kv("Payload", "On request"), kv("Gross weight", "On request")],
      specs: [...dims(20, "6.058", 9.6, "2.896")],
      apps: ["Light, bulky cargo", "Equipment", "Storage"],
      related: ["p-20-iso", "p-40-hc"], inds: ["ind-shipping", "ind-storage"], faqs: ["faq-hc-diff", "faq-custom"],
      seo: seo("20 ft High Cube Container Manufacturer", "20 ft High Cube container with extra height for taller loads. Built in Bhavnagar. Get a quote."),
    },
    {
      _id: "p-40-hc", title: "40 ft High Cube Container", s: "40-ft-high-cube-container", cat: "cat-highcube", image: I.ship, order: 4,
      short: "One foot taller than a standard 40 ft container, so goods can be loaded higher.",
      body: "The 40 ft High Cube stands one foot taller than a standard 40 ft container, so goods can be loaded higher. It measures 8 ft wide and 9.6 ft high, with a maximum gross weight of 32,730 kg and a maximum payload of 28,800 kg.",
      key: [kv("Length", "40 ft"), kv("Width", "8 ft"), kv("Height", "9.6 ft"), kv("Max payload", "28,800 kg"), kv("Max gross weight", "32,730 kg")],
      specs: [...dims(40, "12.192", 9.6, "2.896"), { _type: "specGroup", title: "Weights", rows: [kv("Max gross weight", "32,730 kg"), kv("Max payload", "28,800 kg")] }],
      apps: ["Voluminous cargo", "Apparel", "Furniture", "Packaged goods"],
      related: ["p-40-iso", "p-20-hc"], inds: ["ind-shipping"], faqs: ["faq-hc-diff", "faq-weights", "faq-export"],
      seo: seo("40 ft High Cube Container Manufacturer", "40 ft High Cube container, 9.6 ft high, 28,800 kg payload. Built in Bhavnagar. Get a quote."),
    },
    {
      _id: "p-truck", title: "Truck Container", s: "truck-container", cat: "cat-truck", image: I.portCranes, order: 5,
      short: "Containers built to sit on trucks, in 10, 20 and 40 ft, plus cylindrical containers for liquids.",
      body: "Truck containers are specialised containers designed to be seated on trucks for the road transport of many kinds of goods. They are available in a number of sizes to match the truck. Common lengths are 10, 20 and 40 ft with an 8 ft width. Standard height is 8.6 ft and High Cube height is 9.6 ft.\n\nCylindrical truck containers are also available, specially designed to carry fuel and other liquids.",
      key: [kv("Lengths", "10 / 20 / 40 ft"), kv("Width", "8 ft"), kv("Standard height", "8.6 ft"), kv("High Cube height", "9.6 ft"), kv("Variants", "Box & cylindrical")],
      specs: [
        { _type: "specGroup", title: "Sizes", rows: [kv("Lengths", "10 ft, 20 ft, 40 ft"), kv("Width", "8 ft"), kv("Standard height", "8.6 ft"), kv("High Cube height", "9.6 ft")] },
        { _type: "specGroup", title: "Variants", rows: [kv("Box container", "General goods"), kv("Cylindrical container", "Fuel and other liquids"), kv("Sizing", "Matched to truck chassis")] },
      ],
      apps: ["Goods transport", "Fuel and liquids", "Distribution fleets"],
      related: ["p-20-iso", "p-40-iso"], inds: ["ind-cv"], faqs: ["faq-custom", "faq-order"],
      seo: seo("Truck Container Manufacturer in Gujarat", "Truck containers in 10, 20 and 40 ft, plus cylindrical containers for liquids. Request a quote."),
    },
  ];
  products.forEach((p) =>
    add({
      _id: p._id, _type: "product", title: p.title, slug: slug(p.s), category: ref(p.cat), shortDescription: p.short,
      mainImage: p.image, body: pt(p.body), keySpecs: p.key, specGroups: p.specs, features: commonFeatures,
      materials: p._id === "p-truck" ? ["Steel body matched to the truck chassis", "Marine-grade paint system"] : materials,
      applications: p.apps, industries: refs(p.inds), relatedProducts: refs(p.related), faqs: refs(p.faqs),
      gallery: [I.laser, I.enclosure], featured: true, order: p.order, seo: p.seo,
    }),
  );

  /* Projects, clients, certificates, gallery */
  add({
    _id: "proj-deflagration", _type: "project", title: "Asia's first deflagration-tested enclosure", slug: slug("deflagration-test-ge-renewables"),
    filter: "Engineering", industry: ref("ind-energy"), client: "GE Renewables India", productLabel: "Energy enclosure container",
    quantity: "Development project", location: "India", mainImage: I.deflag, isCaseStudy: true, featured: true, order: 1,
    summary: "Developed jointly with GE Renewables India, this was the first deflagration test performed in Asia, proving an enclosure design safe under internal gas ignition.",
    requirement: pt("Energy-storage and power equipment enclosures must stay safe if gases inside them ignite. GE Renewables India needed an enclosure design whose behaviour under deflagration was proven by physical testing, not only by calculation."),
    solution: pt("Our engineering team co-developed the enclosure and the test set-up, using in-house 3D modelling, simulation and DFMEA. The enclosure was fabricated and finished in our Bhavnagar plant and prepared for the deflagration test."),
    result: pt("Patel became the first company in Asia to perform the deflagration test. The project established a validated design approach that we now apply to specialised and energy enclosures."),
    resultStats: [kv("In Asia to perform the deflagration test", "1st"), kv("Design & development projects", "30+")],
    gallery: [I.deflag, I.enclosure],
    seo: seo("Deflagration Test Case Study | Patel Container India", "How Patel Container India and GE Renewables India performed Asia's first deflagration test on an enclosure container."),
  });
  add({
    _id: "proj-enclosure", _type: "project", title: "Specialised equipment enclosure", slug: slug("specialised-equipment-enclosure"),
    filter: "Containers", industry: ref("ind-energy"), productLabel: "Specialised container", quantity: "Custom build", mainImage: I.enclosure, isCaseStudy: false, featured: true, order: 2,
    summary: "A custom enclosure container with multiple access doors, built and leak-tested in our plant.",
  });
  add({
    _id: "proj-elcv", _type: "project", title: "Launch of two eLCV models", slug: slug("elcv-launch"),
    filter: "EV", industry: ref("ind-cv"), productLabel: "Electric light commercial vehicles", quantity: "2 models", isCaseStudy: false, order: 3,
    summary: "The group entered the commercial EV space with the launch of two electric light commercial vehicles.",
  });
  add({ _id: "client-belimo", _type: "client", name: "Belimo", logo: { _type: "image", asset: ref(A.belimo) }, order: 1 });
  add({ _id: "client-ge", _type: "client", name: "GE Renewables India", order: 2 });

  const certs = [
    ["cert-iso1496", "ISO 1496 dimensions", "International Organization for Standardization", "Containers built to ISO 1496 series dimensions for freight containers."],
    ["cert-deflag", "Deflagration tested", "Joint development with GE Renewables India", "First deflagration test performed in Asia on an enclosure container."],
    ["cert-leak", "In-house leak testing", "Patel Container India QA", "Water-tightness test on containers before dispatch."],
    ["cert-dfmea", "DFMEA & PFMEA", "In-house engineering", "Design and process failure-mode analysis built into our engineering workflow."],
  ];
  certs.forEach(([id, title, issuer, description], i) => add({ _id: id, _type: "certificate", title, issuer, description, order: i + 1 }));

  add({ _id: "album-plant", _type: "galleryAlbum", title: "Plant and machinery", category: "Plant and Machinery", images: [I.laser, I.enclosure], order: 1 });
  add({ _id: "album-testing", _type: "galleryAlbum", title: "Testing", category: "Testing", images: [I.deflag, I.enclosure], order: 2 });
  add({ _id: "album-products", _type: "galleryAlbum", title: "Containers in service", category: "Products", images: [I.portAerial, I.ship, I.shipCranes, I.portCranes, I.stack], order: 3 });

  /* Posts */
  const catIds = { company: "pc-company", products: "pc-products", guides: "pc-guides", engineering: "pc-engineering" };
  [["pc-company", "Company"], ["pc-products", "Products"], ["pc-events", "Events"], ["pc-awards", "Awards"], ["pc-guides", "Buying guides"], ["pc-engineering", "Engineering"]].forEach(([id, t]) =>
    add({ _id: id, _type: "postCategory", title: t, slug: slug(t.toLowerCase().replace(/\s+/g, "-")) }),
  );
  const posts = [
    {
      _id: "post-elcv", postType: "news", title: "Patel group enters commercial EV space with two eLCVs", s: "patel-group-launches-two-elcvs", date: "2026-09-15", cat: catIds.products, image: I.portCranes,
      excerpt: "Building on decades of load-body and fabrication experience, the group has launched two electric light commercial vehicles.",
      body: "The Patel group has entered the commercial electric vehicle space with the launch of two electric light commercial vehicles (eLCVs).\n\nThe move builds on the group's experience in application-based load bodies for commercial vehicles, and brings the same in-house engineering and fabrication depth to clean last-mile mobility.\n\n## Why commercial EVs\n\nUrban delivery fleets are moving to electric drivetrains to cut running costs and emissions. Load-body design matters as much as the drivetrain: weight, volume and access decide how useful the vehicle is on the road.\n\nFor details on the eLCV range, contact our team.",
    },
    {
      _id: "post-deflag-news", postType: "news", title: "Asia's first deflagration test, developed with GE Renewables India", s: "asias-first-deflagration-test", date: "2026-08-20", cat: catIds.company, image: I.deflag,
      excerpt: "Patel Container India is the first in Asia to perform the deflagration test on an enclosure, in joint development with GE Renewables India.",
      body: "Patel Container India is the first company in Asia to perform the deflagration test, in joint development with GE Renewables, India.\n\nThe test validates how an enclosure behaves when gases inside it ignite, which is critical for energy-storage and power equipment.\n\nRead the full case study on our Projects page.",
    },
    {
      _id: "post-20-vs-40", postType: "blog", title: "How to choose between 20 ft and 40 ft containers", s: "20-ft-vs-40-ft-container", date: "2026-07-10", cat: catIds.guides, image: I.portAerial, featured: true,
      excerpt: "Weight, volume, cost per cubic metre and handling: a practical guide to picking the right container length.",
      body: "Choosing between a 20 ft and a 40 ft container comes down to what you ship, how much of it, and where it goes.\n\n## Compare the numbers\n\n- **20 ft ISO:** 8 ft wide, 8.6 ft high, maximum gross weight 30,480 kg, maximum payload 28,800 kg.\n- **40 ft ISO:** 8 ft wide, 8.6 ft high, maximum gross weight 32,500 kg, maximum payload 28,800 kg.\n\nBoth carry the same maximum payload, but the 40 ft offers roughly twice the volume.\n\n## When a 20 ft is the better choice\n\n- Heavy, dense cargo such as metals, stone or machinery parts, where you reach the weight limit before the box is full.\n- Smaller shipments or sites with limited space for handling and storage.\n\n## When a 40 ft is the better choice\n\n- Light, bulky goods such as furniture, packaged consumer goods or apparel.\n- Large shipments, where the cost per cubic metre is lower.\n\n## Still unsure?\n\nTell us what you are shipping and the quantity, and our team will recommend the right size.",
    },
    {
      _id: "post-std-vs-hc", postType: "blog", title: "Standard vs High Cube: which one do you need?", s: "standard-vs-high-cube-container", date: "2026-06-18", cat: catIds.guides, image: I.ship,
      excerpt: "One extra foot of height can change your loading plan. Here is when a High Cube pays off.",
      body: "A High Cube container is one foot taller than a standard container: 9.6 ft instead of 8.6 ft. Length and width stay the same.\n\n## What the extra foot gives you\n\n- More cubic capacity on the same footprint.\n- Room for taller items that will not fit in a standard box.\n- Better stacking of light, bulky cargo.\n\n## When to stay with a standard container\n\nIf your cargo is heavy and dense, you will reach the payload limit before you use the extra height, so a standard container is usually more economical.\n\n## The numbers\n\nA 40 ft High Cube measures 8 ft wide and 9.6 ft high, with a maximum gross weight of 32,730 kg and a maximum payload of 28,800 kg.",
    },
    {
      _id: "post-what-deflag", postType: "blog", title: "What is a deflagration test and why it matters", s: "what-is-a-deflagration-test", date: "2026-05-22", cat: catIds.engineering, image: I.deflag,
      excerpt: "Why enclosures for energy storage and power equipment need to be proven safe under internal gas ignition.",
      body: "A deflagration is a fast-burning combustion of flammable gas that travels slower than the speed of sound. Inside a closed enclosure it can build up pressure quickly.\n\n## Why it matters for enclosures\n\nBattery energy storage systems and some power equipment can release flammable gases under fault conditions. If those gases ignite, the enclosure must manage the pressure safely to protect people and nearby equipment.\n\n## How the test works\n\nA deflagration test ignites a controlled gas mixture inside the enclosure and measures how the structure and its safety features respond.\n\n## Our experience\n\nPatel Container India is the first in Asia to perform the deflagration test, in joint development with GE Renewables India.",
    },
    {
      _id: "post-how-built", postType: "blog", title: "How an ISO container is built", s: "how-an-iso-container-is-built", date: "2026-04-30", cat: catIds.engineering, image: I.laser,
      excerpt: "From drawings to dispatch: the eight stages every container goes through in our Bhavnagar plant.",
      body: "Every container we build follows the same disciplined sequence, with a quality check at each stage.\n\n## 1. Design and drawings\n\nOur engineers prepare 3D models, 2D drawings and CNC nesting programs in-house.\n\n## 2. Part processing\n\nSteel is cut, bent and sheared using laser cutting, CNC plasma cutting, CNC press brakes and shearing machines.\n\n## 3. Panel fabrication and welding\n\nPanels are corrugated with in-house tooling and welded on advanced fixtures with semi-automatic welding handlers.\n\n## 4. Container boxing\n\nFloor, walls, roof, frames and doors come together on our 20 ft and 40 ft assembly lines.\n\n## 5. Shot blasting\n\nThe surface is blasted clean to prepare it for coating.\n\n## 6. Primer and paint\n\nWe prime and paint containers up to 40 ft in-house.\n\n## 7. Leak and quality tests\n\nEvery container is leak-tested for water-tightness in our in-house facility.\n\n## 8. Final inspection and dispatch\n\nA final inspection confirms the container meets the specification before it leaves the plant.",
    },
  ];
  posts.forEach((p) =>
    add({
      _id: p._id, _type: "post", postType: p.postType, title: p.title, slug: slug(p.s), publishedAt: new Date(p.date + "T09:00:00Z").toISOString(),
      categories: refs([p.cat]), excerpt: p.excerpt, mainImage: p.image, body: pt(p.body), featured: Boolean(p.featured), author: "Patel Container India",
    }),
  );

  /* ── Pages ─────────────────────────────────────────────────────────── */
  const topCta = {
    default: [btn("Get a Quote", "/get-a-quote"), btn("Chat on WhatsApp", "#whatsapp", "whatsapp")],
    contact: [btn("Chat on WhatsApp", "#whatsapp", "whatsapp"), btn("Call +91 70464 68484", "tel:+917046468484", "outlineLight")],
    none: [],
  };
  const page = (id, title, s, sections, opts = {}) => {
    const kind = s === "contact" ? "contact" : s.startsWith("get-a-quote") ? "none" : "default";
    const header = opts.header ? { ...opts.header, buttons: opts.header.buttons || topCta[kind] } : undefined;
    add({ _id: id, _type: "page", title, slug: slug(s), pageBuilder: sections, ...opts, ...(header ? { header } : {}) });
  };
  const cta = (heading, text, buttons) => ({ _type: "ctaBlock", heading, text, buttons, image: I.shipCranes });
  const quoteBtns = [btn("Get a Quote", "/get-a-quote"), btn("Contact Us", "/contact", "outlineLight")];

  page("page-home", "Home", "home", [
    {
      _type: "heroBlock",
      eyebrow: "ISO container manufacturer · Bhavnagar, Gujarat",
      heading: "Complete Mobility Solutions, Built in India",
      subheading: "ISO shipping containers, specialized containers and engineered mobility products from Bhavnagar, Gujarat.",
      buttons: [btn("Get a Quote", "/get-a-quote"), btn("Download Brochure", "#brochure", "outlineLight")],
      images: [I.portCranes, I.ship, I.portAerial],
      highlights: [
        item("flame", "Asia's first deflagration test", "With GE Renewables India"),
        item("compass", "In-house design & engineering", "3D, 2D, CNC nesting, simulation"),
        item("droplets", "Leak-tested containers", "In-house test facility"),
        item("paint", "Painting up to 40 ft", "Shot blast, primer and paint"),
      ],
    },
    {
      _type: "splitContentBlock", eyebrow: "Who we are", heading: "A premier manufacturer of ISO marine shipping containers",
      body: pt("Patel Container India Private Limited is a premier manufacturer of ISO marine shipping containers and specialized containers. Our group also builds refrigerated containers, railway wagons, components for passenger coaches and alloy steel castings for rolling stock and track.\n\nWe make load bodies for commercial vehicles and have entered the commercial EV space with two eLCVs."),
      bullets: ["ISO & High Cube containers", "Specialized enclosures", "Railway & rolling stock", "Commercial EV (eLCV)"],
      image: I.enclosure, secondaryImage: I.laser, badge: kv("Design & engineering projects", "30+"),
      buttons: [btn("Know More About Us", "/about-us")], imagePosition: "right", background: "white",
    },
    { _type: "productCategoriesBlock", eyebrow: "Our products", heading: "Containers and mobility products for every load", intro: "From standard ISO boxes to specialized enclosures, rail and electric vehicles, all engineered and built in-house.", background: "light", buttons: [btn("View All Products", "/products", "secondary")] },
    {
      _type: "featureGridBlock", eyebrow: "Why choose Patel", heading: "Engineers, not just manufacturers", intro: "Every container is designed, fabricated, painted and tested under one roof by a team that solves real engineering problems.",
      columns: 3, variant: "cards", background: "white",
      items: [
        item("compass", "Complete in-house engineering", "3D modelling, 2D drafting, CNC nesting, simulation, DFMEA and PFMEA, all done by our own team."),
        item("flame", "Asia's first deflagration test", "Developed jointly with GE Renewables India to prove enclosure safety under internal gas ignition."),
        item("droplets", "Leak testing in-house", "Water-tightness checks in our own test facility before containers are dispatched."),
        item("paint", "Painting up to 40 ft", "Shot blasting, primer and paint for containers up to 40 ft, done in our plant."),
        item("boxes", "Wide product range", "Containers, rail products, load bodies and EVs from one engineering group."),
        item("cog", "Bulk and custom orders", "Standard specifications in volume, or builds adapted to your drawings."),
      ],
    },
    {
      _type: "statsBlock", background: "dark",
      stats: [
        { _type: "stat", value: 30, suffix: "+", label: "Design & engineering projects" },
        { _type: "stat", value: 1, suffix: "st", label: "In Asia to perform deflagration test" },
        { _type: "stat", value: 40, suffix: " ft", label: "Max container size built & painted" },
        { _type: "stat", value: 6, label: "Product categories" },
      ],
    },
    {
      _type: "splitContentBlock", eyebrow: "Facility & testing", heading: "Boxing, part processing, painting and testing under one roof",
      body: pt("Our Bhavnagar plant covers container boxing, part processing, painting and testing under one roof. Laser cutting, CNC plasma cutting, CNC press brakes and advanced welding fixtures keep every panel precise.\n\nWe are the first in Asia to perform the **deflagration test**, in joint development with GE Renewables, India."),
      bullets: ["20 ft & 40 ft boxing lines", "Laser & CNC plasma cutting", "Shot blast, primer & paint", "In-house leak test"],
      image: I.laser, buttons: [btn("Explore Our Facility", "/capabilities/manufacturing-facility"), btn("Testing & Innovation", "/capabilities/testing-and-innovation", "outline")],
      imagePosition: "left", background: "light",
    },
    { _type: "certificationsBlock", eyebrow: "Standards & testing", heading: "Built and tested to standard", layout: "strip", background: "white" },
    { _type: "clientsBlock", eyebrow: "Clients & projects", heading: "Trusted by industry and engineering partners", projects: refs(["proj-deflagration", "proj-enclosure", "proj-elcv"]), background: "light", buttons: [btn("View All Projects", "/projects", "secondary")] },
    { _type: "postsBlock", eyebrow: "Latest news", heading: "News and updates", postType: "all", mode: "latest", background: "white" },
    { _type: "faqBlock", eyebrow: "FAQ", heading: "Frequently asked questions", intro: "Quick answers on sizes, ordering, export and quality.", faqs: refs(["faq-types", "faq-hc-diff", "faq-weights", "faq-order", "faq-export"]), buttons: [btn("View All FAQs", "/faq", "outline")], background: "light" },
    {
      _type: "formBlock", eyebrow: "Enquiry", heading: "Tell us what you need", intro: "Share your requirement and our team will respond within one working day.",
      formType: "enquiry", submitLabel: "Send Enquiry", background: "dark", sectionId: "enquiry",
      points: [item("clock", "Reply within one working day"), item("compass", "Engineering support for custom builds"), item("globe", "Domestic and export orders")],
    },
  ], { seo: seo("ISO Container Manufacturer in Bhavnagar | Patel Container India", "Patel Container India makes ISO shipping containers, specialized containers and mobility products in Bhavnagar, Gujarat. Get a quote today.") });

  /* About */
  page("page-about", "About Us", "about-us", [
    {
      _type: "splitContentBlock", eyebrow: "Company profile", heading: "Complete mobility solutions from Bhavnagar",
      body: pt("Patel Container India Private Limited (PCIPL) is a premier manufacturer of ISO marine shipping containers, specialized containers and refrigerated containers. We also build railway wagons, components for passenger coaches and alloy steel castings for rolling stock and track."),
      image: I.enclosure, secondaryImage: I.laser, badge: kv("Engineering projects", "30+"), imagePosition: "right",
    },
    {
      _type: "featureGridBlock", eyebrow: "Vision & mission", heading: "What drives us", columns: 2, variant: "cards", background: "light",
      items: [
        item("eye", "Our vision", "To be a trusted global provider of complete mobility solutions, from containers to rail and electric vehicles."),
        item("target", "Our mission", "To engineer and build every product to international standards, test it before it ships, and support our customers with real engineering depth."),
      ],
    },
    {
      _type: "splitContentBlock", eyebrow: "Group overview", heading: "One engineering group, many mobility products",
      body: pt("The group also manufactures application-based load bodies for commercial vehicles and has entered the commercial EV space with the launch of two eLCVs."),
      bullets: ["ISO & specialized containers", "Refrigerated containers", "Railway wagons & coach components", "Alloy steel castings", "Commercial vehicle load bodies", "Electric LCVs"],
      image: I.ship, imagePosition: "left",
    },
    {
      _type: "featureGridBlock", eyebrow: "What sets us apart", heading: "Why customers choose Patel", columns: 4, variant: "numbered", background: "dark",
      items: [
        item("users", "Real engineers", "A team of real engineers solving real engineering problems."),
        item("flame", "Asia's first", "Asia's first deflagration test, developed with GE Renewables India."),
        item("trending", "30+ projects", "More than 30 design and development projects delivered."),
        item("factory", "One plant", "Design, fabrication, painting and testing in a single plant."),
      ],
    },
    cta("Talk to our team", "Tell us about your project and we'll put you in touch with the right engineer.", [btn("Talk to Our Team", "/contact"), btn("Get a Quote", "/get-a-quote", "outlineLight")]),
  ], {
    header: { eyebrow: "About us", heading: "About Patel Container India", intro: "A premier manufacturer of ISO marine shipping containers and specialized containers, with in-house engineering that goes beyond the standard.", image: I.portCranes },
    seo: seo("About Patel Container India | Container Manufacturer", "Learn about Patel Container India, our engineering team, our journey and our vision for complete mobility solutions."),
  });
  page("page-journey", "Our Journey", "about-us/our-journey", [
    {
      _type: "timelineBlock", eyebrow: "Milestones", heading: "How we grew into a multi-product manufacturer",
      items: [
        { _type: "milestone", year: "Founded", title: "Patel Container India is established", text: "The company is founded in Bhavnagar, Gujarat to manufacture containers." },
        { _type: "milestone", year: "Growth", title: "First ISO containers delivered", text: "ISO marine shipping containers roll off our 20 ft and 40 ft boxing lines." },
        { _type: "milestone", year: "Milestone", title: "Deflagration test with GE Renewables", text: "We become the first in Asia to perform the deflagration test, in joint development with GE Renewables India.", image: I.deflag },
        { _type: "milestone", year: "Today", title: "Entering commercial EV", text: "The group launches two electric light commercial vehicles (eLCVs)." },
      ],
    },
    { _type: "statsBlock", background: "dark", stats: [{ _type: "stat", value: 1, suffix: "st", label: "Deflagration test in Asia" }, { _type: "stat", value: 30, suffix: "+", label: "Engineering projects" }, { _type: "stat", value: 6, label: "Product categories" }] },
    cta("See what we build today", "Explore our containers, rail products and EVs.", [btn("See Our Products", "/products"), btn("Contact Us", "/contact", "outlineLight")]),
  ], { parent: ref("page-about"), header: { eyebrow: "About us", heading: "Our Journey", intro: "From container manufacturing to a multi-product mobility group.", image: I.shipCranes }, seo: seo("Our Journey | Patel Container India", "Milestones in the growth of Patel Container India, from ISO containers to Asia's first deflagration test and commercial EVs.") });
  page("page-leadership", "Leadership Team", "about-us/leadership-team", [
    {
      _type: "messageBlock", eyebrow: "Founder's message", heading: "Quality, engineering and our customers",
      message: pt("When we started Patel Container India, we set out to build more than steel boxes. We wanted to build an engineering company: one that understands why a product works, tests it before it ships, and stands behind it in the field.\n\nThat approach led us to perform Asia's first deflagration test with GE Renewables India, and it guides every container, wagon component and vehicle we make today.\n\nOur promise to customers is simple: honest specifications, careful workmanship, and a team of engineers who will solve your problem with you."),
      name: "Founder & Managing Director", role: "Patel Container India Pvt. Ltd.",
    },
    { _type: "teamBlock", eyebrow: "Leadership", heading: "The team behind Patel", background: "light" },
    cta("Want to talk to our leadership?", "We're always happy to discuss long-term partnerships and large projects.", [btn("Contact Us", "/contact"), btn("Careers", "/about-us/careers", "outlineLight")]),
  ], { parent: ref("page-about"), header: { eyebrow: "About us", heading: "Leadership Team", intro: "The people who lead our engineering, manufacturing and customer relationships.", image: I.portAerial }, seo: seo("Leadership Team | Patel Container India", "Meet the leadership team of Patel Container India.") });
  page("page-careers", "Careers", "about-us/careers", [
    {
      _type: "featureGridBlock", eyebrow: "Why work here", heading: "Build things that move the world", columns: 3, variant: "cards",
      items: [
        item("wrench", "Hands-on engineering", "Work on real products from design to dispatch, not just drawings."),
        item("cpu", "Modern machinery", "Laser cutting, CNC plasma, CNC press brakes and advanced welding fixtures."),
        item("trending", "Grow across sectors", "Containers, rail and EV give you room to grow your skills and career."),
      ],
    },
    { _type: "jobsBlock", eyebrow: "Open positions", heading: "Current openings", background: "light" },
    { _type: "formBlock", eyebrow: "How to apply", heading: "Apply now", intro: "Send your CV using the form, or email it to info@patelcontainer.com with the role in the subject line.", formType: "career", sectionId: "apply", showContactDetails: false, background: "white" },
  ], { parent: ref("page-about"), header: { eyebrow: "About us", heading: "Careers", intro: "Join a team of engineers and craftspeople building containers, rail products and EVs.", image: I.laser }, seo: seo("Careers | Patel Container India", "Engineering and manufacturing careers at Patel Container India in Bhavnagar, Gujarat.") });

  /* Products overview */
  page("page-products", "Products", "products", [
    { _type: "productCategoriesBlock", eyebrow: "Categories", heading: "Choose a product category", intro: "From standard ISO boxes to specialized and rail products, Patel builds to international standards with in-house engineering. Choose a category to see specifications and request a quote." },
    {
      _type: "comparisonTableBlock", eyebrow: "Compare sizes", heading: "20 ft vs 40 ft vs High Cube", background: "light",
      columns: ["Product", "Length", "Width", "Height", "Max gross weight", "Max payload"],
      rows: [
        { _type: "row", cells: ["20 ft ISO", "20 ft", "8 ft", "8.6 ft", "30,480 kg", "28,800 kg"], product: ref("p-20-iso") },
        { _type: "row", cells: ["40 ft ISO", "40 ft", "8 ft", "8.6 ft", "32,500 kg", "28,800 kg"], product: ref("p-40-iso") },
        { _type: "row", cells: ["20 ft High Cube", "20 ft", "8 ft", "9.6 ft", "On request", "On request"], product: ref("p-20-hc") },
        { _type: "row", cells: ["40 ft High Cube", "40 ft", "8 ft", "9.6 ft", "32,730 kg", "28,800 kg"], product: ref("p-40-hc") },
      ],
      note: "Nominal values. Custom specifications available on request.",
    },
    { _type: "productsBlock", eyebrow: "All products", heading: "Product range" },
    cta("Not sure which size fits?", "Talk to our team and we'll recommend the right container for your cargo.", quoteBtns),
  ], { header: { eyebrow: "Products", heading: "Containers & Mobility Products", intro: "ISO, High Cube, truck and specialized containers, plus railway products and commercial EVs.", image: I.portAerial, buttons: [btn("Get a Quote", "/get-a-quote")] }, seo: seo("ISO and High Cube Containers | Patel Container India", "Browse 20 ft and 40 ft ISO containers, High Cube containers and truck containers made in Bhavnagar, Gujarat.") });

  /* Capabilities */
  page("page-capabilities", "Capabilities", "capabilities", [
    {
      _type: "linkCardsBlock", eyebrow: "How we build", heading: "Engineering and manufacturing under one roof", intro: "Explore how Patel designs, builds and tests its products.",
      cards: [
        { _type: "linkCard", title: "Manufacturing Facility", text: "Boxing, part processing, painting and leak testing.", image: I.laser, link: link("Explore", "page-cap-facility") },
        { _type: "linkCard", title: "Design & Engineering", text: "In-house CAD/CAE, simulation, DFMEA and PFMEA.", image: I.enclosure, link: link("Explore", "page-cap-design") },
        { _type: "linkCard", title: "Testing & Innovation", text: "Asia's first deflagration test and in-house leak testing.", image: I.deflag, link: link("Explore", "page-cap-testing") },
        { _type: "linkCard", title: "Production Process", text: "Eight stages from drawings to dispatch.", image: I.shipCranes, link: link("Explore", "page-cap-process") },
      ],
    },
    { _type: "statsBlock", background: "dark", stats: [{ _type: "stat", value: 30, suffix: "+", label: "Engineering projects" }, { _type: "stat", value: 40, suffix: " ft", label: "Max container size painted" }, { _type: "stat", value: 1, suffix: "st", label: "Deflagration test in Asia" }, { _type: "stat", value: 8, label: "Production stages, each QC-checked" }] },
    cta("See how we build to your specification", "Book a factory visit or discuss your drawings with our engineers.", quoteBtns),
  ], { header: { eyebrow: "Capabilities", heading: "Our Capabilities", intro: "In-house design, fabrication, painting and testing, including Asia's first deflagration test.", image: I.laser }, seo: seo("Manufacturing and Engineering Capabilities", "In-house design, fabrication, painting and testing, including Asia's first deflagration test.") });
  page("page-cap-facility", "Manufacturing Facility", "capabilities/manufacturing-facility", [
    {
      _type: "splitContentBlock", eyebrow: "Overview", heading: "Every stage of container manufacturing in one place",
      body: pt("Our Bhavnagar plant handles every stage of container manufacturing in one place, from cutting and welding to painting and testing."),
      image: I.laser, badge: kv("Boxing and painting capacity", "40 ft"),
    },
    {
      _type: "statsBlock", eyebrow: "Plant and capacity", heading: "Built for 20 ft and 40 ft production", background: "dark",
      stats: [
        { _type: "stat", value: 2, label: "Container boxing lines (20 ft & 40 ft)" },
        { _type: "stat", value: 40, suffix: " ft", label: "Max container size painted" },
        { _type: "stat", value: 9, suffix: "+", label: "Part-processing machine types" },
        { _type: "stat", value: 100, suffix: "%", label: "Containers leak-tested in-house" },
      ],
    },
    {
      _type: "featureGridBlock", eyebrow: "Workshop stages", heading: "From raw steel to finished container", columns: 4, variant: "cards", background: "light",
      items: [
        item("container", "Container boxing", "40 ft and 20 ft container assembly lines."),
        item("scissors", "Part processing", "Laser and CNC plasma cutting, CNC press brakes, shearing and welding fixtures."),
        item("paint", "Painting", "Shot blasting, primer and paint for containers up to 40 ft."),
        item("droplets", "Leak test", "In-house testing facility for water-tightness."),
      ],
    },
    {
      _type: "featureGridBlock", eyebrow: "Machinery", heading: "Part-processing equipment", columns: 3, variant: "list",
      items: [item("check", "Special purpose machines (SPMs)"), item("check", "Laser cutting"), item("check", "CNC plasma cutting"), item("check", "CNC press brakes"), item("check", "Shearing machines"), item("check", "Manipulators"), item("check", "Advanced welding fixtures"), item("check", "In-house tools for panel corrugations"), item("check", "Semi-automatic welding handlers")],
    },
    { _type: "galleryBlock", eyebrow: "Gallery", heading: "Inside our plant", source: "inline", images: [I.laser, I.enclosure, I.deflag], background: "light" },
    cta("Visit our plant", "Book a factory tour and see our production lines for yourself.", [btn("Book a Factory Tour", "/contact"), btn("Get a Quote", "/get-a-quote", "outlineLight")]),
  ], { parent: ref("page-capabilities"), header: { eyebrow: "Capabilities", heading: "Manufacturing Facility", intro: "Container boxing, part processing, painting and leak testing under one roof in Bhavnagar.", image: I.laser }, seo: seo("Container Manufacturing Facility | Patel Container India", "Our Bhavnagar plant: 20 ft and 40 ft boxing lines, laser and CNC cutting, shot blasting, painting and leak testing.") });
  page("page-cap-design", "Design & Engineering", "capabilities/design-and-engineering", [
    {
      _type: "splitContentBlock", eyebrow: "Engineering firm", heading: "More than a manufacturer",
      body: pt("More than a manufacturer, Patel is an engineering firm of real engineers who tackle real engineering problems. Our team has co-developed products with Fortune 500 companies and delivered more than 30 projects across the full design and development process.\n\nWe have a legacy of transforming client inspirations and aspirations into powerful business results."),
      image: I.enclosure, badge: kv("Projects delivered", "30+"),
    },
    {
      _type: "featureGridBlock", eyebrow: "Our approach", heading: "How we design", columns: 4, variant: "numbered", background: "light",
      items: [item("ruler", "Design principles"), item("lightbulb", "Ideation & creativity"), item("handshake", "Communication & teamwork"), item("target", "Problem solving & user experience")],
    },
    {
      _type: "featureGridBlock", eyebrow: "In-house CAD/CAE", heading: "Complete in-house computer-aided design and engineering", columns: 3, variant: "cards", background: "dark",
      items: [
        item("layers", "3D modelling"), item("ruler", "2D drafting & detailing"), item("cpu", "CNC programming & nesting"),
        item("gauge", "Simulation"), item("clipboard", "DFMEA"), item("clipboard", "PFMEA"),
      ],
    },
    { _type: "projectsBlock", eyebrow: "Sample projects", heading: "Engineering we have delivered", projects: refs(["proj-deflagration", "proj-enclosure", "proj-elcv"]), showFilters: false, background: "light" },
    cta("Discuss your design requirement", "Share your drawings or idea and our engineers will propose a solution.", quoteBtns),
  ], { parent: ref("page-capabilities"), header: { eyebrow: "Capabilities", heading: "Design & Engineering", intro: "A team of real engineers with in-house CAD/CAE, simulation and failure-mode analysis.", image: I.enclosure }, seo: seo("Container Design & Engineering | Patel Container India", "In-house 3D modelling, 2D drafting, CNC nesting, simulation, DFMEA and PFMEA. 30+ engineering projects delivered.") });
  page("page-cap-testing", "Testing & Innovation", "capabilities/testing-and-innovation", [
    {
      _type: "featureGridBlock", eyebrow: "Testing facilities", heading: "We test what we build, and we test beyond the standard", columns: 3, variant: "cards",
      items: [
        item("flame", "Deflagration testing", "Developed with GE Renewables India for enclosure safety."),
        item("droplets", "Leak testing", "In-house facility for water-tightness checks."),
        item("clipboard", "Stage-wise inspection", "Quality checks at every production stage."),
      ],
    },
    {
      _type: "splitContentBlock", eyebrow: "Deflagration test", heading: "First in Asia to perform the deflagration test",
      body: pt("We are the first in Asia to perform the deflagration test, in joint development with GE Renewables, India.\n\nThe test validates how an enclosure behaves when gases inside it ignite, which is critical for energy-storage and power equipment. Our engineers co-developed both the enclosure and the test set-up."),
      image: I.deflag, badge: kv("In Asia", "1st"), buttons: [btn("Read the Case Study", "/projects/deflagration-test-ge-renewables")], background: "light",
    },
    {
      _type: "featureGridBlock", eyebrow: "Other innovations", heading: "Always building what's next", columns: 2, variant: "cards",
      items: [item("zap", "Commercial EV launch", "Two electric light commercial vehicles from the group."), item("lightbulb", "New container designs", "Specialized enclosures and custom builds for energy and industry.")],
    },
    cta("Request test reports", "Ask our team for test documentation for your project.", [btn("Request Test Reports", "/contact"), btn("Get a Quote", "/get-a-quote", "outlineLight")]),
  ], { parent: ref("page-capabilities"), header: { eyebrow: "Capabilities", heading: "Testing & Innovation", intro: "We test what we build, and we test beyond the standard.", image: I.deflag }, seo: seo("Container Testing & Deflagration Test | Patel Container India", "Asia's first deflagration test with GE Renewables India, plus in-house leak testing and stage-wise inspection.") });
  page("page-cap-process", "Production Process", "capabilities/production-process", [
    {
      _type: "processBlock", eyebrow: "Step by step", heading: "From drawings to dispatch", note: "A quality check is done at each stage.",
      steps: [
        { _type: "step", title: "Design and drawings", text: "3D models, 2D drawings and CNC nesting programs prepared in-house.", qualityCheck: "Design review" },
        { _type: "step", title: "Part processing", text: "Cutting, bending and shearing of steel parts.", qualityCheck: "Dimensional check" },
        { _type: "step", title: "Panel fabrication & welding", text: "Corrugated panels formed and welded on fixtures.", qualityCheck: "Weld inspection" },
        { _type: "step", title: "Container boxing", text: "Assembly on 20 ft and 40 ft lines.", qualityCheck: "Squareness & dimensions" },
        { _type: "step", title: "Shot blasting", text: "Surface cleaned for coating.", qualityCheck: "Surface profile" },
        { _type: "step", title: "Primer and paint", text: "Coating for containers up to 40 ft.", qualityCheck: "Coating thickness" },
        { _type: "step", title: "Leak and quality tests", text: "Water-tightness tested in-house.", qualityCheck: "Leak test" },
        { _type: "step", title: "Final inspection & dispatch", text: "Checked against specification before it ships.", qualityCheck: "Final inspection" },
      ],
    },
    cta("See how we build to your specification", "Send your requirement and we'll walk you through the build.", quoteBtns),
  ], { parent: ref("page-capabilities"), header: { eyebrow: "Capabilities", heading: "Production Process", intro: "Eight disciplined stages, with a quality check at every step.", image: I.shipCranes }, seo: seo("Container Production Process | Patel Container India", "How an ISO container is built at Patel: eight production stages from design to final inspection and dispatch.") });

  /* Quality */
  page("page-quality", "Quality & Certifications", "quality", [
    { _type: "splitContentBlock", eyebrow: "Quality policy", heading: "We test before we ship", body: pt("We build every container to meet customer specifications and international standards, and we test before we ship."), image: I.enclosure },
    {
      _type: "featureGridBlock", eyebrow: "Standards followed", heading: "The standards we build to", columns: 3, variant: "list", background: "light",
      items: [
        item("check", "ISO 1496 series", "Freight container specification and testing dimensions."),
        item("check", "Customer specifications", "Project drawings and approved specifications."),
        item("check", "DFMEA & PFMEA", "Design and process failure-mode analysis."),
      ],
    },
    { _type: "certificationsBlock", eyebrow: "Certificates", heading: "Certificates and approvals", intro: "Download certificates where available, or request a copy from our team.", layout: "cards" },
    {
      _type: "processBlock", eyebrow: "Inspection & QA", heading: "Our quality process", background: "light",
      steps: [
        { _type: "step", title: "Incoming material check", text: "Steel and components checked on arrival." },
        { _type: "step", title: "In-process inspection", text: "Inspection at each production stage." },
        { _type: "step", title: "In-house leak test", text: "Water-tightness verified in our facility." },
        { _type: "step", title: "Final inspection", text: "Checked against specification before dispatch." },
      ],
    },
    { _type: "featureGridBlock", eyebrow: "Third-party approvals", heading: "Inspection agencies and customer approvals", intro: "Details of third-party inspection agencies and customer approvals are available on request.", columns: 2, variant: "cards", items: [item("badge", "Inspection agencies", "Third-party inspection can be arranged on request."), item("handshake", "Customer approvals", "Joint development and approvals with partners such as GE Renewables India.")] },
    cta("Request our quality documents", "Ask for certificates, test reports and inspection records.", [btn("Request Documents", "/contact"), btn("Get a Quote", "/get-a-quote", "outlineLight")]),
  ], { header: { eyebrow: "Quality", heading: "Quality & Certifications", intro: "Our quality process, standards and certificates for container manufacturing.", image: I.deflag }, seo: seo("Quality and Certifications | Patel Container India", "Our quality process, standards and certificates for container manufacturing.") });

  /* Industries */
  page("page-industries", "Industries", "industries", [
    { _type: "industriesBlock", eyebrow: "Industries", heading: "Solutions for every industry we serve" },
    cta("Have a specific application?", "Tell us about your industry and requirement.", quoteBtns),
  ], { header: { eyebrow: "Industries / Solutions", heading: "Industries We Serve", intro: "Containers and engineered products for shipping, energy, rail and commercial vehicles.", image: I.portCranes }, seo: seo("Container Solutions by Industry", "Containers and engineered products for shipping, energy, rail and commercial vehicles.") });

  /* Projects & gallery */
  page("page-projects", "Projects", "projects", [
    { _type: "projectsBlock", eyebrow: "Our work", heading: "A selection of containers and engineered products delivered to customers", showFilters: true },
    cta("Have a project in mind?", "Let's engineer it together.", quoteBtns),
  ], { header: { eyebrow: "Projects", heading: "Our Work", intro: "A selection of containers and engineered products delivered to customers.", image: I.shipCranes, buttons: [btn("View Gallery", "/gallery", "outlineLight")] }, seo: seo("Projects and Case Studies | Patel Container India", "See containers and engineered products delivered by Patel Container India.") });
  page("page-gallery", "Gallery", "gallery", [
    { _type: "galleryBlock", source: "albums" },
  ], { header: { eyebrow: "Media", heading: "Gallery", intro: "Photos and videos of our products, plant, machinery, testing and events.", image: I.portAerial }, seo: seo("Gallery | Patel Container India", "Photos and videos of Patel Container India's containers, plant, machinery and testing.") });

  /* Media */
  page("page-media", "Media", "media", [
    {
      _type: "linkCardsBlock", eyebrow: "Media", heading: "News, articles and downloads",
      cards: [
        { _type: "linkCard", title: "News", text: "Company, product and event updates.", image: I.portCranes, link: link("Read news", null, "/news") },
        { _type: "linkCard", title: "Blog", text: "The Container Knowledge Hub.", image: I.portAerial, link: link("Read articles", null, "/blog") },
        { _type: "linkCard", title: "Downloads", text: "Brochure, datasheets and certificates.", image: I.laser, link: link("Downloads", "page-downloads") },
        { _type: "linkCard", title: "Gallery", text: "Photos and videos.", image: I.ship, link: link("View gallery", "page-gallery") },
      ],
    },
    { _type: "postsBlock", eyebrow: "Latest", heading: "Latest from Patel", postType: "all", mode: "latest", background: "light" },
  ], { header: { eyebrow: "Media", heading: "News, Blog & Downloads", intro: "News, articles and brochures from Patel Container India.", image: I.ship }, seo: seo("News, Blog and Downloads", "News, articles and brochures from Patel Container India.") });
  page("page-news", "News", "news", [
    { _type: "postsBlock", postType: "news", mode: "full" },
  ], { parent: ref("page-media"), header: { eyebrow: "Media", heading: "News and Updates", intro: "Company, product, event and award news from Patel Container India.", image: I.portCranes }, seo: seo("News and Updates | Patel Container India", "The latest company, product and event news from Patel Container India.") });
  page("page-blog", "Blog", "blog", [
    { _type: "postsBlock", postType: "blog", mode: "full" },
    { _type: "newsletterBlock", eyebrow: "Newsletter", heading: "Get new articles by email", intro: "Container guides, product news and engineering updates. No spam.", background: "light" },
  ], { parent: ref("page-media"), header: { eyebrow: "Media", heading: "Container Knowledge Hub", intro: "Practical guides on choosing, specifying and using containers.", image: I.portAerial }, seo: seo("Container Knowledge Hub | Patel Container India", "Guides on container sizes, High Cube vs standard, deflagration testing and how ISO containers are built.") });
  page("page-downloads", "Downloads", "media/downloads", [
    { _type: "downloadsBlock" },
    cta("Need a specific document?", "Ask us for datasheets, drawings, certificates or test reports.", [btn("Request a Document", "/contact"), btn("Get a Quote", "/get-a-quote", "outlineLight")]),
  ], { parent: ref("page-media"), header: { eyebrow: "Media", heading: "Downloads", intro: "Company brochure, product datasheets and certificates.", image: I.laser }, seo: seo("Brochures & Downloads | Patel Container India", "Download the Patel Container India brochure, product datasheets and certificates.") });

  /* Contact & quote */
  page("page-contact", "Contact", "contact", [
    {
      _type: "formBlock", eyebrow: "Contact us", heading: "Tell us what you need", intro: "Tell us what you need and we will reply within one working day.",
      formType: "contact", submitLabel: "Send Message", sectionId: "form",
      points: [item("clock", "Reply within one working day"), item("users", "Talk directly to our engineers")],
    },
    { _type: "contactInfoBlock", eyebrow: "Reach us", heading: "Contact details", background: "light", exportNote: "Planning an export order? Share your destination port and quantity and we will quote delivered or ex-works prices." },
  ], { header: { eyebrow: "Contact", heading: "Contact Patel Container India", intro: "Call, WhatsApp or send an enquiry. Our team in Bhavnagar is ready to help.", image: I.portCranes }, seo: seo("Contact Patel Container India | Bhavnagar", "Call (+91) 7046468484 or send an enquiry. Bhadbhid, Bhavnagar, Gujarat 364002.") });
  page("page-quote", "Get a Quote", "get-a-quote", [
    {
      _type: "formBlock", eyebrow: "Request a quote", heading: "Share your requirement", intro: "Share your requirement and get a detailed quote within one working day.",
      formType: "quote", submitLabel: "Request Quote", sectionId: "form",
      points: [item("flame", "Asia's first deflagration test"), item("compass", "In-house design and engineering"), item("droplets", "In-house leak testing"), item("ruler", "Built to ISO standard dimensions")],
    },
    { _type: "badgesBlock", eyebrow: "Why Patel", heading: "Trusted engineering", background: "light", items: [item("flame", "Asia's first deflagration test"), item("compass", "In-house design & engineering"), item("droplets", "In-house leak testing"), item("badge", "ISO 1496 dimensions")] },
  ], { header: { eyebrow: "Get a quote", heading: "Request a Quote", intro: "Tell us your size, quantity and destination and get a detailed quote within one working day." }, seo: seo("Get a Container Quote | Patel Container India", "Tell us your size, quantity and destination and get a quote within one working day.") });
  page("page-thanks", "Thank You", "get-a-quote/thank-you", [
    {
      _type: "linkCardsBlock", eyebrow: "Next steps", heading: "Thank you, we have your request.", intro: "Our team will contact you within one working day. In the meantime:",
      cards: [
        { _type: "linkCard", title: "Download the brochure", text: "Our company and product overview.", image: I.laser, link: link("Downloads", "page-downloads") },
        { _type: "linkCard", title: "Browse products", text: "Specifications for every container.", image: I.portAerial, link: link("Products", "page-products") },
        { _type: "linkCard", title: "See our capabilities", text: "How we design, build and test.", image: I.enclosure, link: link("Capabilities", "page-capabilities") },
        { _type: "linkCard", title: "Read case studies", text: "Projects we've delivered.", image: I.deflag, link: link("Projects", "page-projects") },
      ],
    },
  ], { parent: ref("page-quote"), header: { eyebrow: "Request received", heading: "Thank You" }, seo: seo("Thank You | Patel Container India", "We have your quote request.", { noIndex: true }) });

  page("page-faq", "FAQ", "faq", [
    { _type: "faqBlock" },
    cta("Didn't find your answer?", "Our team is happy to help.", [btn("Contact Us", "/contact"), btn("Chat on WhatsApp", "#whatsapp", "whatsapp")]),
  ], { header: { eyebrow: "FAQ", heading: "Frequently Asked Questions", intro: "Answers on container sizes, weights, ordering, export and quality." }, seo: seo("Container FAQ | Patel Container India", "Answers on container sizes, weights, ordering, export and quality.") });

  /* Legal */
  page("page-privacy", "Privacy Policy", "privacy-policy", [
    {
      _type: "richTextBlock", showToc: true,
      content: pt(`This policy explains how Patel Container India Private Limited ("we", "us") collects and uses personal information through this website.

## What data we collect

- Information you submit through our forms: name, company, phone, email, product interest, quantity, destination, messages and any files you upload.
- Technical data such as browser type, pages visited and cookies used for analytics.

## How we use it

- To respond to your enquiries and prepare quotations.
- To process job applications.
- To send you newsletters if you subscribe (you can unsubscribe at any time).
- To improve our website.

## Who we share it with

We do not sell your data. We share it only with service providers who help us run this website and our business, and where required by law.

## How long we keep it

We keep enquiry and quotation records for as long as needed to serve you and meet legal obligations.

## Your rights and how to contact us

You can ask to access, correct or delete your personal data. Questions about privacy? Write to info@patelcontainer.com.

## Changes to this policy

We may update this policy from time to time. The latest version will always be on this page.`),
    },
  ], { header: { eyebrow: "Legal", heading: "Privacy Policy" }, seo: seo("Privacy Policy | Patel Container India", "How Patel Container India collects, uses and protects your personal data.") });
  page("page-terms", "Terms and Conditions", "terms-and-conditions", [
    {
      _type: "richTextBlock", showToc: true,
      content: pt(`These terms govern your use of the Patel Container India website.

## Use of the website

You may use this website for lawful purposes only. Do not attempt to disrupt or gain unauthorised access to it.

## Product information and pricing

Product descriptions and specifications are for general information and may change without notice. Prices are provided only through formal quotations.

## Quotes and orders

Quotations are valid for the period stated on them. Orders are subject to written confirmation by Patel Container India Private Limited.

## Intellectual property

All content on this website, including text, images, logos and drawings, belongs to Patel Container India Private Limited unless stated otherwise.

## Limitation of liability

We are not liable for any loss arising from the use of information on this website. Contractual terms for products are set out in our quotations and order confirmations.

## Governing law

These terms are governed by the laws of India, and the courts of Bhavnagar, Gujarat have jurisdiction.`),
    },
  ], { header: { eyebrow: "Legal", heading: "Terms and Conditions" }, seo: seo("Terms and Conditions | Patel Container India", "Terms and conditions for using the Patel Container India website.") });

  /* Site settings */
  const mapQ = (q) => `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=13&output=embed`;
  const dirQ = (q) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
  add({
    _id: "siteSettings", _type: "siteSettings",
    siteName: "Patel Container India", legalName: "Patel Container India Private Limited",
    tagline: "Heart of Perfect Joint",
    phones: ["+91 70464 68484", "+91 94281 81618"],
    email: "info@patelcontainer.com",
    whatsappNumber: "917046468484",
    whatsappMessage: "Hi, I am interested in your containers. Please share details and pricing.",
    addresses: [
      { _type: "address", label: "Bhadbhid unit", address: "Patel Container India Pvt. Ltd.\nBhadbhid, Bhavnagar,\nGujarat 364002, India", mapEmbedUrl: mapQ("Bhadbhid, Bhavnagar, Gujarat 364002"), directionsUrl: dirQ("Bhadbhid, Bhavnagar, Gujarat 364002") },
      { _type: "address", label: "Sanes unit", address: "Sanes, Bhavnagar,\nGujarat 364002, India", directionsUrl: dirQ("Sanes, Bhavnagar, Gujarat") },
    ],
    businessHours: "Monday – Saturday",
    responseTime: "one working day",
    announcement: "ISO shipping containers · Specialized containers · Railway & EV — engineered in Bhavnagar, Gujarat",
    mainNav: [
      { _type: "navItem", label: "Home", internal: ref("page-home") },
      { _type: "navItem", label: "About Us", internal: ref("page-about"), children: [
        { _type: "navChild", label: "Company Profile", description: "Vision, mission and group", internal: ref("page-about") },
        { _type: "navChild", label: "Our Journey", description: "Milestones and achievements", internal: ref("page-journey") },
        { _type: "navChild", label: "Leadership Team", description: "The people behind Patel", internal: ref("page-leadership") },
        { _type: "navChild", label: "Careers", description: "Join our engineering team", internal: ref("page-careers") },
      ] },
      { _type: "navItem", label: "Products", internal: ref("page-products"), children: cats.map(([id, title, , , short]) => ({ _type: "navChild", label: title, description: short, internal: ref(id) })) },
      { _type: "navItem", label: "Capabilities", internal: ref("page-capabilities"), children: [
        { _type: "navChild", label: "Manufacturing Facility", description: "Boxing, processing, painting, testing", internal: ref("page-cap-facility") },
        { _type: "navChild", label: "Design & Engineering", description: "In-house CAD/CAE and simulation", internal: ref("page-cap-design") },
        { _type: "navChild", label: "Testing & Innovation", description: "Asia's first deflagration test", internal: ref("page-cap-testing") },
        { _type: "navChild", label: "Production Process", description: "Eight QC-checked stages", internal: ref("page-cap-process") },
      ] },
      { _type: "navItem", label: "Quality", internal: ref("page-quality") },
      { _type: "navItem", label: "Industries", internal: ref("page-industries"), children: industries.map(([id, title, , , , short]) => ({ _type: "navChild", label: title, description: short, internal: ref(id) })) },
      { _type: "navItem", label: "Projects", internal: ref("page-projects"), children: [
        { _type: "navChild", label: "Projects & Case Studies", internal: ref("page-projects") },
        { _type: "navChild", label: "Gallery", internal: ref("page-gallery") },
      ] },
      { _type: "navItem", label: "Media", internal: ref("page-media"), children: [
        { _type: "navChild", label: "News", internal: ref("page-news") },
        { _type: "navChild", label: "Blog", internal: ref("page-blog") },
        { _type: "navChild", label: "Brochures & Downloads", internal: ref("page-downloads") },
      ] },
      { _type: "navItem", label: "Contact", internal: ref("page-contact") },
    ],
    headerCta: btn("Get a Quote", null, "primary", "page-quote"),
    footerText: "Engineered containers and mobility solutions, built in Bhavnagar, Gujarat.",
    footerColumns: [
      { _type: "footerColumn", title: "Quick links", links: [link("Home", "page-home"), link("About Us", "page-about"), link("Products", "page-products"), link("Capabilities", "page-capabilities"), link("Quality", "page-quality"), link("Contact", "page-contact"), link("FAQ", "page-faq")] },
      { _type: "footerColumn", title: "Company", links: [link("Industries", "page-industries"), link("Projects", "page-projects"), link("Gallery", "page-gallery"), link("News", "page-news"), link("Blog", "page-blog"), link("Careers", "page-careers"), link("Get a Quote", "page-quote")] },
    ],
    legalLinks: [link("Privacy Policy", "page-privacy"), link("Terms and Conditions", "page-terms"), link("Sitemap", null, "/site-map")],
    newsletterHeading: "Get new articles by email",
    newsletterText: "Container guides, product news and engineering updates. No spam.",
    copyright: "© {year} Patel Container India Private Limited. All rights reserved.",
    titleTemplate: "%s | Patel Container India",
    templates: { _type: "object", ...templateDefaults() },
    defaultSeo: seo("ISO Container Manufacturer in Bhavnagar | Patel Container India", "Patel Container India makes ISO shipping containers, specialized containers and mobility products in Bhavnagar, Gujarat. Get a quote today.", { keywords: ["ISO container manufacturer", "shipping container manufacturer India", "High Cube container", "container manufacturer Gujarat", "Bhavnagar container"] }),
  });

  /* Redirects from the old site */
  [
    ["/20 ft ISO Container.html", "/products/20-ft-iso-container"],
    ["/40 ft ISO Container.html", "/products/40-ft-iso-container"],
    ["/20 Feet High Cube Container.html", "/products/20-ft-high-cube-container"],
    ["/40 Feet High Cube Container.html", "/products/40-ft-high-cube-container"],
    ["/Truck Container.html", "/products/truck-container"],
  ].forEach(([source, destination], i) => add({ _id: `redirect-${i + 1}`, _type: "redirect", source, destination, permanent: true }));

  /* Write */
  console.log(`Writing ${docs.length} documents…`);
  let tx = client.transaction();
  docs.forEach((d) => (tx = tx.createOrReplace(d)));
  await tx.commit({ visibility: "async" });
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
