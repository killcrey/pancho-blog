-- ============================================================================
-- Replaces the single cover_image field with up to-3 images shown as a
-- carousel above the post text. Run this in the Supabase SQL Editor.
-- Safe to run even if the column already exists. The old cover_image
-- column is left in place (unused) rather than dropped, so no data is lost.
-- ============================================================================

alter table public.posts add column if not exists images text[] not null default '{}';
