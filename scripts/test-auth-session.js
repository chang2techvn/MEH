/**
 * Test Authentication and Natural Conversation Session Creation
 * Debug script to test user authentication and RLS policies
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Authentication and Session Creation...\n');

// Test with anon client (like frontend)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// Test with service role (for comparison)
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

async function testAuthentication() {
  console.log('📋 1. Testing Authentication Status...');
  
  try {
    // Check current user with anon client
    const { data: { user }, error } = await supabaseAnon.auth.getUser();
    
    console.log('Current User:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      is_anonymous: user.is_anonymous
    } : 'No user logged in');
    
    if (error) {
      console.error('Auth Error:', error);
    }
    
    return user;
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return null;
  }
}

async function testSessionCreation(user) {
  console.log('\n📋 2. Testing Session Creation...');
  
  if (!user) {
    console.log('⚠️ No authenticated user, attempting to sign in...');
    
    // Try to get a test user or sign in
    try {
      const { data, error } = await supabaseAnon.auth.signInWithPassword({
        email: 'test@example.com', // Change to your test email
        password: 'testpassword123' // Change to your test password
      });
      
      if (error) {
        console.log('❌ Sign in failed:', error.message);
        console.log('💡 Please create a test user or use existing credentials');
        return false;
      }
      
      user = data.user;
      console.log('✅ Signed in as:', user.email);
    } catch (signInError) {
      console.log('❌ Sign in error:', signInError);
      return false;
    }
  }
  
  // Test session creation with authenticated user
  try {
    const sessionData = {
      user_id: user.id,
      title: `Test Session ${Date.now()}`,
      conversation_mode: 'natural_group',
      session_settings: {
        allow_ai_interruptions: true,
        allow_ai_questions: true,
        topic_drift_allowed: true,
        max_ai_participants: 3,
        response_timing: 'natural'
      },
      active_ai_ids: ['test-ai-1', 'test-ai-2'],
      is_active: true
    };
    
    console.log('🔄 Creating session with data:', sessionData);
    
    const { data, error } = await supabaseAnon
      .from('natural_conversation_sessions')
      .insert(sessionData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Session creation failed:', error);
      return false;
    }
    
    console.log('✅ Session created successfully:', {
      id: data.id,
      title: data.title,
      user_id: data.user_id
    });
    
    return data;
  } catch (error) {
    console.error('❌ Session creation error:', error);
    return false;
  }
}

async function testRLSPolicies() {
  console.log('\n📋 3. Testing RLS Policies...');
  
  try {
    // Test reading sessions with service role
    const { data: serviceSessions, error: serviceError } = await supabaseService
      .from('natural_conversation_sessions')
      .select('*')
      .limit(5);
    
    console.log('Service Role Sessions:', serviceSessions?.length || 0, 'found');
    if (serviceError) {
      console.error('Service Role Error:', serviceError);
    }
    
    // Test reading sessions with anon client (should require auth)
    const { data: anonSessions, error: anonError } = await supabaseAnon
      .from('natural_conversation_sessions')
      .select('*')
      .limit(5);
    
    console.log('Anon Client Sessions:', anonSessions?.length || 0, 'found');
    if (anonError) {
      console.error('Anon Client Error:', anonError);
    }
    
  } catch (error) {
    console.error('❌ RLS test error:', error);
  }
}

async function testAIAssistants() {
  console.log('\n📋 4. Testing AI Assistants Access...');
  
  try {
    const { data: aiAssistants, error } = await supabaseAnon
      .from('ai_assistants')
      .select('id, name, role, field, is_active')
      .eq('is_active', true)
      .limit(5);
    
    if (error) {
      console.error('❌ AI Assistants error:', error);
    } else {
      console.log('✅ AI Assistants found:', aiAssistants.length);
      aiAssistants.forEach(ai => {
        console.log(`  - ${ai.name} (${ai.role} in ${ai.field})`);
      });
    }
  } catch (error) {
    console.error('❌ AI Assistants test error:', error);
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication and Session Tests\n');
  console.log('Environment Check:');
  console.log('- Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('- Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.log('- Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  console.log('');
  
  // Run all tests
  const user = await testAuthentication();
  await testRLSPolicies();
  await testAIAssistants();
  const session = await testSessionCreation(user);
  
  console.log('\n🏁 Test Summary:');
  console.log('- Authentication:', user ? '✅ Working' : '❌ Failed');
  console.log('- Session Creation:', session ? '✅ Working' : '❌ Failed');
  console.log('\n💡 If tests fail, check:');
  console.log('1. User is properly authenticated in your app');
  console.log('2. RLS policies are correctly applied');
  console.log('3. Environment variables are set correctly');
}

runTests().catch(console.error);
