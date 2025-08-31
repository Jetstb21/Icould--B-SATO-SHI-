import { supabase } from './src/lib/supabase.js'

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    // Test 1: Basic connection with profiles table
    console.log('1️⃣ Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    console.log('Profiles query result:', { data: profiles, error: profilesError });
    
    // Test 2: Test user_scores table (requires auth)
    console.log('\n2️⃣ Testing user_scores table (should be restricted)...');
    const { data: scores, error: scoresError } = await supabase
      .from('user_scores')
      .select('*')
      .limit(1);
    
    console.log('User scores query result:', { data: scores, error: scoresError });
    
    // Test 3: Test user_score_events table (should be restricted)
    console.log('\n3️⃣ Testing user_score_events table (should be restricted)...');
    const { data: events, error: eventsError } = await supabase
      .from('user_score_events')
      .select('*')
      .limit(1);
    
    console.log('Score events query result:', { data: events, error: eventsError });
    
    // Test 4: Test benchmark_requirements table (should be public readable)
    console.log('\n4️⃣ Testing benchmark_requirements table...');
    const { data: requirements, error: requirementsError } = await supabase
      .from('benchmark_requirements')
      .select('*')
      .limit(1);
    
    console.log('Requirements query result:', { data: requirements, error: requirementsError });
    
    console.log('\n✅ Connection test complete!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection();