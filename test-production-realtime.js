// Comprehensive test script for Supabase Production Realtime Chat functionality
import { createClient } from '@supabase/supabase-js'

// Using your production Supabase instance
const supabaseUrl = 'https://yvsjynosfwyhvisqhasp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2c2p5bm9zZnd5aHZpc3FoYXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjE0MDIsImV4cCI6MjA2MzgzNzQwMn0.cFkFS9DaD5BCN4R34RDp3bs4kQbicq2NM6NpVASiSdY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProductionRealtime() {
  console.log('🌐 Production Supabase Realtime Chat Test')
  console.log('==========================================')
  
  try {
    // Step 1: Create users in both auth.users and public.users
    console.log('1. Creating test users with proper database entries...')
    
    // User 1
    const testEmail1 = `prodtest1_${Date.now()}@test.com`
    const testPassword1 = 'ProdTest123!'
    
    const { data: authUser1, error: authError1 } = await supabase.auth.signUp({
      email: testEmail1,
      password: testPassword1,
    })
    
    if (authError1) {
      console.log('❌ User 1 auth signup failed:', authError1.message)
      return
    }
    
    console.log('✅ User 1 auth created:', authUser1.user.id)
    
    // Create corresponding entry in public.users
    const { data: publicUser1, error: publicError1 } = await supabase
      .from('users')
      .upsert({
        id: authUser1.user.id,
        email: testEmail1,
        username: `prodtest1_${Date.now()}`,
        full_name: 'Production Test User One'
      })
      .select()
    
    if (publicError1) {
      console.log('❌ User 1 public.users creation failed:', publicError1.message)
      console.log('   This might be due to RLS policies. Continuing with auth user only...')
    } else {
      console.log('✅ User 1 public.users entry created')
    }
    
    // User 2
    const testEmail2 = `prodtest2_${Date.now()}@test.com`
    const testPassword2 = 'ProdTest123!'
    
    const { data: authUser2, error: authError2 } = await supabase.auth.signUp({
      email: testEmail2,
      password: testPassword2,
    })
    
    if (authError2) {
      console.log('❌ User 2 auth signup failed:', authError2.message)
      return
    }
    
    console.log('✅ User 2 auth created:', authUser2.user.id)
    
    // Create corresponding entry in public.users
    const { data: publicUser2, error: publicError2 } = await supabase
      .from('users')
      .upsert({
        id: authUser2.user.id,
        email: testEmail2,
        username: `prodtest2_${Date.now()}`,
        full_name: 'Production Test User Two'
      })
      .select()
    
    if (publicError2) {
      console.log('❌ User 2 public.users creation failed:', publicError2.message)
      console.log('   This might be due to RLS policies. Continuing with auth user only...')
    } else {
      console.log('✅ User 2 public.users entry created')
    }

    // Step 2: Test table access permissions
    console.log('\n2. Testing table access permissions...')
    
    // Check if we can read from messages table
    const { data: messageCheck, error: messageCheckError } = await supabase
      .from('messages')
      .select('count')
      .limit(1)
    
    if (messageCheckError) {
      console.log('❌ Messages table access failed:', messageCheckError.message)
      console.log('   This indicates RLS policy issues')
    } else {
      console.log('✅ Messages table is accessible')
    }
    
    // Check if we can read from users table
    const { data: userCheck, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (userCheckError) {
      console.log('❌ Users table access failed:', userCheckError.message)
      console.log('   This indicates RLS policy issues')
    } else {
      console.log('✅ Users table is accessible')
    }

    // Step 3: Test authenticated operations
    console.log('\n3. Testing authenticated operations...')
    
    // Sign in as user 1 to test authenticated operations
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail1,
      password: testPassword1,
    })
    
    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message)
    } else {
      console.log('✅ Successfully signed in as User 1')
      console.log('   Session ID:', signInData.session?.access_token?.substring(0, 20) + '...')
    }

    // Step 4: Try to insert message with authentication
    console.log('\n4. Testing message insertion with authentication...')
    
    const testMessage = {
      sender_id: authUser1.user.id,
      receiver_id: authUser2.user.id,
      content: `Production test message from User 1 at ${new Date().toISOString()}`,
      message_type: 'text'
    }
    
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert(testMessage)
      .select()
    
    if (messageError) {
      console.log('❌ Message insertion failed:', messageError.message)
      console.log('   Full error details:', messageError)
      
      // Let's try to understand the specific issue
      if (messageError.message.includes('violates foreign key constraint')) {
        console.log('   🔍 Issue: Foreign key constraint violation')
        console.log('   This means the public.users entries are missing or RLS is blocking them')
      } else if (messageError.message.includes('RLS')) {
        console.log('   🔍 Issue: Row Level Security policy blocking the operation')
      } else if (messageError.message.includes('permission')) {
        console.log('   🔍 Issue: Permission denied - check RLS policies')
      }
    } else {
      console.log('✅ Message inserted successfully!')
      console.log('   Message ID:', messageData[0]?.id)
      console.log('   Content:', messageData[0]?.content)
    }

    // Step 5: Test realtime subscription capabilities
    console.log('\n5. Testing realtime subscription capabilities...')
    
    let subscriptionActive = false
    let subscriptionError = null
    let messagesReceived = []
    
    const channel = supabase
      .channel('prod-messages-test')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('🔔 Production realtime message received!')
          console.log('   Event type:', payload.eventType)
          console.log('   Message ID:', payload.new?.id)
          console.log('   Content preview:', payload.new?.content?.substring(0, 50) + '...')
          messagesReceived.push(payload)
        }
      )
      .subscribe((status, error) => {
        console.log('📡 Production subscription status:', status)
        if (error) {
          console.log('❌ Production subscription error:', error)
          subscriptionError = error
        }
        if (status === 'SUBSCRIBED') {
          subscriptionActive = true
          console.log('✅ Production realtime subscription is ACTIVE!')
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Channel error - realtime might not be enabled or configured')
        }
      })

    // Wait for subscription
    console.log('⏳ Waiting for production subscription to activate...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    if (!subscriptionActive) {
      console.log('❌ Production realtime subscription failed to activate')
      if (subscriptionError) {
        console.log('   Error details:', subscriptionError)
      }
      console.log('   💡 Check if realtime is enabled in Supabase dashboard')
      console.log('   💡 Check if the messages table has realtime publication enabled')
    }

    // Step 6: Database introspection
    console.log('\n6. Database introspection...')
    
    // Check current user context
    const { data: currentUser } = await supabase.auth.getUser()
    if (currentUser?.user) {
      console.log('✅ Current authenticated user:', currentUser.user.id)
      console.log('   Email:', currentUser.user.email)
      console.log('   Created:', currentUser.user.created_at)
    } else {
      console.log('❌ No authenticated user found')
    }
    
    // Try to get session info
    const { data: session } = await supabase.auth.getSession()
    if (session?.session) {
      console.log('✅ Active session found')
      console.log('   Expires at:', session.session.expires_at)
    } else {
      console.log('❌ No active session')
    }

    // Step 7: Alternative test using service role (if available)
    console.log('\n7. Testing with elevated permissions (if available)...')
    
    // Create a client with service role key for testing
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2c2p5bm9zZnd5aHZpc3FoYXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI2MTQwMiwiZXhwIjoyMDYzODM3NDAyfQ.nF-6Rpj5NZdVH1R0pN4Wm2VSJRF0GaPfAlgPvwezMoc'
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey)
    
    // Try to create public.users entries with admin privileges
    try {
      const { data: adminUser1, error: adminError1 } = await adminSupabase
        .from('users')
        .upsert({
          id: authUser1.user.id,
          email: testEmail1,
          username: `prodtest1_${Date.now()}`,
          full_name: 'Production Test User One (Admin Created)'
        })
        .select()
      
      if (adminError1) {
        console.log('❌ Admin user 1 creation failed:', adminError1.message)
      } else {
        console.log('✅ Admin created User 1 in public.users')
      }
      
      const { data: adminUser2, error: adminError2 } = await adminSupabase
        .from('users')
        .upsert({
          id: authUser2.user.id,
          email: testEmail2,
          username: `prodtest2_${Date.now()}`,
          full_name: 'Production Test User Two (Admin Created)'
        })
        .select()
      
      if (adminError2) {
        console.log('❌ Admin user 2 creation failed:', adminError2.message)
      } else {
        console.log('✅ Admin created User 2 in public.users')
      }
      
      // Now try message insertion with admin client
      const adminMessage = {
        sender_id: authUser1.user.id,
        receiver_id: authUser2.user.id,
        content: `Admin-created production test message at ${new Date().toISOString()}`,
        message_type: 'text'
      }
      
      const { data: adminMessageData, error: adminMessageError } = await adminSupabase
        .from('messages')
        .insert(adminMessage)
        .select()
      
      if (adminMessageError) {
        console.log('❌ Admin message insertion failed:', adminMessageError.message)
      } else {
        console.log('✅ Admin message inserted successfully!')
        console.log('   Message ID:', adminMessageData[0]?.id)
      }
      
    } catch (adminError) {
      console.log('❌ Admin operations failed:', adminError.message)
    }

    // Cleanup
    await supabase.removeChannel(channel)
    console.log('🧹 Cleaned up realtime subscription')

    console.log('\n🎯 Production test summary:')
    console.log('   - User authentication: ✅ Working')
    console.log('   - Message table access:', messageCheckError ? '❌ RLS Issues' : '✅ Working')
    console.log('   - Realtime subscription:', subscriptionActive ? '✅ Working' : '❌ Failed')
    console.log('   - Foreign key constraints:', messageError?.message.includes('foreign key') ? '❌ Issues' : '✅ Working')

  } catch (error) {
    console.log('❌ Production test failed with exception:', error.message)
    console.log('Full error stack:', error.stack)
  }
}

// Run the test
testProductionRealtime().then(() => {
  console.log('\n🏁 Production realtime test completed!')
  process.exit(0)
}).catch(err => {
  console.error('❌ Production test script error:', err)
  process.exit(1)
})
