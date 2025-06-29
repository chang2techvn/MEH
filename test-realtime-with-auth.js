const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔗 Testing Supabase Realtime with Authentication');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-8) : 'Missing');

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

async function testRealtimeWithAuth() {
  console.log('\n👤 Step 1: Sign in user...');
  
  try {
    // Sign in as a test user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'teacher1@university.edu',
      password: 'teacher123456'
    });

    if (authError) {
      console.error('❌ Auth error:', authError.message);
      console.log('\n💡 Trying to create user first...');
      
      // Try to create user if sign in fails
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'teacher1@university.edu',
        password: 'teacher123456',
        options: {
          data: {
            full_name: 'Prof. Sarah Wilson'
          }
        }
      });

      if (signUpError) {
        console.error('❌ Sign up error:', signUpError.message);
        return;
      }

      console.log('✅ User created, now signing in...');
      const { data: retryAuth, error: retryError } = await supabase.auth.signInWithPassword({
        email: 'teacher1@university.edu',
        password: 'teacher123456'
      });

      if (retryError) {
        console.error('❌ Retry auth error:', retryError.message);
        return;
      }
    }

    console.log('✅ Authentication successful');
    console.log('User ID:', authData?.user?.id || 'Unknown');

    console.log('\n🔌 Step 2: Testing realtime connection...');
    
    // Now test realtime with authenticated user
    const channel = supabase.channel('test-channel-auth');
    
    let connected = false;
    let error = null;
    
    channel
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversation_messages' 
        }, 
        (payload) => {
          console.log('📨 Realtime message received:', payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          connected = true;
          console.log('✅ Realtime connection successful!');
          
          // Test sending a message to the channel
          setTimeout(() => {
            console.log('\n📤 Testing broadcast...');
            channel.send({
              type: 'broadcast',
              event: 'test',
              payload: { message: 'Hello from test!' }
            });
          }, 1000);
          
        } else if (status === 'CHANNEL_ERROR') {
          error = 'Channel error';
          connected = false;
          console.error('❌ Channel error occurred');
        } else if (status === 'TIMED_OUT') {
          error = 'Connection timed out';
          connected = false;
          console.error('❌ Connection timed out');
        } else if (status === 'CLOSED') {
          console.log('🔒 Channel closed');
        }
      });

    // Wait for connection result
    await new Promise((resolve) => {
      setTimeout(() => {
        if (connected) {
          console.log('\n🎉 Realtime test completed successfully!');
        } else {
          console.log('\n❌ Realtime connection failed:', error || 'Unknown error');
        }
        
        // Cleanup
        channel.unsubscribe();
        resolve();
      }, 5000);
    });

  } catch (err) {
    console.error('💥 Unexpected error:', err.message);
  }
}

// Run the test
testRealtimeWithAuth().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch((err) => {
  console.error('💥 Test failed:', err);
  process.exit(1);
});
