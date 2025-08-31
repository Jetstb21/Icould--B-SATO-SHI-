/*
  # Add published and slug columns to profiles table

  1. Changes
    - Add `published` column to `profiles` table (boolean, default false)
    - Add `slug` column to `profiles` table (text, unique)
    - No security changes needed (inherits existing RLS policies)

  2. New Columns
    - `published` - Controls whether profile is publicly visible
    - `slug` - Unique identifier for SEO-friendly URLs
*/

DO $$
BEGIN
  -- Add published column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'published'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN published boolean DEFAULT false;
  END IF;

  -- Add slug column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN slug text UNIQUE;
  END IF;
END $$;