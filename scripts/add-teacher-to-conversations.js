#!/usr/bin/env node

/**
 * Add teacher1@university.edu to existing conversations
 * This will make the Messages button work for the teacher account
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔗 Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  try {
    console.log('👨‍🏫 Adding teacher1@university.edu to conversations...\n');

    // Step 1: Get teacher1 user ID
    const { data: teacher, error: teacherError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', 'teacher1@university.edu')
      .single();

    if (teacherError || !teacher) {
      console.error('❌ Teacher not found:', teacherError);
      return;
    }

    console.log(`✅ Found teacher: ${teacher.email} (${teacher.id})`);

    // Step 2: Get all active conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, title, status')
      .eq('status', 'active');

    if (convError) {
      console.error('❌ Error fetching conversations:', convError);
      return;
    }

    console.log(`📞 Found ${conversations.length} active conversations`);

    // Step 3: Add teacher to each conversation as moderator
    const participantData = conversations.map(conv => ({
      conversation_id: conv.id,
      user_id: teacher.id,
      role: 'teacher',
      joined_at: new Date().toISOString(),
      last_read_at: new Date().toISOString()
    }));

    const { data: newParticipants, error: participantError } = await supabase
      .from('conversation_participants')
      .insert(participantData)
      .select();

    if (participantError) {
      console.error('❌ Error adding teacher to conversations:', participantError);
      return;
    }

    console.log(`✅ Added teacher to ${newParticipants.length} conversations`);

    // Step 4: Add some welcome messages from the teacher
    const welcomeMessages = [
      {
        conversation_id: conversations[0]?.id,
        sender_id: teacher.id,
        content: "Hello everyone! I'm here to help with any grammar questions you might have. Feel free to ask anything!",
        message_type: 'text',
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 minutes ago
      },
      {
        conversation_id: conversations[1]?.id,
        sender_id: teacher.id,
        content: "Hi TOEFL students! Remember to practice time management along with comprehension. Good luck with your studies!",
        message_type: 'text',
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
      },
      {
        conversation_id: conversations[2]?.id,
        sender_id: teacher.id,
        content: "Business English is all about clarity and professionalism. Let me know if you need help with any formal writing!",
        message_type: 'text',
        created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
      }
    ].filter(msg => msg.conversation_id); // Only include messages for existing conversations

    if (welcomeMessages.length > 0) {
      const { data: messages, error: messageError } = await supabase
        .from('conversation_messages')
        .insert(welcomeMessages)
        .select();

      if (messageError) {
        console.warn('⚠️ Warning adding welcome messages:', messageError.message);
      } else {
        console.log(`💬 Added ${messages.length} welcome messages from teacher`);
      }
    }

    // Step 5: Verify the setup
    console.log('\n🔍 Verifying teacher conversations...');
    const { data: teacherConversations, error: verifyError } = await supabase
      .from('conversation_participants')
      .select(`
        *,
        conversations!inner(id, title, status)
      `)
      .eq('user_id', teacher.id);

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
    } else {
      console.log(`📞 Teacher is now in ${teacherConversations.length} conversations:`);
      teacherConversations.forEach(conv => {
        console.log(`   - ${conv.conversations.title} (${conv.conversations.status})`);
      });
    }

    // Step 6: Check recent messages in teacher's conversations
    const { data: recentMessages, error: msgError } = await supabase
      .from('conversation_messages')
      .select(`
        content,
        created_at,
        users!inner(email, name)
      `)
      .in('conversation_id', teacherConversations.map(c => c.conversation_id))
      .order('created_at', { ascending: false })
      .limit(5);

    if (!msgError && recentMessages.length > 0) {
      console.log(`\n💬 Recent messages in teacher's conversations:`);
      recentMessages.forEach(msg => {
        console.log(`   - ${msg.users.email}: "${msg.content.slice(0, 60)}..."`);
      });
    }

    console.log('\n🎉 SUCCESS! Teacher1 is now connected to conversations!');
    console.log('✅ The Messages button should now work for teacher1@university.edu');
    console.log('✅ Teacher can see all active conversations');
    console.log('✅ Teacher has sent welcome messages');

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

main();
