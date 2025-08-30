/*
  # Add note column to profiles table

  1. Changes
    - Add `note` column to `profiles` table (text type)
    - Column allows null values for existing records
    - No security changes needed (inherits existing RLS policies)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'note'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN note text;
  END IF;
END $$;