/**
 * Test script to check if environment variables are loaded correctly
 */

console.log('Testing environment variable loading...');

try {
  const env = require('@env');
  console.log('Environment variables loaded:');
  console.log('SUPABASE_URL:', env.SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('SUPABASE_ANON_KEY:', env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
  
  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    console.log('✅ Supabase environment variables are properly configured');
  } else {
    console.log('❌ Supabase environment variables are missing');
  }
} catch (error) {
  console.error('❌ Failed to load environment variables:', error);
}
