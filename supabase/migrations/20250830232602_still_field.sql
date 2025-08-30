/*
  # Create benchmark requirements and catalog tables

  1. New Tables
    - `benchmark_requirements`
      - `id` (uuid, primary key)
      - `benchmark` (text, benchmark name like 'Satoshi', 'Hal Finney')
      - `metric` (text, skill category)
      - `target` (smallint, 0-10 target score)
      - `detail` (text, checklist description)
      - `evidence` (text, what counts as proof)
    
    - `requirements_catalog`
      - `id` (uuid, primary key)
      - `area` (text, skill area)
      - `label` (text, requirement description)
      - `url` (text, optional link to resources)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for authenticated insert access
*/

-- Table for what each benchmark expects, broken down by metric + sub-skills
CREATE TABLE IF NOT EXISTS public.benchmark_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark text NOT NULL,            -- 'Satoshi', 'Hal Finney', etc.
  metric text NOT NULL,               -- 'cryptography','coding','vision','impact','credibility','distributedSystems','economics','writing','community'
  target smallint NOT NULL CHECK (target BETWEEN 0 AND 10),
  detail text NOT NULL,               -- bullet text shown on checklist
  evidence text                       -- what counts as proof (link, PR, essay, cert, talk)
);

-- Optional library of suggested "proofs" users can do
CREATE TABLE IF NOT EXISTS public.requirements_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area text NOT NULL,                 -- 'cryptography','coding', etc.
  label text NOT NULL,                -- e.g., "Implement Ed25519 from spec"
  url text                            -- link to course/repo/spec
);

-- Enable Row Level Security
ALTER TABLE public.benchmark_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements_catalog ENABLE ROW LEVEL SECURITY;

-- Public read access for both tables
CREATE POLICY "public read benchmark requirements" ON public.benchmark_requirements 
  FOR SELECT 
  USING (true);

CREATE POLICY "public read requirements catalog" ON public.requirements_catalog 
  FOR SELECT 
  USING (true);

-- Authenticated users can insert new requirements and catalog items
CREATE POLICY "authenticated insert benchmark requirements" ON public.benchmark_requirements 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated insert requirements catalog" ON public.requirements_catalog 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_benchmark_requirements_benchmark ON public.benchmark_requirements(benchmark);
CREATE INDEX IF NOT EXISTS idx_benchmark_requirements_metric ON public.benchmark_requirements(metric);
CREATE INDEX IF NOT EXISTS idx_requirements_catalog_area ON public.requirements_catalog(area);