import { CmsPage, cmsPageMetadata } from "@/components/CmsPage";

export const generateMetadata = () => cmsPageMetadata("products");

export default function Page() {
  return <CmsPage slug="products" />;
}
