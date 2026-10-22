import { CmsPage, cmsPageMetadata } from "@/components/CmsPage";

export const generateMetadata = () => cmsPageMetadata("home");

export default function HomePage() {
  return <CmsPage slug="home" />;
}
