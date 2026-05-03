-- Add content_html column to posts table for TipTap rich-text editor output.
-- This is a non-destructive additive migration — existing rows are unaffected.
-- Legacy posts (content_html IS NULL) continue to render via the Markdown fallback path.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS content_html TEXT;
