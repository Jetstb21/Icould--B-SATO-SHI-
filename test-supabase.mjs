import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })  // load Vite env for Node

import { supabase } from './src/lib/supabase.node.js'

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    // Test submissions table
    console.log('1️⃣ Testing submissions table...');
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .limit(1);
    
    console.log({ error: profilesError, data: profiles });
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testConnection();