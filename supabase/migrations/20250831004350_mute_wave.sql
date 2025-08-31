/*
  # Create emails_sent table for tracking email reports

  1. New Tables
    - `emails_sent`
      - `id` (uuid, primary key)
      - `to_email` (text, recipient email address)
      - `name` (text, optional recipient name)
      - `report_url` (text, URL to the report)
      - `profile_id` (uuid, optional reference to profile)
      - `sent_at` (timestamp, when email was sent)

  2. Security
    - Enable RLS on `emails_sent` table
    - Add policy for public insert access (allows sending emails)
    - Add policy for public read access (allows viewing sent emails)
*/

create table if not exists emails_sent (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  name text,
  report_url text not null,
  profile_id uuid,
  sent_at timestamptz default now()
);

alter table emails_sent enable row level security;

create policy "public insert emails" on emails_sent 
  for insert 
  with check (true);

create policy "public read emails" on emails_sent 
  for select 
  using (true);