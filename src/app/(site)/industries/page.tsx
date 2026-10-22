import { CmsPage, cmsPageMetadata } from "@/components/CmsPage";

export const generateMetadata = () => cmsPageMetadata("industries");

export default function Page() {
  return <CmsPage slug="industries" />;
}
