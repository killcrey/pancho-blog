# CLAUDE.md

## Project Overview
Official blog for The Invisible Panchos (KILLcRey & Gene Flo, underground Chicano/boom-bap hip-hop, San Diego). Public read-only blog + password-protected admin dashboard for creating/editing/publishing posts. Single shared Supabase project; no test suite.

## Tech Stack & Architecture
- **Framework**: Next.js 16.3.0, App Router, React 19.2.8, TypeScript. `src/` layout. Turbopack (default for `next dev`/`build`).
- **Runtime note**: Next 16 renamed `middleware.ts` → `src/proxy.ts` (`export async function proxy(...)`, not `middleware`). Do not recreate `middleware.ts`.
- **Backend**: Supabase — Postgres (RLS-locked `posts` table) + Auth (email/password only, no signup UI) + Storage (`blog-media` public bucket).
- **Styling**: Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`). Theme tokens defined in `src/app/globals.css` via `:root` + `@theme inline`. Font: Rajdhani (`next/font/google`).
- **Content editor**: Native `contentEditable` + `document.execCommand` (Bold/Italic/Underline/List/Link) — **not** Markdown, **not** a rich-text library. Output is raw HTML stored in `posts.content`.
- **Sanitization**: `sanitize-html` (pure JS, no DOM). **Do not use `isomorphic-dompurify`/`dompurify`/anything jsdom-based** — it renders fine locally and 500s on Netlify's serverless functions (jsdom's dynamic requires don't survive function bundling). This already broke production once; see Known Quirks.
- **Hosting**: Netlify, auto-deploy from `main`. `@netlify/plugin-nextjs`.

## Directory Structure
```
src/
  app/
    page.tsx                    home — published posts grid, 4-col @md, 2-col mobile
    layout.tsx                  root metadata, site-wide Blog+MusicGroup JSON-LD
    globals.css                 all design tokens + custom CSS (no separate config file)
    robots.ts / sitemap.ts      generated routes
    icon.png                    favicon (Next file convention — do not re-add favicon.ico)
    login/page.tsx               email/password sign-in (client)
    posts/[slug]/page.tsx        public post detail — carousel, video, audio, sanitized content, BlogPosting JSON-LD
    admin/page.tsx                dashboard: lists ALL posts (not scoped to current login), New/Edit/Delete/Sign out
    admin/new/page.tsx            create post (renders PostForm)
    admin/edit/[id]/page.tsx      edit post (renders PostForm with initialPost)
    auth/callback/route.ts        OAuth/magic-link code exchange (unused by current email/password flow, kept for future)
  components/
    PostForm.tsx                 the editor — title/slug/author, up to 5 images, audio, video link, contentEditable body
    ImageCarousel.tsx             post-page image carousel + click-to-open lightbox
    SiteHeader.tsx / AdminHeader.tsx   public vs admin nav (admin header has a "Blog" link back to "/")
    SignOutButton.tsx / DeletePostButton.tsx
  lib/
    supabase/client.ts            browser client
    supabase/server.ts            server component client (cookies via next/headers)
    supabase/middleware.ts        updateSession() — used only by proxy.ts
    sanitize.ts                   sanitizePostContent() — sanitize-html, forces target=_blank on links
    embed.ts                      getVideoEmbedUrl() — YouTube/Vimeo watch-URL → embeddable iframe src
    types.ts                      Post type (source of truth for posts row shape)
  proxy.ts                        matcher: ["/admin/:path*"] ONLY — do not widen this (see Known Quirks)
supabase/
  schema.sql                      canonical schema for a FRESH install (table + RLS + storage bucket)
  migrations/00N_*.sql             incremental ALTERs for the already-provisioned prod DB — schema.sql is not re-run against it
public/
  background-image.jpg (570KB, compressed) / panchosspacelogo.png (262KB, compressed)  — do not reintroduce multi-MB originals
```

## Core Commands
```bash
npm install
npm run dev              # localhost:3000, Turbopack
npm run build             # required before trusting any "it works" claim — dev server here gets stuck serving stale output after file edits; kill and restart if verifying against it, or use build+start on a scratch port instead
npm run start
npm run lint
```
No test command. No `tailwind.config.js` — theme edits go in `globals.css`.

## Coding Standards & Conventions
- **Naming**: kebab-case dirs/routes, PascalCase components, camelCase functions/vars, snake_case DB columns.
- **State**: no global state lib. Local `useState`/`useEffect` per component. Forms are uncontrolled where it matters (`contentEditable` body synced to state only on `input`/`blur`, never re-driven by React render, to avoid cursor jumps).
- **Data fetching**: server components query Supabase directly (`await createClient()` from `lib/supabase/server`). Client mutations (`PostForm`, `DeletePostButton`, `SignOutButton`) use `lib/supabase/client` + `router.refresh()`. No API route layer for CRUD.
- **Auth model**: RLS is **not** per-user. Any authenticated user can read/update/delete **any** post — logins are shared/rotated between band members by design. Don't reintroduce `auth.uid() = user_id` scoping on admin queries or policies.
- **Media model**: posts have `images text[]` (max 5, enforced client-side via `MAX_IMAGES` in `PostForm.tsx`, ≥1 required), `audio_url text`, `video_url text` — all optional except images. These render as a fixed block *above* the content body (carousel → video → audio → text), never inline in content. Content itself never contains media markup — no Markdown image syntax, no raw `<img>`/`<iframe>` typed by the admin.
- **Images**: any new large static asset goes through `sharp` (resize + recompress) before landing in `public/` — see git history for the compression pass.

## Deployment Protocol
- Netlify auto-deploys `main`. Build = `npm run build`, publish = `.next`, `@netlify/plugin-nextjs` required (already in `netlify.toml` + devDependencies).
- Env vars (Netlify dashboard, not committed): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` (set to `https://blog.theinvisiblepanchos.com`, used for canonical/OG/sitemap).
- DNS: `blog.theinvisiblepanchos.com` → CNAME → `panchos-blog.netlify.app` (IONOS).
- Supabase project is **not** managed via CLI/migrations-as-code in CI — every `supabase/migrations/*.sql` file must be run manually in the Supabase SQL Editor against prod. Adding a migration file to the repo does not apply it.
- **Push rule**: commit locally; never push to `origin/main` without the user's explicit "CONFIRM PUSH" (user's global rule — an earlier version of this line claiming standing push permission was wrong).

