#!/usr/bin/env node

// Test script to verify API key rotation
// Usage: node test-api-keys.js <project-id> <old-key> <new-key>

const [,, projectId, oldKey, newKey] = process.argv;

if (!projectId || !oldKey || !newKey) {
  console.log('Usage: node test-api-keys.js <project-id> <old-key> <new-key>');
  process.exit(1);
}

const baseUrl = `https://${projectId}.supabase.co/rest/v1/`;

async function testKey(key, label) {
  try {
    console.log(`\n🔍 Testing ${label} key...`);
    
    const response = await fetch(baseUrl, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 401) {
      console.log(`✅ ${label} key correctly rejected (401)`);
    } else if (response.status === 200) {
      console.log(`✅ ${label} key working (200)`);
    } else {
      console.log(`⚠️  Unexpected status for ${label} key`);
    }

    // Show first few headers
    console.log('Headers:');
    for (const [key, value] of response.headers.entries()) {
      if (['content-type', 'server', 'date'].includes(key.toLowerCase())) {
        console.log(`  ${key}: ${value}`);
      }
    }

  } catch (error) {
    console.log(`❌ Error testing ${label} key:`, error.message);
  }
}

async function main() {
  console.log(`Testing API key rotation for project: ${projectId}`);
  
  await testKey(oldKey, 'OLD');
  await testKey(newKey, 'NEW');
  
  console.log('\n✨ API key rotation test complete!');
}

main().catch(console.error);