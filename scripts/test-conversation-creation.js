#!/usr/bin/env node

/**
 * Test conversation creation after fixing RLS policies
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase URL or Anon Key in .env.local');
    process.exit(1);
}

console.log('🔗 Connecting to Supabase CLOUD:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConversationCreation() {
    console.log('🚀 Testing conversation creation...\n');
    
    // Simulate login as john.smith (this would normally be done via auth)
    const testUserId = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3'; // john.smith from our previous tests
    const targetUserId = 'd5d6b178-b267-450c-882d-29b86f52c53a'; // maria.garcia
    
    console.log('👤 Test users:');
    console.log(`  Current user: ${testUserId} (john.smith)`);
    console.log(`  Target user:  ${targetUserId} (maria.garcia)`);
    
    // Test 1: Create a conversation
    console.log('\n📋 Test 1: Create conversation');
    const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
            created_by: testUserId,
            type: 'direct',
            participants_count: 2
        })
        .select()
        .single();
    
    if (convError) {
        console.error('❌ Error creating conversation:', convError);
        return;
    } else {
        console.log('✅ Conversation created successfully');
        console.log(`  ID: ${conversation.id}`);
        console.log(`  Created by: ${conversation.created_by}`);
    }
    
    // Test 2: Add participants
    console.log('\n👥 Test 2: Add conversation participants');
    const participants = [
        {
            conversation_id: conversation.id,
            user_id: testUserId,
            role: 'admin',
            joined_at: new Date().toISOString()
        },
        {
            conversation_id: conversation.id,
            user_id: targetUserId,
            role: 'member',
            joined_at: new Date().toISOString()
        }
    ];
    
    const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants)
        .select();
    
    if (participantsError) {
        console.error('❌ Error adding participants:', participantsError);
        
        // Cleanup: delete the conversation if participants failed
        await supabase.from('conversations').delete().eq('id', conversation.id);
    } else {
        console.log(`✅ Added ${participantsData.length} participants successfully`);
        participantsData.forEach((participant, index) => {
            console.log(`  ${index + 1}. User ${participant.user_id} as ${participant.role}`);
        });
        
        // Test 3: Verify the complete conversation
        console.log('\n🔍 Test 3: Verify conversation with participants');
        const { data: fullConversation, error: verifyError } = await supabase
            .from('conversations')
            .select(`
                *,
                conversation_participants (
                    user_id,
                    role,
                    joined_at
                )
            `)
            .eq('id', conversation.id)
            .single();
        
        if (verifyError) {
            console.error('❌ Error verifying conversation:', verifyError);
        } else {
            console.log('✅ Conversation verified successfully');
            console.log(`  Participants: ${fullConversation.conversation_participants.length}`);
            fullConversation.conversation_participants.forEach((p, index) => {
                console.log(`    ${index + 1}. ${p.user_id} (${p.role})`);
            });
        }
    }
}

testConversationCreation().catch(console.error);
