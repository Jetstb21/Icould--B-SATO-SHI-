/*
  # Create user scores table

  1. New Tables
    - `user_scores`
      - `user_id` (uuid, primary key, references auth.users)
      - `scores` (jsonb, stores skill scores)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_scores` table
    - Add policies for users to read, insert, and update their own scores
*/

CREATE TABLE IF NOT EXISTS public.user_scores (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own scores" ON public.user_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "upsert own scores" ON public.user_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update own scores" ON public.user_scores
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);