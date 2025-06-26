#!/usr/bin/env node

/**
 * Stories Sample Data Population Script
 * Populates the stories table with sample data for testing
 * 
 * Usage: node scripts/populate-stories-data.js
 * 
 * This script will:
 * 1. Connect to Supabase database
 * 2. Clean existing sample stories data
 * 3. Insert comprehensive sample stories data
 * 4. Verify successful population
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔗 Connecting to Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Global variables
let userIds = {};
let storyIds = {};

/**
 * Get existing user IDs for story creators
 */
async function getUserIds() {
    console.log('👤 Getting existing user IDs...');
    
    // Get users from profiles table with full info
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(`
            user_id,
            username,
            full_name,
            avatar_url
        `)
        .limit(20);

    if (!profileError && profiles && profiles.length > 0) {
        // Store user info from profiles
        profiles.forEach((profile, index) => {
            userIds[`user_${index + 1}`] = {
                id: profile.user_id,
                name: profile.full_name || profile.username || `User ${index + 1}`,
                avatar: profile.avatar_url || '/placeholder.svg?height=40&width=40'
            };
        });
        console.log(`✅ Found ${profiles.length} users from profiles for story creation`);
        return;
    }

    console.warn('⚠️ No profiles found, stories will use fallback user data');
}

/**
 * Clean existing sample stories data
 */
async function cleanStoriesData() {
    console.log('🧹 Cleaning existing stories data...');
    
    const { error } = await supabase
        .from('stories')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) {
        console.warn('⚠️ Warning cleaning stories:', error.message);
    } else {
        console.log('✅ Stories data cleaned');
    }
}

/**
 * Insert sample stories
 */
async function insertStories() {
    console.log('📸 Inserting sample stories...');
    
    // Get creator IDs (use first available user or create default)
    const creators = Object.values(userIds);
    const defaultCreator = creators[0] || null;
    
    if (!defaultCreator) {
        console.error('❌ No users found to create stories');
        return [];
    }

    const stories = [
        {
            author_id: defaultCreator.id,
            content: 'Just finished my English speaking practice! 🎯 Feeling more confident every day 💪',
            media_url: '/placeholder.svg?height=600&width=400',
            media_type: 'image',
            background_color: '#FF6B6B',
            text_color: '#FFFFFF',
            duration: 24,
            is_active: true,
            views_count: 25,
            expires_at: new Date(Date.now() + 23 * 60 * 60 * 1000) // 23 hours from now
        },
        {
            author_id: creators[1]?.id || defaultCreator.id,
            content: 'TOEFL prep session completed! 📚 Ready for the exam next week 🚀',
            media_url: '/placeholder.svg?height=600&width=400',
            media_type: 'image',
            background_color: '#4ECDC4',
            text_color: '#FFFFFF',
            duration: 24,
            is_active: true,
            views_count: 18,
            expires_at: new Date(Date.now() + 22 * 60 * 60 * 1000) // 22 hours from now
        },
        {
            author_id: creators[2]?.id || defaultCreator.id,
            content: 'Amazing pronunciation workshop today! 🗣️ Thanks to everyone who joined',
            media_url: '/placeholder.svg?height=600&width=400',
            media_type: 'image',
            background_color: '#45B7D1',
            text_color: '#FFFFFF',
            duration: 24,
            is_active: true,
            views_count: 32,
            expires_at: new Date(Date.now() + 21 * 60 * 60 * 1000) // 21 hours from now
        },
        {
            author_id: creators[3]?.id || defaultCreator.id,
            content: 'Grammar challenge winner! 🏆 100% correct answers in today\'s quiz',
            media_url: '/placeholder.svg?height=600&width=400',
            media_type: 'image',
            background_color: '#F7DC6F',
            text_color: '#2C3E50',
            duration: 24,
            is_active: true,
            views_count: 45,
            expires_at: new Date(Date.now() + 20 * 60 * 60 * 1000) // 20 hours from now
        },
        {
            author_id: creators[4]?.id || defaultCreator.id,
            content: 'Business English meeting went great! 💼 Closed the deal in English 🎉',
            media_url: '/placeholder.svg?height=600&width=400',
            media_type: 'image',
            background_color: '#8E44AD',
            text_color: '#FFFFFF',
            duration: 24,
            is_active: true,
            views_count: 28,
            expires_at: new Date(Date.now() + 19 * 60 * 60 * 1000) // 19 hours from now
        },
        {
            author_id: creators[5]?.id || defaultCreator.id,
            content: 'Movie night was awesome! 🎬 Watched Pride and Prejudice - great for British English',
            media_url: '/placeholder.svg?height=600&width=400',
            media_type: 'image',
            background_color: '#E74C3C',
            text_color: '#FFFFFF',
            duration: 24,
            is_active: true,
            views_count: 21,
            expires_at: new Date(Date.now() + 18 * 60 * 60 * 1000) // 18 hours from now
        },
        {
            author_id: creators[6]?.id || defaultCreator.id,
            content: 'Debate tournament prep 🎭 Working on my argumentation skills',
            media_url: '/placeholder.svg?height=600&width=400',
            media_type: 'image',
            background_color: '#2ECC71',
            text_color: '#FFFFFF',
            duration: 24,
            is_active: true,
            views_count: 15,
            expires_at: new Date(Date.now() + 17 * 60 * 60 * 1000) // 17 hours from now
        },
        {
            author_id: creators[7]?.id || defaultCreator.id,
            content: 'Study group session 📖 Learning with friends makes it so much better!',
            media_url: '/placeholder.svg?height=600&width=400',
            media_type: 'image',
            background_color: '#9B59B6',
            text_color: '#FFFFFF',
            duration: 24,
            is_active: true,
            views_count: 38,
            expires_at: new Date(Date.now() + 16 * 60 * 60 * 1000) // 16 hours from now
        },
        {
            author_id: creators[8]?.id || defaultCreator.id,
            content: 'Writing workshop feedback received! ✍️ Time to revise my essay',
            media_url: '/placeholder.svg?height=600&width=400',
            media_type: 'image',
            background_color: '#F39C12',
            text_color: '#FFFFFF',
            duration: 24,
            is_active: true,
            views_count: 12,
            expires_at: new Date(Date.now() + 15 * 60 * 60 * 1000) // 15 hours from now
        },
        {
            author_id: creators[9]?.id || defaultCreator.id,
            content: 'Listening comprehension improved! 👂 Understanding native speakers better',
            media_url: '/placeholder.svg?height=600&width=400',
            media_type: 'image',
            background_color: '#1ABC9C',
            text_color: '#FFFFFF',
            duration: 24,
            is_active: true,
            views_count: 29,
            expires_at: new Date(Date.now() + 14 * 60 * 60 * 1000) // 14 hours from now
        }
    ];

    const { data, error } = await supabase
        .from('stories')
        .insert(stories)
        .select();

    if (error) throw error;

    // Store story IDs for reference
    data.forEach((story, index) => {
        storyIds[`story_${index + 1}`] = story.id;
    });

    console.log(`✅ Inserted ${data.length} stories`);
    return data;
}

