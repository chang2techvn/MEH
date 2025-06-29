const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔗 Testing Supabase Realtime Connection');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-8) : 'Missing');

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

async function testRealtimeConnection() {
  console.log('\n🔌 Testing realtime connection...');
  
  try {
    // Test basic connection
    const channel = supabase.channel('test-channel');
    
    let connected = false;
    let error = null;
    
    // Set up connection handlers
    channel
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'conversations' 
      }, (payload) => {
        console.log('✅ Received realtime update:', payload);
      })
      .subscribe((status, err) => {
        console.log('📡 Channel status:', status);
        if (err) {
          console.log('❌ Channel error:', err);
          error = err;
        }
        if (status === 'SUBSCRIBED') {
          connected = true;
          console.log('✅ Successfully connected to realtime!');
        }
      });

    // Wait a few seconds to see if connection is established
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    if (connected === false) {
      console.log('❌ Failed to connect to realtime within 5 seconds');
      if (error) {
        console.log('Error details:', error);
      }
    }
    
    // Clean up
    await supabase.removeChannel(channel);
    
  } catch (err) {
    console.error('❌ Exception during realtime test:', err);
  }
}

testRealtimeConnection();
