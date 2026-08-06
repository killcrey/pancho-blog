import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { ImageCarousel } from "@/components/ImageCarousel";
import { getVideoEmbedUrl } from "@/lib/embed";
import { sanitizePostContent } from "@/lib/sanitize";
import type { Post } from "@/lib/types";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  return data ? { ...data, images: data.images ?? [], author: data.author ?? null } : null;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Transmission Not Found" };
  }

  const description = post.content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 160)
    .trim();

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `/posts/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.created_at,
      images: [{ url: post.images[0] || "/panchosspacelogo.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [post.images[0] || "/panchosspacelogo.png"],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const videoEmbedUrl = post.video_url ? getVideoEmbedUrl(post.video_url) : null;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <article className="panel rounded-lg p-6 sm:p-10">
          <header className="mb-8">
            <time
              dateTime={post.created_at}
              className="text-xs uppercase tracking-widest text-gold"
            >
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <h1 className="text-glow mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
              {post.title}
            </h1>
            {post.author && (
              <p className="mt-1 text-xs uppercase tracking-widest text-muted">
                by {post.author}
              </p>
            )}
          </header>

          <div className="mb-8 space-y-4">
            {post.images.length > 0 && (
              <ImageCarousel images={post.images} alt={post.title} />
            )}

            {videoEmbedUrl && (
              <div className="media-video-wrap">
                <iframe
                  src={videoEmbedUrl}
                  title={post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}

            {post.audio_url && (
              <audio controls src={post.audio_url} className="w-full" />
            )}
          </div>

          <div
            className="prose-panchos"
            dangerouslySetInnerHTML={{
              __html: sanitizePostContent(post.content),
            }}
          />
        </article>
      </main>
    </div>
  );
}
