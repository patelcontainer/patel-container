import { CmsPage, cmsPageMetadata } from "@/components/CmsPage";

export const generateMetadata = () => cmsPageMetadata("news");

export default function Page() {
  return <CmsPage slug="news" />;
}
