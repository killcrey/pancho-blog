import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only /admin needs an auth check on every request — public pages
  // (home, posts, sitemap, etc.) shouldn't pay for a Supabase round-trip
  // they never use.
  matcher: ["/admin/:path*"],
};
