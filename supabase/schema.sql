-- ============================================================================
-- The Invisible Panchos Blog — Database, RLS, and Storage setup
-- Run this entire script once in the Supabase SQL Editor
-- (Project: https://israuybvncwceapdpdza.supabase.co)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. POSTS TABLE
-- ----------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  images text[] not null default '{}',
  audio_url text,
  video_url text,
  author text,
  user_id uuid not null references auth.users (id) on delete cascade,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists posts_slug_idx on public.posts (slug);
create index if not exists posts_is_published_idx on public.posts (is_published);

-- ----------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY — posts
-- ----------------------------------------------------------------------------
alter table public.posts enable row level security;

-- Anyone (including anonymous visitors) can read published posts
create policy "Public can read published posts"
on public.posts
for select
to anon, authenticated
using (is_published = true);

-- Authenticated users can also read their own drafts (needed for the admin dashboard)
create policy "Authors can read their own posts"
on public.posts
for select
to authenticated
using (auth.uid() = user_id);

-- Only authenticated users can create posts, and only as themselves
create policy "Authenticated users can insert their own posts"
on public.posts
for insert
to authenticated
with check (auth.uid() = user_id);

-- Only authenticated users can update their own posts
create policy "Authenticated users can update their own posts"
on public.posts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Only authenticated users can delete their own posts
create policy "Authenticated users can delete their own posts"
on public.posts
for delete
to authenticated
using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. STORAGE — public "blog-media" bucket
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true)
on conflict (id) do nothing;

-- Anyone can view/download files in blog-media (public bucket)
create policy "Public can view blog-media files"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'blog-media');

-- Only authenticated users can upload files
create policy "Authenticated users can upload to blog-media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'blog-media');

-- Only authenticated users can update their own uploaded files
create policy "Authenticated users can update their blog-media files"
on storage.objects
for update
to authenticated
using (bucket_id = 'blog-media' and owner = auth.uid())
with check (bucket_id = 'blog-media' and owner = auth.uid());

-- Only authenticated users can delete files
create policy "Authenticated users can delete blog-media files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'blog-media');
