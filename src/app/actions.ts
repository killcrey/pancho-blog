"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function revalidatePublicPages() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  revalidatePath("/");
  revalidatePath("/posts/[slug]", "page");
  revalidatePath("/sitemap.xml");
}
