import { supabase } from './src/lib/supabase.js'

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    // Test 1: Query profiles table (should work - public read access)
    console.log('1️⃣ Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    console.log('Profiles result:', { data: profiles, error: profilesError });
    
    // Test 2: Query user_scores table (should be restricted by RLS)
    console.log('\n2️⃣ Testing user_scores table (should show RLS error)...');
    const { data: scores, error: scoresError } = await supabase
      .from('user_scores')
      .select('*')
      .limit(1);
    
    console.log('User scores result:', { data: scores, error: scoresError });
    
    // Test 3: Query benchmark_requirements table (should work - public read)
    console.log('\n3️⃣ Testing benchmark_requirements table...');
    const { data: requirements, error: requirementsError } = await supabase
      .from('benchmark_requirements')
      .select('*')
      .limit(1);
    
    console.log('Requirements result:', { data: requirements, error: requirementsError });
    
    // Test 4: Try the submissions table you mentioned (will likely fail)
    console.log('\n4️⃣ Testing submissions table (likely does not exist)...');
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('*')
      .limit(1);
    
    console.log('Submissions result:', { data: submissions, error: submissionsError });
    
    console.log('\n✅ Connection test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection();