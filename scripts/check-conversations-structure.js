#!/usr/bin/env node

/**
 * Check conversations table structure
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

console.log('🔗 Connecting to Supabase CLOUD:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConversationsStructure() {
    console.log('🔍 Checking conversations table structure...\n');
    
    // Check if conversations table exists
    const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .limit(1);
    
    if (convError) {
        console.error('❌ Error checking conversations table:', convError);
        
        // Try to check if table exists at all
        const { data: tableCheck, error: tableError } = await supabase
            .from('conversations')
            .select('id')
            .limit(0);
            
        if (tableError) {
            console.error('❌ conversations table does not exist:', tableError);
        }
    } else {
        console.log('✅ conversations table exists');
        if (conversations.length > 0) {
            console.log('📋 Sample data structure:');
            Object.keys(conversations[0]).forEach(key => {
                const value = conversations[0][key];
                const type = typeof value;
                console.log(`  ${key}: ${type} (example: ${value})`);
            });
        } else {
            console.log('📋 Table is empty, checking structure via direct query...');
        }
    }
    
    // Check conversation_participants table
    console.log('\n🔍 Checking conversation_participants table structure...\n');
    
    const { data: participants, error: partError } = await supabase
        .from('conversation_participants')
        .select('*')
        .limit(1);
    
    if (partError) {
        console.error('❌ Error checking conversation_participants table:', partError);
    } else {
        console.log('✅ conversation_participants table exists');
        if (participants.length > 0) {
            console.log('📋 Sample data structure:');
            Object.keys(participants[0]).forEach(key => {
                const value = participants[0][key];
                const type = typeof value;
                console.log(`  ${key}: ${type} (example: ${value})`);
            });
        } else {
            console.log('📋 Table is empty, no existing structure to show');
        }
    }
}

checkConversationsStructure().catch(console.error);
