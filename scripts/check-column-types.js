#!/usr/bin/env node

/**
 * Check column data types in posts and profiles tables
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

async function checkColumnTypes() {
    console.log('🔍 Checking column data types...\n');
    
    // Check posts table columns using SQL query
    const { data: postsColumns, error: postsError } = await supabase
        .rpc('check_posts_columns');
    
    if (postsError) {
        // Fallback: use direct SQL query
        const { data: fallbackData, error: fallbackError } = await supabase
            .from('posts')
            .select('*')
            .limit(1);
            
        if (!fallbackError && fallbackData.length > 0) {
            console.log('📋 POSTS table sample data structure:');
            Object.keys(fallbackData[0]).forEach(key => {
                const value = fallbackData[0][key];
                const type = typeof value;
                console.log(`  ${key}: ${type} (example: ${value})`);
            });
        } else {
            console.error('❌ Error checking posts:', postsError);
        }
    }
    
    // Check profiles table
    const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
        
    if (!profilesError && profilesData.length > 0) {
        console.log('\n👤 PROFILES table sample data structure:');
        Object.keys(profilesData[0]).forEach(key => {
            const value = profilesData[0][key];
            const type = typeof value;
            console.log(`  ${key}: ${type} (example: ${value})`);
        });
    } else {
        console.error('❌ Error checking profiles:', profilesError);
    }
}

checkColumnTypes().catch(console.error);
