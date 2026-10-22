import type { ComponentType } from "react";
import { Hero } from "./Hero";
import { SplitContent } from "./SplitContent";
import { FeatureGrid } from "./FeatureGrid";
import { Stats } from "./Stats";
import { ProductCategories, Products, ComparisonTable, Certifications, Clients } from "./CatalogBlocks";
import {
  ProjectsBlock, PostsBlock, FaqBlock, FormBlock, CtaBlock, TimelineBlock, TeamBlock, MessageBlock, ProcessBlock, LinkCardsBlock, BadgesBlock, NewsletterBlock,
} from "./MiscBlocks";
import { GalleryBlock, RichTextBlock, DownloadsBlock, JobsBlock, IndustriesBlock, ContactInfoBlock } from "./InfoBlocks";
import type { Block } from "@/lib/types";

const BLOCKS: Record<string, ComponentType<{ block: Block }>> = {
  heroBlock: Hero,
  splitContentBlock: SplitContent,
  featureGridBlock: FeatureGrid,
  statsBlock: Stats,
  productCategoriesBlock: ProductCategories,
  productsBlock: Products,
  comparisonTableBlock: ComparisonTable,
  certificationsBlock: Certifications,
  clientsBlock: Clients,
  projectsBlock: ProjectsBlock,
  postsBlock: PostsBlock,
  faqBlock: FaqBlock,
  formBlock: FormBlock,
  ctaBlock: CtaBlock,
  timelineBlock: TimelineBlock,
  teamBlock: TeamBlock,
  messageBlock: MessageBlock,
  processBlock: ProcessBlock,
  galleryBlock: GalleryBlock,
  richTextBlock: RichTextBlock,
  downloadsBlock: DownloadsBlock,
  jobsBlock: JobsBlock,
  industriesBlock: IndustriesBlock,
  contactInfoBlock: ContactInfoBlock,
  linkCardsBlock: LinkCardsBlock,
  badgesBlock: BadgesBlock,
  newsletterBlock: NewsletterBlock,
};

export function PageBuilder({ blocks }: { blocks?: Block[] | null }) {
  if (!blocks?.length) return null;
  return (
    <>
      {blocks.map((b) => {
        const C = BLOCKS[b._type];
        if (!C) {
          if (process.env.NODE_ENV === "development") console.warn(`[PageBuilder] no component for "${b._type}"`);
          return null;
        }
        return <C key={b._key} block={b} />;
      })}
    </>
  );
}
