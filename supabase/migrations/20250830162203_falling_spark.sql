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

create table if not exists public.user_scores (
  user_id uuid primary key references auth.users(id) on delete cascade,
  scores  jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_scores enable row level security;

create policy "read own scores" on public.user_scores
for select using (auth.uid() = user_id);

create policy "upsert own scores" on public.user_scores
for insert with check (auth.uid() = user_id);

create policy "update own scores" on public.user_scores
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);