## Known Quirks & Critical Context
- **The isomorphic-dompurify incident**: original sanitizer choice worked in local prod builds, 500'd on every post page in Netlify's deployed functions. Root cause: jsdom dependency doesn't survive serverless bundling reliably. Fixed by switching to `sanitize-html`. Any future "works locally, 500s on Netlify" bug involving an npm package is a bundling-in-serverless suspect first.
- **Public pages must stay statically cached (2026-10-22)**: home, `/posts/[slug]`, and the sitemap read via `createPublicClient()` (`lib/supabase/public.ts`, cookie-less anon client) — never `lib/supabase/server.ts`, whose `cookies()` call forces dynamic rendering and put every visit through a cold-starting Netlify function (measured 0.8–1.9s TTFB, `Cache-Control: no-store`). Post pages use `generateStaticParams` + `revalidate = 60`; admin saves/deletes call the `revalidatePublicPages` server action (`app/actions.ts`, auth-gated) so changes show immediately. After any change to these routes, `npm run build` must still list `/` and `/posts/[slug]` as `○`/`●`, not `ƒ`.
- **Deleting an Auth user deletes their posts (2026-10-22 incident)**: `posts.user_id` is `references auth.users (id) on delete cascade`. The two original admin logins were deleted in Supabase Authentication and a new one (`theinvisiblepanchos@gmail.com`) was created, which cascade-deleted all 34 posts (admin and public both empty; `blog-media` photos untouched). Recovered by parsing the 34 prerendered `.next/server/app/posts/*.html` + `.rsc` files from the 08:46 local build (title/date/author from HTML, `images` array from the `.rsc` props, content from `div.prose-panchos`, video from the iframe src) and inserting them via the service-role REST API under the new user. **Unpublished drafts were not recoverable** (never prerendered). **Never delete users in Authentication → Users** until the user_id FK is changed to `on delete set null`: `alter table public.posts drop constraint posts_user_id_fkey; alter table public.posts alter column user_id drop not null; alter table public.posts add constraint posts_user_id_fkey foreign key (user_id) references auth.users (id) on delete set null;` (status: recommended to the user, not yet confirmed run — check before assuming; if run, add it to `schema.sql` + a migration file). A local `.next` build or Netlify's previous deploy is the fallback copy of published posts; the service-role key was pasted in chat for this and should be rotated by the user.
- **proxy.ts matcher was the site's biggest perf bug**: it originally matched almost every route, so a Supabase auth round-trip ran before *every* page render, including anonymous visitors on the homepage. Now scoped to `/admin/:path*` only. Do not widen the matcher without a specific reason — public pages must not pay for an auth check.
- **Local dev server gets stuck**: `npm run dev` on this machine repeatedly serves stale output after edits (confirmed via diffed `curl` output vs. source). When verifying a fix and the dev server disagrees with a fresh `npm run build && npm run start` on a scratch port, trust the fresh build.
- **Shared/rotating logins**: the admin dashboard intentionally shows all posts regardless of which Supabase auth account created them (see RLS note above). The `author` field is a free-text display label, not tied to `auth.uid()` — don't conflate the two.
- **No image domain allowlisting beyond Supabase Storage**: `next.config.ts` only allows `next/image` optimization for `israuybvncwceapdpdza.supabase.co`. Pasted external image URLs work in `<img>` (carousel, cover previews) but will break if ever passed through `next/image`.
- **Cover image is gone as a concept**: replaced entirely by the `images[]` carousel. Don't resurrect a single `cover_image` field.

## AI Interaction Directives
- Never rewrite an entire file for a small change — targeted edits only.
- Always run `npm run build` (and `npm run lint`) after a change before claiming it works. The local dev server is not sufficient evidence (see Known Quirks) — if verification matters, build + `next start` on a scratch port and `curl`/browser-check the actual output.
- Every schema change needs a new `supabase/migrations/00N_*.sql` file AND the corresponding table definition in `schema.sql` updated for fresh installs. Tell the user explicitly to run the migration in the Supabase SQL Editor — it does not happen automatically.
- No filler, no apologies, no restating the request before acting.
- No speculative refactors or "while I'm here" cleanup outside the requested scope.
- Treat this file as authoritative; update it when a decision here becomes stale rather than silently diverging.
