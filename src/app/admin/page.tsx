import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/AdminHeader";
import { SignOutButton } from "@/components/SignOutButton";
import { DeletePostButton } from "@/components/DeletePostButton";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader title="Mission Command" subtitle={user.email}>
        <Link
          href="/admin/new"
          className="rounded border border-gold bg-gold/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-black"
        >
          + New Post
        </Link>
        <SignOutButton />
      </AdminHeader>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        {!posts || posts.length === 0 ? (
          <p className="py-24 text-center text-sm uppercase tracking-widest text-muted">
            No posts yet. Create your first transmission.
          </p>
        ) : (
          <div className="panel divide-y divide-border overflow-hidden rounded-lg">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between gap-4 px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-fg">
                    {post.title}
                  </p>
                  <p className="text-xs uppercase tracking-widest text-muted">
                    {post.is_published ? (
                      <span className="text-gold">Published</span>
                    ) : (
                      <span>Draft</span>
                    )}
                    {" · "}
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  {post.is_published && (
                    <Link
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      className="text-xs uppercase tracking-widest text-muted hover:text-gold"
                    >
                      View
                    </Link>
                  )}
                  <Link
                    href={`/admin/edit/${post.id}`}
                    className="text-xs uppercase tracking-widest text-muted hover:text-gold"
                  >
                    Edit
                  </Link>
                  <DeletePostButton postId={post.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
