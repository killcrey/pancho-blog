import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import type { Post } from "@/lib/types";

export const revalidate = 60;

async function getPublishedPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (data ?? []).map((post) => ({ ...post, images: post.images ?? [] }));
}

export default async function Home() {
  const posts = await getPublishedPosts();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        {posts.length === 0 ? (
          <p className="py-24 text-center text-sm uppercase tracking-widest text-muted">
            No transmissions yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="panel group flex flex-col overflow-hidden rounded-lg transition-transform hover:-translate-y-1"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-panel-2">
                  {post.images[0] ? (
                    <Image
                      src={post.images[0]}
                      alt={post.title}
                      fill
                      className="object-cover transition-opacity group-hover:opacity-80"
                      sizes="(max-width: 767px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-[10px] uppercase tracking-widest text-muted">
                      No Signal
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <time
                    dateTime={post.created_at}
                    className="text-[10px] uppercase tracking-widest text-gold"
                  >
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <h2 className="text-sm font-semibold leading-snug text-fg group-hover:text-gold transition-colors">
                    {post.title}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
