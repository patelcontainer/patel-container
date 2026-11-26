import { redirect } from "next/navigation";
import { CmsPage, cmsPageMetadata } from "@/components/CmsPage";
import { getSettings } from "@/lib/seo";

export const generateMetadata = () => cmsPageMetadata("news");

export default async function Page() {
  if (!(await getSettings()).showNews) redirect("/blog");
  return <CmsPage slug="news" />;
}
