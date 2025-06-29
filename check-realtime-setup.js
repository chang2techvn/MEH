const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRealtimeSetup() {
  console.log('🔍 Checking Realtime setup...\n');

  try {
    // Check publications
    console.log('1. Checking publications:');
    const { data: publications, error: pubError } = await supabase
      .rpc('pg_publication_tables')
      .select('*');
    
    if (pubError) {
      console.log('❌ Error getting publications:', pubError.message);
    } else {
      console.log('✅ Publications:', publications);
    }

    // Try alternative approach to check publications
    console.log('\n2. Alternative publication check:');
    const { data: pubData, error: pubErr } = await supabase
      .from('information_schema.tables')
      .select('*')
      .limit(1);
    
    if (pubErr) {
      console.log('❌ Error:', pubErr.message);
    } else {
      console.log('✅ Can query information_schema');
    }

    // Check if we can query messages table
    console.log('\n3. Checking messages table access:');
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('id, content, created_at')
      .limit(5);
      
    if (msgError) {
      console.log('❌ Error querying messages:', msgError.message);
    } else {
      console.log('✅ Messages table accessible, sample:', messages?.length || 0, 'records');
    }

    // Check conversations table
    console.log('\n4. Checking conversations table access:');
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, title, created_at')
      .limit(5);
      
    if (convError) {
      console.log('❌ Error querying conversations:', convError.message);
    } else {
      console.log('✅ Conversations table accessible, sample:', conversations?.length || 0, 'records');
    }

    // Test realtime connection
    console.log('\n5. Testing realtime connection:');
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' }, 
        (payload) => {
          console.log('📨 Realtime event received:', payload);
        }
      );

    await new Promise((resolve, reject) => {
      channel
        .subscribe((status) => {
          console.log('📡 Channel status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to realtime');
            resolve();
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.log('❌ Failed to subscribe to realtime');
            reject(new Error(`Channel ${status}`));
          }
        });
    });

    // Test inserting a message to trigger realtime
    console.log('\n6. Testing realtime with actual insert:');
    const { data: insertResult, error: insertError } = await supabase
      .from('messages')
      .insert({
        sender_id: '00000000-0000-0000-0000-000000000001', // Using first test user
        receiver_id: '00000000-0000-0000-0000-000000000002', // Using second test user
        content: 'Test realtime message - ' + new Date().toISOString(),
        message_type: 'text'
      })
      .select();

    if (insertError) {
      console.log('❌ Error inserting test message:', insertError.message);
    } else {
      console.log('✅ Test message inserted:', insertResult);
    }

    // Wait for realtime event
    console.log('⏳ Waiting for realtime event (5 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\n✅ Realtime setup check completed');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkRealtimeSetup();
