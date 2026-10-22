"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded border border-border px-2.5 py-1.5 text-[11px] uppercase tracking-wider text-muted transition-colors hover:border-gold hover:text-gold sm:px-3 sm:text-xs sm:tracking-widest"
    >
      Sign Out
    </button>
  );
}
