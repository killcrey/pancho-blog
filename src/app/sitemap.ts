import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://blog.theinvisiblepanchos.com";

  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("slug, created_at")
    .eq("is_published", true);

  const postEntries: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${siteUrl}/posts/${post.slug}`,
    lastModified: post.created_at,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
    },
    ...postEntries,
  ];
}
