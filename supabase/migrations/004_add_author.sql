-- ============================================================================
-- Adds an optional author name field to posts (useful since login is
-- sometimes shared between band members). Run in the Supabase SQL Editor.
-- ============================================================================

alter table public.posts add column if not exists author text;
