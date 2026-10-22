import { createClient } from "@supabase/supabase-js";

// Cookie-less anon client for public reads. Using the cookie-aware server
// client forces every route that touches it to render dynamically.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
