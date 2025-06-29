#!/usr/bin/env node

/**
 * Create Test Messages Script
 * Creates test messages between authenticated users
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function createTestMessages() {
  console.log('📝 Creating test messages between teachers...');
  
  try {
    // Step 1: Sign in as Prof. Sarah Wilson
    console.log('\n🔐 Signing in as Prof. Sarah Wilson...');
    const { data: sarahAuth, error: sarahError } = await supabase.auth.signInWithPassword({
      email: 'teacher1@university.edu',
      password: 'teacher123456'
    });
    
    if (sarahError) throw sarahError;
    console.log('✅ Sarah signed in:', sarahAuth.user.id);
    
    // Get Prof. Michael Brown's profile ID
    const { data: michaelProfile, error: michaelError } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', 'Prof. Michael Brown')
      .single();
      
    if (michaelError) throw michaelError;
    console.log('✅ Found Michael profile:', michaelProfile.id);
    
    // Send message from Sarah to Michael
    const { error: msg1Error } = await supabase
      .from('messages')
      .insert({
        sender_id: sarahAuth.user.id,
        receiver_id: michaelProfile.id,
        content: 'Hi Michael! How are your business English classes going?'
      });
      
    if (msg1Error) throw msg1Error;
    console.log('✅ Message 1 sent: Sarah -> Michael');
    
    await supabase.auth.signOut();
    
    // Step 2: Sign in as Prof. Michael Brown  
    console.log('\n🔐 Signing in as Prof. Michael Brown...');
    const { data: michaelAuth, error: michael2Error } = await supabase.auth.signInWithPassword({
      email: 'teacher2@university.edu', 
      password: 'teacher123456'
    });
    
    if (michael2Error) throw michael2Error;
    console.log('✅ Michael signed in:', michaelAuth.user.id);
    
    // Get Prof. Sarah Wilson's profile ID
    const { data: sarahProfile, error: sarah2Error } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', 'Prof. Sarah Wilson')
      .single();
      
    if (sarah2Error) throw sarah2Error;
    console.log('✅ Found Sarah profile:', sarahProfile.id);
    
    // Send message from Michael to Sarah
    const { error: msg2Error } = await supabase
      .from('messages')
      .insert({
        sender_id: michaelAuth.user.id,
        receiver_id: sarahProfile.id,
        content: 'Hi Sarah! They are going very well. The students love the new interactive exercises!'
      });
      
    if (msg2Error) throw msg2Error;
    console.log('✅ Message 2 sent: Michael -> Sarah');
    
    await supabase.auth.signOut();
    
    // Step 3: Send one more from Sarah
    console.log('\n🔐 Signing in as Sarah again...');
    const { data: sarah3Auth, error: sarah3Error } = await supabase.auth.signInWithPassword({
      email: 'teacher1@university.edu',
      password: 'teacher123456'
    });
    
    if (sarah3Error) throw sarah3Error;
    
    const { error: msg3Error } = await supabase
      .from('messages')
      .insert({
        sender_id: sarah3Auth.user.id,
        receiver_id: michaelProfile.id,
        content: 'That is wonderful! Would you like to collaborate on creating some new materials?'
      });
      
    if (msg3Error) throw msg3Error;
    console.log('✅ Message 3 sent: Sarah -> Michael');
    
    await supabase.auth.signOut();
    
    console.log('\n🎉 All test messages created successfully!');
    console.log('Now both teachers should see their conversation in the message dropdown.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
if (require.main === module) {
  createTestMessages().catch(error => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { createTestMessages };
