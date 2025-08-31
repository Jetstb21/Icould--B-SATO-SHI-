import { supabase } from './src/lib/supabase.js'

async function testSupabase() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    // Test with profiles table (which exists in your schema)
    console.log('Testing profiles table...');
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    console.log({ data, error });
    
    if (error) {
      console.log('\n❌ Error occurred:', error.message);
    } else {
      console.log('\n✅ Connection successful!');
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testSupabase();