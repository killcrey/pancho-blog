-- Deleting an Auth user must not delete their posts (2026-10-22 incident:
-- on delete cascade wiped every post when the original logins were removed).
-- Already run in the Supabase SQL Editor on 2026-10-22.

alter table public.posts drop constraint posts_user_id_fkey;
alter table public.posts alter column user_id drop not null;
alter table public.posts add constraint posts_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete set null;
