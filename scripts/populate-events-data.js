#!/usr/bin/env node

/**
 * Events Sample Data Population Script
 * Populates the events table with sample data for testing
 * 
 * Usage: node scripts/populate-events-data.js
 * 
 * This script will:
 * 1. Connect to Supabase database
 * 2. Clean existing sample events data
 * 3. Insert comprehensive sample events data
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
let eventIds = {};

/**
 * Get existing user IDs for event creators
 */
async function getUserIds() {
    console.log('👤 Getting existing user IDs...');
    
    const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .limit(10);

    if (error) {
        console.warn('⚠️ Warning getting users:', error.message);
        return;
    }

    // Store user IDs by email for reference
    data.forEach(user => {
        const emailKey = user.email.split('@')[0].replace('.', '_');
        userIds[emailKey] = user.id;
    });

    console.log(`✅ Found ${data.length} users for event creation`);
}

/**
 * Clean existing sample events data
 */
async function cleanEventsData() {
    console.log('🧹 Cleaning existing events data...');
    
    const { error } = await supabase
        .from('events')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) {
        console.warn('⚠️ Warning cleaning events:', error.message);
    } else {
        console.log('✅ Events data cleaned');
    }
}

/**
 * Insert sample events
 */
async function insertEvents() {
    console.log('📅 Inserting sample events...');
    
    // Get creator IDs (use first available user or create default)
    const creatorIds = Object.values(userIds);
    const defaultCreatorId = creatorIds[0] || null;
    
    const events = [
        {
            title: 'English Conversation Club',
            description: 'Join our weekly English conversation practice session. Perfect for intermediate learners who want to improve their speaking skills in a friendly, supportive environment.',
            start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
            location: 'Online via Zoom',
            is_online: true,
            online_link: 'https://zoom.us/j/123456789',
            max_attendees: 20,
            current_attendees: 12,
            event_type: 'study_group',
            difficulty_level: 'intermediate',
            tags: ['conversation', 'speaking', 'practice', 'online'],
            is_public: true,
            is_active: true,
            created_by: defaultCreatorId
        },
        {
            title: 'TOEFL Preparation Workshop',
            description: 'Intensive TOEFL preparation workshop covering all four sections: Reading, Listening, Speaking, and Writing. Includes practice tests and personalized feedback.',
            start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours duration
            location: 'University Language Center, Room 204',
            is_online: false,
            online_link: null,
            max_attendees: 30,
            current_attendees: 18,
            event_type: 'workshop',
            difficulty_level: 'intermediate',
            tags: ['toefl', 'exam', 'preparation', 'workshop'],
            is_public: true,
            is_active: true,
            created_by: creatorIds[1] || defaultCreatorId
        },
        {
            title: 'Business English Networking Event',
            description: 'Network with other business English learners and professionals. Practice professional communication skills while making valuable connections.',
            start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
            location: 'Downtown Business Center, Conference Hall A',
            is_online: false,
            online_link: null,
            max_attendees: 50,
            current_attendees: 35,
            event_type: 'social',
            difficulty_level: 'advanced',
            tags: ['business', 'networking', 'professional', 'communication'],
            is_public: true,
            is_active: true,
            created_by: creatorIds[2] || defaultCreatorId
        },
        {
            title: 'English Pronunciation Bootcamp',
            description: 'Intensive pronunciation training focusing on American English sounds, stress patterns, and intonation. Perfect for beginners struggling with pronunciation.',
            start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000), // 2.5 hours duration
            location: 'Online via Microsoft Teams',
            is_online: true,
            online_link: 'https://teams.microsoft.com/l/meetup-join/pronunciation-bootcamp',
            max_attendees: 15,
            current_attendees: 8,
            event_type: 'workshop',
            difficulty_level: 'beginner',
            tags: ['pronunciation', 'speaking', 'phonetics', 'beginner'],
            is_public: true,
            is_active: true,
            created_by: creatorIds[3] || defaultCreatorId
        },
        {
            title: 'English Grammar Challenge Competition',
            description: 'Test your grammar knowledge in this fun, competitive environment. Prizes for top performers! Open to all levels with different difficulty categories.',
            start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
            end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000), // 1.5 hours duration
            location: 'Online Competition Platform',
            is_online: true,
            online_link: 'https://englishchallenge.com/grammar-competition',
            max_attendees: 100,
            current_attendees: 45,
            event_type: 'competition',
            difficulty_level: 'all',
            tags: ['grammar', 'competition', 'challenge', 'prizes'],
            is_public: true,
            is_active: true,
            created_by: creatorIds[4] || defaultCreatorId
        },
        {
            title: 'Academic Writing Workshop',
            description: 'Learn the fundamentals of academic English writing. Perfect for students preparing for university or academic career. Covers essay structure, citations, and academic vocabulary.',
            start_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
            end_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
            location: 'University Library, Seminar Room 3',
            is_online: false,
            online_link: null,
            max_attendees: 25,
            current_attendees: 20,
            event_type: 'workshop',
            difficulty_level: 'advanced',
            tags: ['writing', 'academic', 'university', 'research'],
            is_public: true,
            is_active: true,
            created_by: creatorIds[0] || defaultCreatorId
        },
        {
            title: 'English Movie Night & Discussion',
            description: 'Watch a classic English movie and discuss it afterwards. Great way to improve listening skills and cultural understanding while having fun!',
            start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
            end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3.5 * 60 * 60 * 1000), // 3.5 hours duration
            location: 'Student Center, Auditorium B',
            is_online: false,
            online_link: null,
            max_attendees: 60,
            current_attendees: 25,
            event_type: 'social',
            difficulty_level: 'intermediate',
            tags: ['movie', 'listening', 'culture', 'discussion'],
            is_public: true,
            is_active: true,
            created_by: creatorIds[1] || defaultCreatorId
        },
        {
            title: 'English Debate Tournament',
            description: 'Participate in structured English debates on current topics. Excellent for improving argumentation skills, critical thinking, and fluency.',
            start_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days from now
            end_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours duration
            location: 'Hybrid - Main Campus + Online',
            is_online: true,
            online_link: 'https://debate-platform.com/english-tournament',
            max_attendees: 40,
            current_attendees: 28,
            event_type: 'competition',
            difficulty_level: 'advanced',
            tags: ['debate', 'argumentation', 'critical-thinking', 'tournament'],
            is_public: true,
            is_active: true,
            created_by: creatorIds[2] || defaultCreatorId
        },
        {
            title: 'English Learning Study Group',
            description: 'Weekly study group for English learners of all levels. Collaborative learning environment with peer support and group activities.',
            start_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
            end_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
            location: 'Library Study Room 12',
            is_online: false,
            online_link: null,
            max_attendees: 12,
            current_attendees: 7,
            event_type: 'study_group',
            difficulty_level: 'all',
            tags: ['study-group', 'collaborative', 'weekly', 'peer-support'],
            is_public: true,
            is_active: true,
            created_by: creatorIds[3] || defaultCreatorId
        },
        {
            title: 'English Presentation Skills Webinar',
            description: 'Learn how to give effective presentations in English. Covers structure, delivery techniques, handling Q&A, and overcoming presentation anxiety.',
            start_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
            end_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
            location: 'Online Webinar',
            is_online: true,
            online_link: 'https://webinar.englishskills.com/presentations',
            max_attendees: 80,
            current_attendees: 52,
            event_type: 'webinar',
            difficulty_level: 'intermediate',
            tags: ['presentation', 'public-speaking', 'webinar', 'skills'],
            is_public: true,
            is_active: true,
            created_by: creatorIds[4] || defaultCreatorId
        }
    ];

    const { data, error } = await supabase
        .from('events')
        .insert(events)
        .select();

    if (error) throw error;

    // Store event IDs for reference
    data.forEach((event, index) => {
        eventIds[`event_${index + 1}`] = event.id;
    });

    console.log(`✅ Inserted ${data.length} events`);
    return data;
}

/**
 * Verify data insertion
 */
async function verifyEvents() {
    console.log('🔍 Verifying events data...');
    
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

    if (error) throw error;

    console.log(`✅ Found ${data.length} events in database`);
    
    // Show upcoming events
    const upcomingEvents = data.filter(event => new Date(event.start_date) > new Date());
    console.log(`📅 ${upcomingEvents.length} upcoming events:`);
    
    upcomingEvents.slice(0, 5).forEach(event => {
        console.log(`   - ${event.title} (${new Date(event.start_date).toLocaleDateString()})`);
    });
    
    return data;
}

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('🚀 Starting events data population...');
        
        await getUserIds();
        await cleanEventsData();
        await insertEvents();
        await verifyEvents();
        
        console.log('✅ Events data population completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during events data population:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    getUserIds,
    cleanEventsData,
    insertEvents,
    verifyEvents
};
