#!/usr/bin/env node

/**
 * Simple test for conversation creation with service role
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

console.log('🔗 Connecting with SERVICE ROLE...');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSimpleConversation() {
    console.log('🚀 Testing simple conversation creation...\n');
    
    try {
        // Test 1: Check table access
        console.log('📊 Test 1: Check table access');
        const { count, error: countError } = await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            console.error('❌ Cannot access conversations table:', countError);
            return;
        }
        console.log(`✅ Conversations table accessible, ${count} rows`);
        
        // Test 2: Simple insert
        console.log('\n📝 Test 2: Simple conversation insert');
        const { data: conversation, error: insertError } = await supabase
            .from('conversations')
            .insert({
                title: 'Test Chat - Simple',
                type: 'direct',
                participants_count: 2
            })
            .select()
            .single();
        
        if (insertError) {
            console.error('❌ Error inserting conversation:', insertError);
            return;
        }
        console.log(`✅ Conversation created: ${conversation.id}`);
        
        // Test 3: Insert participants
        console.log('\n👥 Test 3: Insert participants');
        const { data: participants, error: participantsError } = await supabase
            .from('conversation_participants')
            .insert([
                {
                    conversation_id: conversation.id,
                    user_id: '63b605f9-bb19-4c10-97b1-6b1188c1d5e3', // john.smith
                    role: 'member'
                },
                {
                    conversation_id: conversation.id,
                    user_id: 'd5d6b178-b267-450c-882d-29b86f52c53a', // maria.garcia
                    role: 'member'
                }
            ]);
        
        if (participantsError) {
            console.error('❌ Error inserting participants:', participantsError);
            return;
        }
        console.log('✅ Participants added successfully');
        
        console.log('\n🎉 All tests passed! Conversation creation works.');
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testSimpleConversation().catch(console.error);
