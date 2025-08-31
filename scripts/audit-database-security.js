#!/usr/bin/env node

/**
 * Database Security Audit Script
 * Verifies that security hardening has been properly applied
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role for admin queries

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function auditSecurity() {
  console.log('🔍 Starting database security audit...\n');

  try {
    // 1. Check for unauthorized grants
    console.log('1️⃣ Checking for unauthorized grants to anon/public...');
    const { data: grants, error: grantsError } = await supabase.rpc('sql', {
      query: `
        SELECT grantee, privilege_type, table_name
        FROM information_schema.role_table_grants
        WHERE table_schema='public' 
        AND grantee IN ('anon', 'public')
        ORDER BY grantee, table_name, privilege_type;
      `
    });

    if (grantsError) {
      console.error('❌ Error checking grants:', grantsError.message);
    } else if (!grants || grants.length === 0) {
      console.log('✅ No unauthorized grants found');
    } else {
      console.log('⚠️  Found grants to anon/public:');
      grants.forEach(g => console.log(`   ${g.grantee}: ${g.privilege_type} on ${g.table_name}`));
    }

    // 2. Check for policies mentioning anon/public
    console.log('\n2️⃣ Checking for policies referencing anon/public...');
    const { data: policies, error: policiesError } = await supabase.rpc('sql', {
      query: `
        SELECT policyname, tablename, roles
        FROM pg_policies
        WHERE schemaname='public' 
        AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[]);
      `
    });

    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError.message);
    } else if (!policies || policies.length === 0) {
      console.log('✅ No policies referencing anon/public found');
    } else {
      console.log('⚠️  Found policies referencing anon/public:');
      policies.forEach(p => console.log(`   ${p.tablename}.${p.policyname}: ${p.roles}`));
    }

    // 3. Check RLS is enabled on all tables
    console.log('\n3️⃣ Checking RLS status on all tables...');
    const { data: tables, error: tablesError } = await supabase.rpc('sql', {
      query: `
        SELECT schemaname, tablename, rowsecurity
        FROM pg_tables
        WHERE schemaname='public'
        ORDER BY tablename;
      `
    });

    if (tablesError) {
      console.error('❌ Error checking RLS status:', tablesError.message);
    } else if (tables) {
      const noRLS = tables.filter(t => !t.rowsecurity);
      if (noRLS.length === 0) {
        console.log('✅ RLS enabled on all tables');
      } else {
        console.log('⚠️  Tables without RLS:');
        noRLS.forEach(t => console.log(`   ${t.tablename}`));
      }
    }

    // 4. Test authenticated access
    console.log('\n4️⃣ Testing authenticated access patterns...');
    
    // Test with anon key (should be restricted)
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: anonTest, error: anonError } = await anonClient
      .from('user_scores')
      .select('count')
      .limit(1);

    if (anonError && anonError.message.includes('RLS')) {
      console.log('✅ Anon access properly restricted by RLS');
    } else {
      console.log('⚠️  Anon access may not be properly restricted');
    }

    // 5. Check storage schema permissions
    console.log('\n5️⃣ Checking storage schema permissions...');
    const { data: storageGrants, error: storageError } = await supabase.rpc('sql', {
      query: `
        SELECT grantee, privilege_type
        FROM information_schema.schema_privileges
        WHERE schema_name='storage' 
        AND grantee IN ('anon', 'public')
        ORDER BY grantee, privilege_type;
      `
    });

    if (storageError) {
      console.error('❌ Error checking storage permissions:', storageError.message);
    } else if (!storageGrants || storageGrants.length === 0) {
      console.log('✅ No storage permissions granted to anon/public');
    } else {
      console.log('⚠️  Found storage permissions for anon/public:');
      storageGrants.forEach(g => console.log(`   ${g.grantee}: ${g.privilege_type}`));
    }

    console.log('\n🎉 Security audit complete!');

  } catch (error) {
    console.error('❌ Audit failed:', error);
  }
}

// Run the audit
auditSecurity().catch(console.error);