"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Admin hub hand-off: the main site's /admin hub sends people here as
// /auth/handoff#hub=<base64url JSON {a: access_token, r: refresh_token}>.
// The fragment never reaches a server; it is cleared right away and the
// session is stored in the same cookies the normal login page uses.
export default function HandoffPage() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    async function run() {
      const hash = window.location.hash;
      history.replaceState(null, "", window.location.pathname);
      if (!hash.startsWith("#hub=")) return router.replace("/login");

      try {
        const b64 = hash.slice(5).replace(/-/g, "+").replace(/_/g, "/");
        const { a, r } = JSON.parse(
          atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4)),
        );
        const supabase = createClient();
        const { error } = await supabase.auth.setSession({
          access_token: a,
          refresh_token: r,
        });
        if (error) throw error;
        router.replace("/admin");
        router.refresh();
      } catch {
        setFailed(true);
        router.replace("/login");
      }
    }
    run();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-4">
      <p className="text-sm uppercase tracking-widest text-muted">
        {failed ? "Hand-off failed — use the login page." : "Signing you in…"}
      </p>
    </main>
  );
}
