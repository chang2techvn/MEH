#!/usr/bin/env node

/**
 * Check actual structure of conversations and conversation_participants tables
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

async function checkTablesStructure() {
    console.log('🚀 Checking conversations tables structure...\n');
    
    // Check conversations table structure
    console.log('📋 Checking conversations table:');
    const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .limit(1);
    
    if (conversationsError) {
        console.error('❌ Error accessing conversations:', conversationsError);
    } else {
        if (conversationsData.length > 0) {
            console.log('✅ conversations table exists with columns:');
            Object.keys(conversationsData[0]).forEach(column => {
                console.log(`  - ${column}`);
            });
        } else {
            console.log('✅ conversations table exists but is empty');
            
            // Try to get table info from information_schema
            const { data: columnsInfo, error: columnsError } = await supabase
                .rpc('get_table_columns', { table_name: 'conversations' });
                
            if (!columnsError && columnsInfo) {
                console.log('📊 Column information from schema:');
                columnsInfo.forEach(col => {
                    console.log(`  - ${col.column_name} (${col.data_type})`);
                });
            }
        }
    }
    
    // Check conversation_participants table structure
    console.log('\n👥 Checking conversation_participants table:');
    const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('*')
        .limit(1);
    
    if (participantsError) {
        console.error('❌ Error accessing conversation_participants:', participantsError);
    } else {
        if (participantsData.length > 0) {
            console.log('✅ conversation_participants table exists with columns:');
            Object.keys(participantsData[0]).forEach(column => {
                console.log(`  - ${column}`);
            });
        } else {
            console.log('✅ conversation_participants table exists but is empty');
        }
    }
    
    // Try a simple test insert to see what columns are expected
    console.log('\n🧪 Testing simple insert to understand schema:');
    const { data: testData, error: testError } = await supabase
        .from('conversations')
        .insert({
            type: 'direct',
            participants_count: 2
        })
        .select()
        .single();
    
    if (testError) {
        console.error('❌ Test insert error:', testError);
        console.log('This tells us what columns are required/expected');
    } else {
        console.log('✅ Test insert successful:');
        Object.keys(testData).forEach(column => {
            console.log(`  - ${column}: ${testData[column]}`);
        });
        
        // Cleanup test data
        await supabase.from('conversations').delete().eq('id', testData.id);
        console.log('🧹 Cleaned up test data');
    }
}

checkTablesStructure().catch(console.error);
