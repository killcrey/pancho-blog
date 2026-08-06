import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/AdminHeader";
import { PostForm } from "@/components/PostForm";

export default async function NewPostPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader title="New Transmission" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <PostForm userId={user.id} />
      </main>
    </div>
  );
}
