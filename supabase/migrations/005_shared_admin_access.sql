-- ============================================================================
-- Logins are sometimes shared between band members, and each person may
-- have their own Supabase auth account. Any authenticated user should be
-- able to see, edit, and delete ALL posts in the admin dashboard, not just
-- the ones created under their own login. Run in the Supabase SQL Editor.
-- ============================================================================

drop policy if exists "Authors can read their own posts" on public.posts;
drop policy if exists "Authenticated users can update their own posts" on public.posts;
drop policy if exists "Authenticated users can delete their own posts" on public.posts;

create policy "Authenticated users can read all posts"
on public.posts
for select
to authenticated
using (true);

create policy "Authenticated users can update any post"
on public.posts
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete any post"
on public.posts
for delete
to authenticated
using (true);
