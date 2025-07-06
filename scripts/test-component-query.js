#!/usr/bin/env node

/**
 * Test the exact query that the component is making
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

async function testComponentQuery() {
    console.log('🚀 Testing component query exactly...\n');
    
    // Simulate being authenticated as john.smith
    const currentUserId = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3'; // john.smith's ID from auth.users
    
    console.log(`🔍 Fetching users excluding current user: ${currentUserId}\n`);
    
    // Test the exact query the component makes
    const { data: users, error } = await supabase
        .from('users')
        .select(`
          id, 
          email, 
          last_login,
          profiles!inner (
            username,
            full_name,
            avatar_url
          )
        `)
        .neq('id', currentUserId)
        .eq('is_active', true)
        .order('last_login', { ascending: false })
        .range(0, 19);
    
    if (error) {
        console.error('❌ Error with component query:', error);
        
        // Try a simpler version
        console.log('\n🔄 Trying simpler query without inner join...');
        const { data: simpleUsers, error: simpleError } = await supabase
            .from('users')
            .select(`
              id, 
              email, 
              last_login,
              profiles (
                username,
                full_name,
                avatar_url
              )
            `)
            .neq('id', currentUserId)
            .eq('is_active', true)
            .limit(10);
            
        if (simpleError) {
            console.error('❌ Error with simple query:', simpleError);
        } else {
            console.log('✅ Simple query successful:');
            simpleUsers.forEach((user, index) => {
                const profile = user.profiles?.[0] || {};
                console.log(`  ${index + 1}. ${user.email} - ${profile.full_name || 'No name'}`);
            });
        }
    } else {
        console.log('✅ Component query successful:');
        users.forEach((user, index) => {
            const profile = user.profiles?.[0] || {};
            console.log(`  ${index + 1}. ${user.email} - ${profile.full_name || 'No name'}`);
        });
    }
}

testComponentQuery().catch(console.error);
