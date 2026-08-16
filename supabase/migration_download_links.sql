-- ============================================================
-- Migration: Add download_links column to movies table
-- Run this in Supabase SQL Editor
-- ============================================================

ALTER TABLE public.movies
  ADD COLUMN IF NOT EXISTS download_links JSONB DEFAULT '[]'::jsonb;
