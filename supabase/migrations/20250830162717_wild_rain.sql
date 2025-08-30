/*
  # Create user score events table and leaderboard

  1. New Tables
    - `user_score_events`
      - `id` (bigserial, primary key)
      - `user_id` (uuid, references auth.users)
      - `category` (text, skill category name)
      - `score` (int, 0-5 rating)
      - `note` (text, optional user note)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_score_events` table
    - Add policies for users to read, insert, update, and delete their own events

  3. Functions
    - `get_category_averages()` - Secure server-side function to calculate category averages for leaderboard
*/

create table if not exists public.user_score_events (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  category    text not null,
  score       int  not null check (score between 0 and 5),
  note        text,
  created_at  timestamptz not null default now()
);

alter table public.user_score_events enable row level security;

-- Policies: users can only see / write their own events
create policy "select own events" on public.user_score_events
for select using (auth.uid() = user_id);

create policy "insert own events" on public.user_score_events
for insert with check (auth.uid() = user_id);

-- Optional: allow update/delete own events (not required)
create policy "update own events" on public.user_score_events
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own events" on public.user_score_events
for delete using (auth.uid() = user_id);

-- Leaderboard: SECURE server-side aggregator (bypasses RLS safely)
create or replace function public.get_category_averages()
returns table(category text, avg_score numeric, samples bigint)
language sql
security definer
set search_path = public
as $$
  select category,
         round(avg(score)::numeric, 2) as avg_score,
         count(*)::bigint               as samples
  from public.user_score_events
  group by category
  order by category;
$$;

grant execute on function public.get_category_averages() to anon, authenticated;