/**
 * Insert some story views for engagement
 */
async function insertStoryViews() {
    console.log('👀 Adding story views...');
    
    const allStoryIds = Object.values(storyIds);
    const allUserIds = Object.values(userIds).map(u => u.id);
    
    const storyViews = [];
    
    // Add random views for each story
    allStoryIds.forEach(storyId => {
        // Each story gets 3-8 random views
        const viewCount = Math.floor(Math.random() * 6) + 3;
        const shuffledUsers = [...allUserIds].sort(() => 0.5 - Math.random()).slice(0, viewCount);
        
        shuffledUsers.forEach(userId => {
            storyViews.push({
                story_id: storyId,
                viewer_id: userId,
                viewed_at: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000) // Random time in last 12 hours
            });
        });
    });

    const { data, error } = await supabase
        .from('story_views')
        .insert(storyViews)
        .select();

    if (error) {
        console.warn('⚠️ Warning adding story views:', error.message);
    } else {
        console.log(`✅ Added ${data.length} story views`);
    }
}

/**
 * Verify data insertion
 */
async function verifyStories() {
    console.log('🔍 Verifying stories data...');
    
    const { data, error } = await supabase
        .from('stories')
        .select(`
            *,
            author:users!author_id(id, email),
            profile:profiles!inner(user_id, username, full_name, avatar_url)
        `)
        .eq('profiles.user_id', 'stories.author_id')
        .order('created_at', { ascending: false });

    if (error) {
        console.warn('⚠️ Warning in verification:', error.message);
        // Fallback - get stories without join
        const { data: storiesData, error: storiesError } = await supabase
            .from('stories')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (storiesError) throw storiesError;
        
        console.log(`✅ Found ${storiesData.length} stories in database`);
        
        // Show active stories without author info
        const activeStories = storiesData.filter(story => story.is_active && new Date(story.expires_at) > new Date());
        console.log(`📱 ${activeStories.length} active stories:`);
        
        activeStories.slice(0, 5).forEach(story => {
            const content = story.content?.substring(0, 50) + '...';
            console.log(`   - Story: ${content}`);
        });
        
        return storiesData;
    }

    console.log(`✅ Found ${data.length} stories in database`);
    
    // Show active stories
    const activeStories = data.filter(story => story.is_active && new Date(story.expires_at) > new Date());
    console.log(`📱 ${activeStories.length} active stories:`);
    
    activeStories.slice(0, 5).forEach(story => {
        const authorName = story.profile?.full_name || story.profile?.username || 'Unknown';
        const content = story.content?.substring(0, 50) + '...';
        console.log(`   - ${authorName}: ${content}`);
    });
    
    return data;
}

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('🚀 Starting stories data population...');
        
        await getUserIds();
        await cleanStoriesData();
        await insertStories();
        await insertStoryViews();
        await verifyStories();
        
        console.log('✅ Stories data population completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during stories data population:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    getUserIds,
    cleanStoriesData,
    insertStories,
    insertStoryViews,
    verifyStories
};
