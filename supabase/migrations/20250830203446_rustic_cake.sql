/*
  # Create profiles table for public skill comparisons

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `name` (text, display name)
      - `cryptography` (int, 0-10 skill rating)
      - `distributedSystems` (int, 0-10 skill rating)
      - `economics` (int, 0-10 skill rating)
      - `coding` (int, 0-10 skill rating)
      - `writing` (int, 0-10 skill rating)
      - `community` (int, 0-10 skill rating)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `profiles` table
    - Add policy for public read access
    - Add policy for public insert access
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  cryptography int CHECK (cryptography BETWEEN 0 AND 10),
  "distributedSystems" int CHECK ("distributedSystems" BETWEEN 0 AND 10),
  economics int CHECK (economics BETWEEN 0 AND 10),
  coding int CHECK (coding BETWEEN 0 AND 10),
  writing int CHECK (writing BETWEEN 0 AND 10),
  community int CHECK (community BETWEEN 0 AND 10),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "public read" ON public.profiles 
  FOR SELECT 
  USING (true);

-- Public insert access
CREATE POLICY "public insert" ON public.profiles 
  FOR INSERT 
  WITH CHECK (true);