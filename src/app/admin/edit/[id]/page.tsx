import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/AdminHeader";
import { PostForm } from "@/components/PostForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader title="Edit Transmission" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <PostForm userId={user.id} initialPost={post} />
      </main>
    </div>
  );
}
