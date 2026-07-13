-- ============================================
-- DubLK Migration: Add Server URLs + Free Trial
-- Run this in Supabase SQL Editor
-- ============================================

-- Add server URLs for Google Drive and future Server 2
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS server1_url TEXT;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS server2_url TEXT;

-- Add free trial tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS free_trial_started_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS free_trial_expires_at TIMESTAMPTZ;
