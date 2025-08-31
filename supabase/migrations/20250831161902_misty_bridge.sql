/*
  # Storage Security Hardening

  1. Security Changes
    - Revoke all permissions on storage schema from anon and public roles
    - Ensures storage access requires explicit authentication and policies
    - Prevents unauthorized file access or uploads

  2. Impact
    - Storage buckets will require explicit RLS policies for access
    - Anonymous users cannot access storage without proper policies
    - Authenticated users need specific bucket policies to access files
*/

-- Block anon reads unless you intend public assets
REVOKE ALL ON SCHEMA storage FROM anon, public;