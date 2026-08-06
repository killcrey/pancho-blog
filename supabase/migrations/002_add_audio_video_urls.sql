-- ============================================================================
-- Adds dedicated audio and video fields to posts.
-- Run this in the Supabase SQL Editor (safe to run even if columns already exist).
-- ============================================================================

alter table public.posts add column if not exists audio_url text;
alter table public.posts add column if not exists video_url text;
