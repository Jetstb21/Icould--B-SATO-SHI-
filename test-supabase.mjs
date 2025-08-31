import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    // Test profiles table (should work - public read access)
    console.log('1️⃣ Testing profiles table...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    console.log('Result:', { data, error });
    
    if (error) {
      console.log('\n❌ Error occurred:', error.message);
    } else {
      console.log('\n✅ Connection successful!');
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testConnection();