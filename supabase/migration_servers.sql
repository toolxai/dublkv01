-- ============================================================
-- Migration: Add free_servers and vip_servers columns to movies
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add free_servers column: array of {url, label, enabled}
ALTER TABLE public.movies
  ADD COLUMN IF NOT EXISTS free_servers JSONB DEFAULT '[]'::jsonb;

-- Add vip_servers column: array of {url, label, enabled}
ALTER TABLE public.movies
  ADD COLUMN IF NOT EXISTS vip_servers JSONB DEFAULT '[]'::jsonb;

-- Migrate existing server1_url / server2_url into free_servers
-- (run only if those columns exist and have data you want to preserve)
UPDATE public.movies
SET free_servers = (
  CASE
    WHEN server1_url IS NOT NULL AND server2_url IS NOT NULL THEN
      jsonb_build_array(
        jsonb_build_object('url', server1_url, 'label', 'Server 1', 'enabled', true),
        jsonb_build_object('url', server2_url, 'label', 'Server 2', 'enabled', true)
      )
    WHEN server1_url IS NOT NULL THEN
      jsonb_build_array(
        jsonb_build_object('url', server1_url, 'label', 'Server 1', 'enabled', true)
      )
    WHEN server2_url IS NOT NULL THEN
      jsonb_build_array(
        jsonb_build_object('url', server2_url, 'label', 'Server 1', 'enabled', true)
      )
    ELSE '[]'::jsonb
  END
)
WHERE free_servers = '[]'::jsonb;
