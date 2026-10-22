import { PostPage, postMetadata, postStaticParams } from "@/components/PostPage";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => postStaticParams("news");

export async function generateMetadata({ params }: Props) {
  return postMetadata((await params).slug, "news");
}

export default async function Page({ params }: Props) {
  return <PostPage slug={(await params).slug} postType="news" />;
}
