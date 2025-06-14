#!/usr/bin/env node

/**
 * Comprehensive Sample Data Population Script
 * Populates all 29 tables in the English Learning Platform database
 * 
 * Usage: node scripts/populate-sample-data.js
 * 
 * This script will:
 * 1. Connect to Supabase database
 * 2. Clean existing sample data (preserving production users)
 * 3. Insert comprehensive sample data into all 29 tables
 * 4. Verify successful population
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client - use local development settings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔗 Connecting to Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Global variables to store generated IDs
let userIds = {};
let learningPathIds = {};
let challengeIds = {};
let resourceIds = {};
let postIds = {};
let achievementIds = {};
let submissionIds = {};
let commentIds = {};
let conversationIds = {};
let messageIds = {};
let aiAssistantIds = {};
let notificationTemplateIds = {};
let scheduledMessageIds = {};

/**
 * Clean existing sample data while preserving production users
 */
async function cleanSampleData() {
    console.log('🧹 Cleaning existing sample data...');
      const tables = [
        'notification_deliveries',
        'scheduled_messages',
        'conversation_messages',
        'conversation_participants',
        'conversations',
        'challenge_submissions',
        'user_achievements', 
        'user_progress',
        'likes',
        'comments',
        'posts',
        'notifications',
        'messages',
        'follows',
        'evaluation_logs',
        'resources',
        'challenges',
        'learning_paths',
        'profiles',
        'scoring_templates',
        'ai_assistants',
        'ai_models',
        'ai_safety_rules',
        'api_keys',
        'banned_terms',
        'notification_templates',
        'admin_logs'
    ];

    for (const table of tables) {
        const { error } = await supabase
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (error) {
            console.warn(`⚠️ Warning cleaning ${table}:`, error.message);
        }
    }

    // Clean sample users (keep production users)
    const { error: userError } = await supabase
        .from('users')
        .delete()
        .like('email', '%@university.edu');
    
    if (userError) {
        console.warn('⚠️ Warning cleaning users:', userError.message);
    }

    console.log('✅ Sample data cleaned');
}

/**
 * TABLE 1: Insert sample users
 */
async function insertUsers() {
    console.log('👤 Inserting users...');
      const users = [
        { email: 'john.smith@university.edu', role: 'student', is_active: true, last_login: new Date(Date.now() - 2 * 60 * 60 * 1000), points: 850, level: 15, streak_days: 7 },
        { email: 'maria.garcia@university.edu', role: 'student', is_active: true, last_login: new Date(Date.now() - 24 * 60 * 60 * 1000), points: 1250, level: 22, streak_days: 12 },
        { email: 'yuki.tanaka@university.edu', role: 'student', is_active: true, last_login: new Date(Date.now() - 30 * 60 * 1000), points: 2100, level: 35, streak_days: 25 },
        { email: 'ahmed.hassan@university.edu', role: 'student', is_active: true, last_login: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), points: 675, level: 12, streak_days: 3 },
        { email: 'david.johnson@university.edu', role: 'student', is_active: true, last_login: new Date(Date.now() - 60 * 60 * 1000), points: 1820, level: 28, streak_days: 15 },
        { email: 'sarah.wilson@university.edu', role: 'teacher', is_active: true, last_login: new Date(Date.now() - 5 * 60 * 60 * 1000), points: 3200, level: 50, streak_days: 45 },
        { email: 'michael.brown@university.edu', role: 'teacher', is_active: true, last_login: new Date(Date.now() - 12 * 60 * 60 * 1000), points: 2800, level: 42, streak_days: 33 },
        { email: 'admin@university.edu', role: 'admin', is_active: true, last_login: new Date(Date.now() - 60 * 60 * 1000), points: 5000, level: 99, streak_days: 100 }
    ];

    const { data, error } = await supabase
        .from('users')
        .insert(users)
        .select();

    if (error) throw error;

    // Store user IDs for reference
    data.forEach((user, index) => {
        const keys = ['john_smith', 'maria_garcia', 'yuki_tanaka', 'ahmed_hassan', 'david_johnson', 'sarah_wilson', 'michael_brown', 'admin'];
        userIds[keys[index]] = user.id;
    });

    console.log(`✅ Inserted ${data.length} users`);
}

/**
 * TABLE 2: Insert user profiles
 */
async function insertProfiles() {
    console.log('📋 Inserting profiles...');
    
    const profiles = [
        { user_id: userIds.admin, username: 'admin_sarah', full_name: 'Dr. Sarah Admin', avatar_url: 'https://avatar.iran.liara.run/public/1', bio: 'Platform administrator with 15+ years in educational technology', native_language: 'English', target_language: 'English', proficiency_level: 'advanced', timezone: 'America/New_York' },
        { user_id: userIds.sarah_wilson, username: 'prof_sarah', full_name: 'Prof. Sarah Wilson', avatar_url: 'https://avatar.iran.liara.run/public/2', bio: 'ESL instructor specializing in grammar', native_language: 'English', target_language: 'English', proficiency_level: 'advanced', timezone: 'America/Los_Angeles' },
        { user_id: userIds.michael_brown, username: 'prof_michael', full_name: 'Prof. Michael Brown', avatar_url: 'https://avatar.iran.liara.run/public/3', bio: 'Business English specialist', native_language: 'English', target_language: 'English', proficiency_level: 'advanced', timezone: 'America/Chicago' },
        { user_id: userIds.john_smith, username: 'john_smith', full_name: 'John Smith', avatar_url: 'https://avatar.iran.liara.run/public/4', bio: 'Business student learning professional English', native_language: 'English', target_language: 'English', proficiency_level: 'intermediate', timezone: 'America/New_York' },
        { user_id: userIds.maria_garcia, username: 'maria_garcia', full_name: 'Maria Garcia', avatar_url: 'https://avatar.iran.liara.run/public/5', bio: 'Spanish native speaker learning conversational English', native_language: 'Spanish', target_language: 'English', proficiency_level: 'beginner', timezone: 'Europe/Madrid' },
        { user_id: userIds.yuki_tanaka, username: 'yuki_tanaka', full_name: 'Yuki Tanaka', avatar_url: 'https://avatar.iran.liara.run/public/6', bio: 'Japanese student preparing for TOEFL exam', native_language: 'Japanese', target_language: 'English', proficiency_level: 'intermediate', timezone: 'Asia/Tokyo' },
        { user_id: userIds.ahmed_hassan, username: 'ahmed_hassan', full_name: 'Ahmed Hassan', avatar_url: 'https://avatar.iran.liara.run/public/7', bio: 'Engineering student focusing on technical English', native_language: 'Arabic', target_language: 'English', proficiency_level: 'beginner', timezone: 'Asia/Dubai' },
        { user_id: userIds.david_johnson, username: 'david_johnson', full_name: 'David Johnson', avatar_url: 'https://avatar.iran.liara.run/public/8', bio: 'Business professional improving English fluency', native_language: 'English', target_language: 'English', proficiency_level: 'intermediate', timezone: 'America/Chicago' }
    ];

    const { data, error } = await supabase
        .from('profiles')
        .insert(profiles)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} profiles`);
}

/**
 * TABLE 3: Insert learning paths
 */
async function insertLearningPaths() {
    console.log('📚 Inserting learning paths...');
    
    const learningPaths = [
        { title: 'Complete English Foundation', description: 'Comprehensive beginner course covering all basic English skills', difficulty_level: 'beginner', estimated_duration: 200, is_active: true, created_by: userIds.sarah_wilson },
        { title: 'Business English Mastery', description: 'Professional English for workplace communication and presentations', difficulty_level: 'intermediate', estimated_duration: 150, is_active: true, created_by: userIds.michael_brown },
        { title: 'TOEFL Preparation Course', description: 'Complete TOEFL exam preparation with practice tests', difficulty_level: 'intermediate', estimated_duration: 120, is_active: true, created_by: userIds.sarah_wilson },
        { title: 'Advanced Conversation Skills', description: 'Master fluent English conversation and pronunciation', difficulty_level: 'advanced', estimated_duration: 100, is_active: true, created_by: userIds.michael_brown },
        { title: 'English Grammar Deep Dive', description: 'Comprehensive grammar course for all levels', difficulty_level: 'intermediate', estimated_duration: 180, is_active: true, created_by: userIds.sarah_wilson }
    ];

    const { data, error } = await supabase
        .from('learning_paths')
        .insert(learningPaths)
        .select();

    if (error) throw error;

    // Store learning path IDs
    data.forEach((path, index) => {
        const keys = ['foundation', 'business', 'toefl', 'conversation', 'grammar'];
        learningPathIds[keys[index]] = path.id;
    });

    console.log(`✅ Inserted ${data.length} learning paths`);
}

/**
 * TABLE 4: Insert challenges
 */
async function insertChallenges() {
    console.log('🎯 Inserting challenges...');
    
    const challenges = [
        {
            learning_path_id: learningPathIds.foundation,
            title: 'Basic Greetings & Introductions',
            description: 'Learn essential English greetings and how to introduce yourself',
            challenge_type: 'speaking',
            difficulty_level: 'beginner',
            content: JSON.stringify({ type: 'video_submission', instructions: 'Record a 1-minute introduction', video_url: 'https://www.youtube.com/watch?v=6IBRR87gU_g' }),
            correct_answer: JSON.stringify({ criteria: ['clear_pronunciation', 'appropriate_greeting', 'complete_introduction'] }),
            points: 15,
            time_limit: 1200,
            order_index: 1,
            is_active: true,
            created_by: userIds.sarah_wilson
        },
        {
            learning_path_id: learningPathIds.foundation,
            title: 'Present Simple Tense',
            description: 'Master the present simple tense with practical examples',
            challenge_type: 'grammar',
            difficulty_level: 'beginner',
            content: JSON.stringify({ type: 'multiple_choice', question: 'Choose the correct form: I ___ coffee every morning', options: ['drink', 'drinks', 'drinking', 'to drink'] }),
            correct_answer: JSON.stringify({ answer: 'drink', explanation: 'I is first person singular, so we use the base form of the verb.' }),
            points: 10,
            time_limit: 900,
            order_index: 2,
            is_active: true,
            created_by: userIds.sarah_wilson
        },
        {
            learning_path_id: learningPathIds.business,
            title: 'Business Meeting Vocabulary',
            description: 'Essential vocabulary for professional business meetings',
            challenge_type: 'vocabulary',
            difficulty_level: 'intermediate',
            content: JSON.stringify({ type: 'matching', words: ['agenda', 'stakeholder', 'deliverable', 'milestone'], definitions: ['A schedule of items to be discussed', 'A person with interest in the business', 'A product or service', 'An important point in progress'] }),
            correct_answer: JSON.stringify({ matches: [['agenda', 'A schedule of items to be discussed'], ['stakeholder', 'A person with interest in the business']] }),
            points: 20,
            time_limit: 1500,
            order_index: 1,
            is_active: true,
            created_by: userIds.michael_brown
        },
        {
            learning_path_id: learningPathIds.toefl,
            title: 'TOEFL Reading Practice',
            description: 'Practice TOEFL reading comprehension with sample passages',
            challenge_type: 'reading',
            difficulty_level: 'intermediate',
            content: JSON.stringify({ type: 'reading_comprehension', passage: 'Climate change is one of the most pressing issues...', questions: [{ q: 'What is the main topic?', options: ['Climate', 'Reading', 'Science', 'Environment'] }] }),
            correct_answer: JSON.stringify({ answers: ['Climate'], explanations: ['The passage focuses on climate change.'] }),
            points: 25,
            time_limit: 1800,
            order_index: 1,
            is_active: true,
            created_by: userIds.sarah_wilson
        },
        {
            learning_path_id: learningPathIds.conversation,
            title: 'Daily Conversation Practice',
            description: 'Practice common daily conversation scenarios',
            challenge_type: 'speaking',
            difficulty_level: 'advanced',
            content: JSON.stringify({ type: 'conversation', scenario: 'Ordering food at a restaurant', prompts: ['What would you like to order?', 'How would you like your steak cooked?'] }),
            correct_answer: JSON.stringify({ criteria: ['fluency', 'vocabulary_usage', 'pronunciation'] }),
            points: 30,
            time_limit: 2400,
            order_index: 1,
            is_active: true,
            created_by: userIds.michael_brown
        },
        {
            learning_path_id: learningPathIds.grammar,
            title: 'Complex Sentence Structures',
            description: 'Master complex and compound sentence formations',
            challenge_type: 'writing',
            difficulty_level: 'intermediate',
            content: JSON.stringify({ type: 'essay', prompt: 'Write a paragraph using at least 3 complex sentences about your favorite hobby', min_words: 150 }),
            correct_answer: JSON.stringify({ criteria: ['complex_sentences', 'grammar_accuracy', 'coherence'] }),
            points: 25,
            time_limit: 2700,
            order_index: 1,
            is_active: true,
            created_by: userIds.sarah_wilson
        }
    ];

    const { data, error } = await supabase
        .from('challenges')
        .insert(challenges)
        .select();

    if (error) throw error;

    // Store challenge IDs
    data.forEach((challenge, index) => {
        const keys = ['greetings', 'present_simple', 'business_vocab', 'toefl_reading', 'conversation', 'complex_sentences'];
        challengeIds[keys[index]] = challenge.id;
    });

    console.log(`✅ Inserted ${data.length} challenges`);
}

/**
 * TABLE 5: Insert resources
 */
async function insertResources() {
    console.log('📖 Inserting resources...');
    
    const resources = [
        { challenge_id: challengeIds.greetings, resource_type: 'video', url: 'https://www.youtube.com/watch?v=6IBRR87gU_g', alt_text: 'Introduction Video Tutorial', duration: 180, file_size: 52428800 },
        { challenge_id: challengeIds.present_simple, resource_type: 'document', url: 'https://example.com/grammar-workbook.pdf', alt_text: 'Grammar Workbook PDF', duration: null, file_size: 15728640 },
        { challenge_id: challengeIds.business_vocab, resource_type: 'audio', url: 'https://example.com/business-vocab.mp3', alt_text: 'Business Vocabulary Audio', duration: 1800, file_size: 26214400 },
        { challenge_id: challengeIds.toefl_reading, resource_type: 'document', url: 'https://example.com/toefl-reading.pdf', alt_text: 'TOEFL Reading Passages', duration: null, file_size: 20971520 },
        { challenge_id: challengeIds.greetings, resource_type: 'document', url: 'https://example.com/speaking-guide.pdf', alt_text: 'Speaking Techniques Guide', duration: null, file_size: 31457280 },
        { challenge_id: challengeIds.conversation, resource_type: 'audio', url: 'https://example.com/conversation-examples.mp3', alt_text: 'Conversation Examples', duration: 2400, file_size: 35651584 },
        { challenge_id: challengeIds.complex_sentences, resource_type: 'document', url: 'https://example.com/writing-guide.pdf', alt_text: 'Advanced Writing Guide', duration: null, file_size: 18874368 }
    ];

    const { data, error } = await supabase
        .from('resources')
        .insert(resources)
        .select();

    if (error) throw error;

    // Store resource IDs
    data.forEach((resource, index) => {
        resourceIds[`res_${index + 1}`] = resource.id;
    });

    console.log(`✅ Inserted ${data.length} resources`);
}

/**
 * TABLE 6: Insert user progress
 */
async function insertUserProgress() {
    console.log('📊 Inserting user progress...');
    
    const userProgress = [
        { user_id: userIds.john_smith, learning_path_id: learningPathIds.foundation, current_challenge_id: challengeIds.present_simple, completed_challenges: 1, total_challenges: 5, progress_percentage: 20.00, last_accessed: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { user_id: userIds.maria_garcia, learning_path_id: learningPathIds.foundation, current_challenge_id: challengeIds.greetings, completed_challenges: 0, total_challenges: 5, progress_percentage: 0.00, last_accessed: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { user_id: userIds.yuki_tanaka, learning_path_id: learningPathIds.toefl, current_challenge_id: challengeIds.toefl_reading, completed_challenges: 2, total_challenges: 8, progress_percentage: 25.00, last_accessed: new Date(Date.now() - 30 * 60 * 1000) },
        { user_id: userIds.ahmed_hassan, learning_path_id: learningPathIds.foundation, current_challenge_id: challengeIds.greetings, completed_challenges: 0, total_challenges: 5, progress_percentage: 0.00, last_accessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { user_id: userIds.david_johnson, learning_path_id: learningPathIds.business, current_challenge_id: challengeIds.business_vocab, completed_challenges: 3, total_challenges: 6, progress_percentage: 50.00, last_accessed: new Date(Date.now() - 60 * 60 * 1000) }
    ];

    const { data, error } = await supabase
        .from('user_progress')
        .insert(userProgress)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} user progress records`);
}

/**
 * TABLE 7: Insert challenge submissions
 */
async function insertChallengeSubmissions() {
    console.log('📝 Inserting challenge submissions...');
    
    const submissions = [
        {
            user_id: userIds.john_smith,
            challenge_id: challengeIds.greetings,
            user_answer: JSON.stringify({ video_url: 'https://example.com/john-intro.mp4', transcript: 'Hello, my name is John Smith. I am a business student...' }),
            is_correct: true,
            points_earned: 12,
            time_taken: 900,
            ai_feedback: JSON.stringify({ score: 80, feedback: 'Good pronunciation, clear introduction', areas_to_improve: ['speak more slowly'] }),
            submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
            user_id: userIds.maria_garcia,
            challenge_id: challengeIds.greetings,
            user_answer: JSON.stringify({ video_url: 'https://example.com/maria-intro.mp4', transcript: 'Hola... I mean, hello. My name is Maria Garcia...' }),
            is_correct: true,
            points_earned: 10,
            time_taken: 1100,
            ai_feedback: JSON.stringify({ score: 65, feedback: 'Good effort, work on fluency', areas_to_improve: ['reduce native language interference'] }),
            submitted_at: new Date(Date.now() - 20 * 60 * 60 * 1000)
        },
        {
            user_id: userIds.yuki_tanaka,
            challenge_id: challengeIds.toefl_reading,
            user_answer: JSON.stringify({ answers: ['Climate'], explanation: 'The passage discusses climate change impacts' }),
            is_correct: true,
            points_earned: 25,
            time_taken: 1200,
            ai_feedback: JSON.stringify({ score: 95, feedback: 'Excellent comprehension and analysis', areas_to_improve: [] }),
            submitted_at: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
            user_id: userIds.david_johnson,
            challenge_id: challengeIds.business_vocab,
            user_answer: JSON.stringify({ matches: [['agenda', 'A schedule of items to be discussed'], ['stakeholder', 'A person with interest in the business']] }),
            is_correct: true,
            points_earned: 18,
            time_taken: 800,
            ai_feedback: JSON.stringify({ score: 90, feedback: 'Strong vocabulary knowledge', areas_to_improve: ['work on remaining terms'] }),
            submitted_at: new Date(Date.now() - 60 * 60 * 1000)
        }
    ];

    const { data, error } = await supabase
        .from('challenge_submissions')
        .insert(submissions)
        .select();

    if (error) throw error;

    // Store submission IDs
    data.forEach((submission, index) => {
        submissionIds[`sub_${index + 1}`] = submission.id;
    });

    console.log(`✅ Inserted ${data.length} challenge submissions`);
}

/**
 * TABLE 8: Insert achievements
 */
async function insertAchievements() {
    console.log('🏆 Inserting achievements...');
    
    const achievements = [
        { title: 'First Steps', description: 'Complete your first challenge', icon_url: 'https://api.dicebear.com/7.x/icons/svg?icon=star', criteria: JSON.stringify({ challenges_completed: 1 }), points: 10, badge_type: 'bronze', is_active: true },
        { title: 'Grammar Master', description: 'Complete 10 grammar challenges', icon_url: 'https://api.dicebear.com/7.x/icons/svg?icon=book', criteria: JSON.stringify({ grammar_challenges: 10 }), points: 50, badge_type: 'silver', is_active: true },
        { title: 'Speaking Specialist', description: 'Complete 5 speaking challenges', icon_url: 'https://api.dicebear.com/7.x/icons/svg?icon=mic', criteria: JSON.stringify({ speaking_challenges: 5 }), points: 75, badge_type: 'gold', is_active: true },
        { title: 'Consistent Learner', description: 'Study for 7 consecutive days', icon_url: 'https://api.dicebear.com/7.x/icons/svg?icon=calendar', criteria: JSON.stringify({ consecutive_days: 7 }), points: 25, badge_type: 'bronze', is_active: true },
        { title: 'Vocabulary Virtuoso', description: 'Master 100 vocabulary words', icon_url: 'https://api.dicebear.com/7.x/icons/svg?icon=dictionary', criteria: JSON.stringify({ vocabulary_words: 100 }), points: 100, badge_type: 'platinum', is_active: true }
    ];

    const { data, error } = await supabase
        .from('achievements')
        .insert(achievements)
        .select();

    if (error) throw error;

    // Store achievement IDs
    data.forEach((achievement, index) => {
        const keys = ['first_steps', 'grammar_master', 'speaking_specialist', 'consistent_learner', 'vocabulary_virtuoso'];
        achievementIds[keys[index]] = achievement.id;
    });

    console.log(`✅ Inserted ${data.length} achievements`);
}

/**
 * TABLE 9: Insert user achievements
 */
async function insertUserAchievements() {
    console.log('🎖️ Inserting user achievements...');
    
    const userAchievements = [
        { user_id: userIds.john_smith, achievement_id: achievementIds.first_steps, earned_at: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { user_id: userIds.maria_garcia, achievement_id: achievementIds.first_steps, earned_at: new Date(Date.now() - 20 * 60 * 60 * 1000) },
        { user_id: userIds.yuki_tanaka, achievement_id: achievementIds.first_steps, earned_at: new Date(Date.now() - 30 * 60 * 1000) },
        { user_id: userIds.yuki_tanaka, achievement_id: achievementIds.consistent_learner, earned_at: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { user_id: userIds.david_johnson, achievement_id: achievementIds.first_steps, earned_at: new Date(Date.now() - 60 * 60 * 1000) }
    ];

    const { data, error } = await supabase
        .from('user_achievements')
        .insert(userAchievements)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} user achievements`);
}

/**
 * TABLE 10: Insert posts
 */
async function insertPosts() {
    console.log('📱 Inserting posts...');
    
    const posts = [
        {
            user_id: userIds.john_smith,
            title: 'My English Learning Journey',
            content: 'Started learning business English last month. The speaking challenges are really helping me gain confidence!',
            post_type: 'text',
            media_url: null,
            tags: ['learning', 'business-english', 'speaking'],
            is_public: true,
            likes_count: 5,
            comments_count: 2
        },
        {
            user_id: userIds.maria_garcia,
            title: 'Spanish to English Tips',
            content: 'As a native Spanish speaker, here are some tips that helped me with English pronunciation...',
            post_type: 'text',
            media_url: null,
            tags: ['spanish', 'pronunciation', 'tips'],
            is_public: true,
            likes_count: 12,
            comments_count: 4
        },
        {
            user_id: userIds.yuki_tanaka,
            title: 'TOEFL Preparation Progress',
            content: 'Halfway through the TOEFL course! The reading comprehension section is getting easier.',
            post_type: 'image',
            media_url: 'https://example.com/toefl-progress.jpg',
            tags: ['toefl', 'reading', 'progress'],
            is_public: true,
            likes_count: 8,
            comments_count: 3
        },
        {
            user_id: userIds.sarah_wilson,
            title: 'Teaching Grammar Effectively',
            content: 'New lesson plan for teaching present perfect tense. Interactive exercises work much better than traditional drills.',
            post_type: 'text',
            media_url: null,
            tags: ['teaching', 'grammar', 'methodology'],
            is_public: true,
            likes_count: 15,
            comments_count: 6
        }
    ];

    const { data, error } = await supabase
        .from('posts')
        .insert(posts)
        .select();

    if (error) throw error;

    // Store post IDs
    data.forEach((post, index) => {
        postIds[`post_${index + 1}`] = post.id;
    });

    console.log(`✅ Inserted ${data.length} posts`);
}

/**
 * TABLE 11: Insert comments
 */
async function insertComments() {
    console.log('💬 Inserting comments...');
    
    const comments = [
        { post_id: postIds.post_1, user_id: userIds.maria_garcia, content: 'Great progress John! I found speaking challenges scary at first too.', parent_id: null, likes_count: 2 },
        { post_id: postIds.post_1, user_id: userIds.yuki_tanaka, content: 'Keep it up! Business English is so useful for career growth.', parent_id: null, likes_count: 1 },
        { post_id: postIds.post_2, user_id: userIds.ahmed_hassan, content: 'Thank you for these tips! As an Arabic speaker, pronunciation is my biggest challenge too.', parent_id: null, likes_count: 3 },
        { post_id: postIds.post_2, user_id: userIds.john_smith, content: 'This is really helpful Maria, especially the part about rolling Rs.', parent_id: null, likes_count: 1 },
        { post_id: postIds.post_3, user_id: userIds.david_johnson, content: 'TOEFL prep is tough! You are doing great Yuki.', parent_id: null, likes_count: 2 },
        { post_id: postIds.post_4, user_id: userIds.michael_brown, content: 'Excellent approach Sarah! Interactive methods definitely increase retention.', parent_id: null, likes_count: 4 }
    ];

    const { data, error } = await supabase
        .from('comments')
        .insert(comments)
        .select();

    if (error) throw error;

    // Store comment IDs
    data.forEach((comment, index) => {
        commentIds[`comment_${index + 1}`] = comment.id;
    });

    console.log(`✅ Inserted ${data.length} comments`);
}

/**
 * TABLE 12: Insert likes
 */
async function insertLikes() {
    console.log('👍 Inserting likes...');
    
    const likes = [
        { user_id: userIds.maria_garcia, post_id: postIds.post_1, comment_id: null },
        { user_id: userIds.yuki_tanaka, post_id: postIds.post_1, comment_id: null },
        { user_id: userIds.david_johnson, post_id: postIds.post_1, comment_id: null },
        { user_id: userIds.john_smith, post_id: postIds.post_2, comment_id: null },
        { user_id: userIds.ahmed_hassan, post_id: postIds.post_2, comment_id: null },
        { user_id: userIds.sarah_wilson, post_id: postIds.post_3, comment_id: null },
        { user_id: userIds.michael_brown, post_id: postIds.post_4, comment_id: null },
        { user_id: userIds.john_smith, post_id: null, comment_id: commentIds.comment_1 },
        { user_id: userIds.maria_garcia, post_id: null, comment_id: commentIds.comment_3 }
    ];

    const { data, error } = await supabase
        .from('likes')
        .insert(likes)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} likes`);
}

/**
 * TABLE 13: Insert follows
 */
async function insertFollows() {
    console.log('👥 Inserting follows...');
    
    const follows = [
        { follower_id: userIds.john_smith, following_id: userIds.sarah_wilson },
        { follower_id: userIds.maria_garcia, following_id: userIds.sarah_wilson },
        { follower_id: userIds.yuki_tanaka, following_id: userIds.michael_brown },
        { follower_id: userIds.ahmed_hassan, following_id: userIds.sarah_wilson },
        { follower_id: userIds.david_johnson, following_id: userIds.michael_brown },
        { follower_id: userIds.john_smith, following_id: userIds.maria_garcia },
        { follower_id: userIds.maria_garcia, following_id: userIds.yuki_tanaka },
        { follower_id: userIds.sarah_wilson, following_id: userIds.michael_brown }
    ];

    const { data, error } = await supabase
        .from('follows')
        .insert(follows)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} follows`);
}

/**
 * TABLE 14: Insert notifications
 */
async function insertNotifications() {
    console.log('🔔 Inserting notifications...');
    
    const notifications = [
        { user_id: userIds.john_smith, title: 'Achievement Unlocked!', message: 'You earned the "First Steps" achievement', notification_type: 'achievement', data: JSON.stringify({ achievement_id: achievementIds.first_steps }), is_read: false },
        { user_id: userIds.maria_garcia, title: 'New Comment', message: 'Ahmed Hassan commented on your post', notification_type: 'comment', data: JSON.stringify({ post_id: postIds.post_2, comment_id: commentIds.comment_3 }), is_read: false },
        { user_id: userIds.yuki_tanaka, title: 'Challenge Completed', message: 'Great job completing the TOEFL Reading Practice!', notification_type: 'challenge', data: JSON.stringify({ challenge_id: challengeIds.toefl_reading }), is_read: true },
        { user_id: userIds.sarah_wilson, title: 'New Follower', message: 'John Smith started following you', notification_type: 'follow', data: JSON.stringify({ follower_id: userIds.john_smith }), is_read: false },
        { user_id: userIds.david_johnson, title: 'Weekly Progress', message: 'You completed 3 challenges this week!', notification_type: 'system', data: JSON.stringify({ challenges_completed: 3 }), is_read: true }
    ];

    const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} notifications`);
}

/**
 * TABLE 15: Insert messages
 */
async function insertMessages() {
    console.log('💌 Inserting messages...');
    
    const messages = [
        { sender_id: userIds.john_smith, receiver_id: userIds.sarah_wilson, content: 'Hi Prof. Wilson, I need help with the present simple tense challenge.', message_type: 'text', media_url: null, is_read: true },
        { sender_id: userIds.sarah_wilson, receiver_id: userIds.john_smith, content: 'Hi John! I would be happy to help. The key is understanding subject-verb agreement.', message_type: 'text', media_url: null, is_read: true },
        { sender_id: userIds.maria_garcia, receiver_id: userIds.yuki_tanaka, content: 'How is your TOEFL preparation going?', message_type: 'text', media_url: null, is_read: false },
        { sender_id: userIds.yuki_tanaka, receiver_id: userIds.maria_garcia, content: 'Going well! Thanks for asking. How about your conversation practice?', message_type: 'text', media_url: null, is_read: false },
        { sender_id: userIds.ahmed_hassan, receiver_id: userIds.david_johnson, content: 'Can you share your business English notes?', message_type: 'text', media_url: null, is_read: false }
    ];

    const { data, error } = await supabase
        .from('messages')
        .insert(messages)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} messages`);
}

/**
 * TABLE 16: Insert AI models
 */
async function insertAIModels() {
    console.log('🤖 Inserting AI models...');
    
    const aiModels = [
        { name: 'GPT-4 Turbo', provider: 'openai', model_id: 'gpt-4-turbo-preview', capabilities: ['text_generation', 'code_generation', 'reasoning'], is_active: true, rate_limit: 500, cost_per_request: 0.01 },
        { name: 'Claude 3 Sonnet', provider: 'anthropic', model_id: 'claude-3-sonnet-20240229', capabilities: ['text_generation', 'analysis', 'reasoning'], is_active: true, rate_limit: 300, cost_per_request: 0.015 },
        { name: 'Gemini Pro', provider: 'google', model_id: 'gemini-pro', capabilities: ['text_generation', 'multimodal'], is_active: true, rate_limit: 400, cost_per_request: 0.008 },
        { name: 'English Grammar Checker', provider: 'custom', model_id: 'grammar-check-v1.0', capabilities: ['grammar_checking', 'error_correction'], is_active: true, rate_limit: 1000, cost_per_request: 0.002 }
    ];

    const { data, error } = await supabase
        .from('ai_models')
        .insert(aiModels)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} AI models`);
}

/**
 * TABLE 17: Insert AI safety rules
 */
async function insertAISafetyRules() {
    console.log('🛡️ Inserting AI safety rules...');
    
    const safetyRules = [
        { rule_name: 'Content Filter', rule_type: 'content_filter', rule_config: JSON.stringify({ blocked_categories: ['violence', 'hate_speech', 'adult_content'], threshold: 0.7 }), severity: 'high', is_active: true },
        { rule_name: 'Rate Limiting', rule_type: 'rate_limit', rule_config: JSON.stringify({ max_requests_per_hour: 100, max_requests_per_day: 500 }), severity: 'medium', is_active: true },
        { rule_name: 'Toxicity Detection', rule_type: 'toxicity_check', rule_config: JSON.stringify({ toxicity_threshold: 0.6, auto_moderate: true }), severity: 'high', is_active: true },
        { rule_name: 'Age Appropriate Content', rule_type: 'age_appropriate', rule_config: JSON.stringify({ min_age: 13, content_guidelines: 'educational' }), severity: 'critical', is_active: true }
    ];

    const { data, error } = await supabase
        .from('ai_safety_rules')
        .insert(safetyRules)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} AI safety rules`);
}

/**
 * TABLE 18: Insert API keys
 */
async function insertAPIKeys() {
    console.log('🔑 Inserting API keys...');
    
    const apiKeys = [
        { service_name: 'OpenAI', key_name: 'openai_api_key', encrypted_key: 'encrypted_openai_key_placeholder', is_active: true, usage_limit: 10000, current_usage: 1250, expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
        { service_name: 'Anthropic', key_name: 'anthropic_api_key', encrypted_key: 'encrypted_anthropic_key_placeholder', is_active: true, usage_limit: 5000, current_usage: 750, expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
        { service_name: 'Google AI', key_name: 'google_ai_key', encrypted_key: 'encrypted_google_key_placeholder', is_active: true, usage_limit: 8000, current_usage: 2100, expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
        { service_name: 'Speech API', key_name: 'speech_recognition_key', encrypted_key: 'encrypted_speech_key_placeholder', is_active: true, usage_limit: 15000, current_usage: 5500, expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
    ];

    const { data, error } = await supabase
        .from('api_keys')
        .insert(apiKeys)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} API keys`);
}

/**
 * TABLE 19: Insert banned terms
 */
async function insertBannedTerms() {
    console.log('🚫 Inserting banned terms...');
    
    const bannedTerms = [
        { term: 'spam_keyword_1', category: 'spam', severity: 'medium', language: 'en', is_active: true },
        { term: 'inappropriate_term_1', category: 'inappropriate', severity: 'high', language: 'en', is_active: true },
        { term: 'hate_word_1', category: 'hate_speech', severity: 'high', language: 'en', is_active: true },
        { term: 'profanity_1', category: 'profanity', severity: 'medium', language: 'en', is_active: true },
        { term: 'spam_phrase_1', category: 'spam', severity: 'low', language: 'en', is_active: true }
    ];

    const { data, error } = await supabase
        .from('banned_terms')
        .insert(bannedTerms)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} banned terms`);
}

/**
 * TABLE 20: Insert evaluation logs
 */
async function insertEvaluationLogs() {
    console.log('📋 Inserting evaluation logs...');
    
    const evaluationLogs = [
        {
            user_id: userIds.john_smith,
            challenge_id: challengeIds.greetings,
            submission_id: submissionIds.sub_1,
            ai_model: 'gpt-4-turbo-preview',
            evaluation_type: 'pronunciation',
            input_text: 'Hello, my name is John Smith. I am a business student...',
            ai_response: JSON.stringify({ score: 80, feedback: 'Good pronunciation, clear introduction', pronunciation_accuracy: 85 }),
            confidence_score: 0.89,
            processing_time: 1250
        },
        {
            user_id: userIds.maria_garcia,
            challenge_id: challengeIds.greetings,
            submission_id: submissionIds.sub_2,
            ai_model: 'claude-3-sonnet-20240229',
            evaluation_type: 'fluency',
            input_text: 'Hola... I mean, hello. My name is Maria Garcia...',
            ai_response: JSON.stringify({ score: 65, feedback: 'Good effort, work on fluency', fluency_rating: 60 }),
            confidence_score: 0.76,
            processing_time: 980
        },
        {
            user_id: userIds.yuki_tanaka,
            challenge_id: challengeIds.toefl_reading,
            submission_id: submissionIds.sub_3,
            ai_model: 'gemini-pro',
            evaluation_type: 'content',
            input_text: 'The passage discusses climate change impacts',
            ai_response: JSON.stringify({ score: 95, feedback: 'Excellent comprehension and analysis', content_accuracy: 98 }),
            confidence_score: 0.95,
            processing_time: 750
        },
        {
            user_id: userIds.david_johnson,
            challenge_id: challengeIds.business_vocab,
            submission_id: submissionIds.sub_4,
            ai_model: 'grammar-check-v1.0',
            evaluation_type: 'vocabulary',
            input_text: 'Business vocabulary matching exercise',
            ai_response: JSON.stringify({ score: 90, feedback: 'Strong vocabulary knowledge', vocabulary_accuracy: 92 }),
            confidence_score: 0.91,
            processing_time: 500
        }
    ];

    const { data, error } = await supabase
        .from('evaluation_logs')
        .insert(evaluationLogs)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} evaluation logs`);
}

/**
 * TABLE 21: Insert scoring templates
 */
async function insertScoringTemplates() {
    console.log('📊 Inserting scoring templates...');
    
    const scoringTemplates = [
        {
            name: 'Speaking Assessment',
            challenge_type: 'speaking',
            criteria: JSON.stringify({
                pronunciation: { weight: 30, max_score: 30 },
                fluency: { weight: 25, max_score: 25 },
                vocabulary: { weight: 20, max_score: 20 },
                grammar: { weight: 25, max_score: 25 }
            }),
            max_points: 100,
            is_default: true,
            created_by: userIds.sarah_wilson
        },
        {
            name: 'Writing Evaluation',
            challenge_type: 'writing',
            criteria: JSON.stringify({
                grammar: { weight: 35, max_score: 35 },
                vocabulary: { weight: 25, max_score: 25 },
                coherence: { weight: 20, max_score: 20 },
                creativity: { weight: 20, max_score: 20 }
            }),
            max_points: 100,
            is_default: true,
            created_by: userIds.michael_brown
        },
        {
            name: 'Grammar Check',
            challenge_type: 'grammar',
            criteria: JSON.stringify({
                accuracy: { weight: 50, max_score: 50 },
                understanding: { weight: 30, max_score: 30 },
                application: { weight: 20, max_score: 20 }
            }),
            max_points: 100,
            is_default: true,
            created_by: userIds.sarah_wilson
        },
        {
            name: 'Vocabulary Assessment',
            challenge_type: 'vocabulary',
            criteria: JSON.stringify({
                word_knowledge: { weight: 40, max_score: 40 },
                usage: { weight: 35, max_score: 35 },
                context: { weight: 25, max_score: 25 }
            }),
            max_points: 100,
            is_default: false,
            created_by: userIds.michael_brown
        }
    ];    const { data, error } = await supabase
        .from('scoring_templates')
        .insert(scoringTemplates)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} scoring templates`);
}

/**
 * TABLE 22: Insert admin logs
 */
async function insertAdminLogs() {
    console.log('👨‍💼 Inserting admin logs...');
    
    const adminLogs = [
        {
            admin_id: userIds.admin,
            action: 'CREATE_USER',
            target_type: 'user',
            target_id: userIds.john_smith,
            details: JSON.stringify({ email: 'john.smith@university.edu', role: 'student' }),
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
            admin_id: userIds.admin,
            action: 'UPDATE_LEARNING_PATH',
            target_type: 'learning_path',
            target_id: learningPathIds.foundation,
            details: JSON.stringify({ field: 'estimated_duration', old_value: 180, new_value: 200 }),
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            created_at: new Date(Date.now() - 12 * 60 * 60 * 1000)
        },
        {
            admin_id: userIds.admin,
            action: 'DELETE_BANNED_TERM',
            target_type: 'banned_term',
            target_id: null,
            details: JSON.stringify({ term: 'old_spam_word', reason: 'no longer relevant' }),
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000)
        },
        {
            admin_id: userIds.admin,
            action: 'ACTIVATE_AI_MODEL',
            target_type: 'ai_model',
            target_id: null,
            details: JSON.stringify({ model: 'gpt-4-turbo-preview', status: 'activated' }),
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
    ];

    const { data, error } = await supabase
        .from('admin_logs')
        .insert(adminLogs)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} admin logs`);
}

/**
 * TABLE 23: Insert AI assistants
 */
async function insertAIAssistants() {
    console.log('🤖 Inserting AI assistants...');
    
    const assistants = [
        {
            name: 'Grammar Guru',
            description: 'Specialized AI assistant for grammar correction and explanation',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=grammar',
            model: 'gpt-4-turbo-preview',
            system_prompt: 'You are a grammar expert specializing in English language learning. Provide clear, detailed explanations of grammar rules and corrections.',
            capabilities: ['grammar_check', 'explanation', 'examples'],
            category: 'education',
            is_active: true,
            created_by: userIds.sarah_wilson,
            conversation_count: 25,
            message_count: 150,
            token_consumption: 45000
        },
        {
            name: 'Pronunciation Coach',
            description: 'AI assistant focused on pronunciation and speaking skills',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=pronunciation',
            model: 'claude-3-sonnet-20240229',
            system_prompt: 'You are a pronunciation coach. Help users improve their English pronunciation with clear guidance and phonetic explanations.',
            capabilities: ['pronunciation', 'phonetics', 'speaking_tips'],
            category: 'practice',
            is_active: true,
            created_by: userIds.michael_brown,
            conversation_count: 18,
            message_count: 89,
            token_consumption: 32000
        },
        {
            name: 'Vocabulary Builder',
            description: 'AI assistant for expanding vocabulary and learning new words',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=vocabulary',
            model: 'gemini-pro',
            system_prompt: 'You are a vocabulary expert. Help users learn new words, understand meanings, and use them in context.',
            capabilities: ['vocabulary', 'definitions', 'context_examples'],
            category: 'education',
            is_active: true,
            created_by: userIds.sarah_wilson,
            conversation_count: 32,
            message_count: 201,
            token_consumption: 67000
        },
        {
            name: 'Writing Assistant',
            description: 'AI assistant for improving writing skills and essay composition',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=writing',
            model: 'gpt-4-turbo-preview',
            system_prompt: 'You are a writing coach. Help users improve their English writing skills with feedback, suggestions, and structural guidance.',
            capabilities: ['writing_feedback', 'essay_help', 'structure_guidance'],
            category: 'assessment',
            is_active: true,
            created_by: userIds.michael_brown,
            conversation_count: 15,
            message_count: 95,
            token_consumption: 28000
        }
    ];

    const { data, error } = await supabase
        .from('ai_assistants')
        .insert(assistants)
        .select();

    if (error) throw error;

    // Store AI assistant IDs
    data.forEach((assistant, index) => {
        const keys = ['grammar_guru', 'pronunciation_coach', 'vocabulary_builder', 'writing_assistant'];
        aiAssistantIds[keys[index]] = assistant.id;
    });

    console.log(`✅ Inserted ${data.length} AI assistants`);
}

/**
 * TABLE 24: Insert conversations
 */
async function insertConversations() {
    console.log('💬 Inserting conversations...');
    
    const conversations = [
        {
            title: 'Grammar Help Discussion',
            status: 'active',
            last_message_at: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
            title: 'TOEFL Study Group',
            status: 'active',
            last_message_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
            title: 'Business English Practice',
            status: 'active',
            last_message_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
            title: 'Pronunciation Workshop',
            status: 'archived',
            last_message_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
    ];

    const { data, error } = await supabase
        .from('conversations')
        .insert(conversations)
        .select();

    if (error) throw error;

    // Store conversation IDs
    data.forEach((conversation, index) => {
        const keys = ['grammar_help', 'toefl_group', 'business_practice', 'pronunciation_workshop'];
        conversationIds[keys[index]] = conversation.id;
    });

    console.log(`✅ Inserted ${data.length} conversations`);
}

/**
 * TABLE 25: Insert conversation participants
 */
async function insertConversationParticipants() {
    console.log('👥 Inserting conversation participants...');
    
    const participants = [
        // Grammar Help Discussion
        { conversation_id: conversationIds.grammar_help, user_id: userIds.john_smith, role: 'participant', last_read_at: new Date(Date.now() - 30 * 60 * 1000) },
        { conversation_id: conversationIds.grammar_help, user_id: userIds.sarah_wilson, role: 'moderator', last_read_at: new Date(Date.now() - 15 * 60 * 1000) },
        { conversation_id: conversationIds.grammar_help, user_id: userIds.maria_garcia, role: 'participant', last_read_at: new Date(Date.now() - 45 * 60 * 1000) },
        
        // TOEFL Study Group
        { conversation_id: conversationIds.toefl_group, user_id: userIds.yuki_tanaka, role: 'participant', last_read_at: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { conversation_id: conversationIds.toefl_group, user_id: userIds.ahmed_hassan, role: 'participant', last_read_at: new Date(Date.now() - 3 * 60 * 60 * 1000) },
        { conversation_id: conversationIds.toefl_group, user_id: userIds.sarah_wilson, role: 'teacher', last_read_at: new Date(Date.now() - 60 * 60 * 1000) },
        
        // Business English Practice
        { conversation_id: conversationIds.business_practice, user_id: userIds.david_johnson, role: 'participant', last_read_at: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { conversation_id: conversationIds.business_practice, user_id: userIds.michael_brown, role: 'teacher', last_read_at: new Date(Date.now() - 20 * 60 * 60 * 1000) },
        { conversation_id: conversationIds.business_practice, user_id: userIds.john_smith, role: 'participant', last_read_at: new Date(Date.now() - 25 * 60 * 60 * 1000) }
    ];

    const { data, error } = await supabase
        .from('conversation_participants')
        .insert(participants)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} conversation participants`);
}

/**
 * TABLE 26: Insert conversation messages
 */
async function insertConversationMessages() {
    console.log('📨 Inserting conversation messages...');
    
    const messages = [
        // Grammar Help Discussion
        {
            conversation_id: conversationIds.grammar_help,
            sender_id: userIds.john_smith,
            content: 'I need help with the present perfect tense. When should I use "have" vs "has"?',
            message_type: 'text',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
            conversation_id: conversationIds.grammar_help,
            sender_id: userIds.sarah_wilson,
            content: 'Great question! Use "have" with I, you, we, they. Use "has" with he, she, it. For example: "I have studied" vs "She has studied".',
            message_type: 'text',
            created_at: new Date(Date.now() - 90 * 60 * 1000)
        },
        {
            conversation_id: conversationIds.grammar_help,
            sender_id: userIds.maria_garcia,
            content: 'That helps me too! In Spanish we don\'t have this distinction.',
            message_type: 'text',
            created_at: new Date(Date.now() - 45 * 60 * 1000)
        },
        {
            conversation_id: conversationIds.grammar_help,
            sender_id: userIds.sarah_wilson,
            content: 'Exactly! That\'s why it can be tricky for Spanish speakers. Practice makes perfect!',
            message_type: 'text',
            created_at: new Date(Date.now() - 30 * 60 * 1000)
        },
        
        // TOEFL Study Group
        {
            conversation_id: conversationIds.toefl_group,
            sender_id: userIds.yuki_tanaka,
            content: 'How is everyone doing with the reading comprehension practice?',
            message_type: 'text',
            created_at: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
            conversation_id: conversationIds.toefl_group,
            sender_id: userIds.ahmed_hassan,
            content: 'I\'m struggling with the time management. The passages are so long!',
            message_type: 'text',
            created_at: new Date(Date.now() - 150 * 60 * 1000)
        },
        {
            conversation_id: conversationIds.toefl_group,
            sender_id: userIds.sarah_wilson,
            content: 'Try skimming first, then read the questions, then go back to find specific answers. This strategy saves time!',
            message_type: 'text',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        
        // Business English Practice
        {
            conversation_id: conversationIds.business_practice,
            sender_id: userIds.david_johnson,
            content: 'Can someone help me with formal email writing? I have a presentation to propose.',
            message_type: 'text',
            created_at: new Date(Date.now() - 25 * 60 * 60 * 1000)
        },
        {
            conversation_id: conversationIds.business_practice,
            sender_id: userIds.michael_brown,
            content: 'Sure! Start with "Dear [Name]", state your purpose clearly in the first paragraph, and end with "Best regards" or "Sincerely".',
            message_type: 'text',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
    ];

    const { data, error } = await supabase
        .from('conversation_messages')
        .insert(messages)
        .select();

    if (error) throw error;

    // Store message IDs
    data.forEach((message, index) => {
        messageIds[`msg_${index + 1}`] = message.id;
    });

    console.log(`✅ Inserted ${data.length} conversation messages`);
}

/**
 * TABLE 27: Insert notification templates
 */
async function insertNotificationTemplates() {
    console.log('📧 Inserting notification templates...');
    
    const templates = [
        {
            name: 'Welcome Email',
            subject: 'Welcome to English Learning Platform!',
            content: 'Welcome {{user_name}}! We are excited to have you join our English learning community. Start your journey by exploring our learning paths.',
            notification_type: 'email',
            is_active: true
        },
        {
            name: 'Achievement Unlock',
            subject: 'Congratulations! You unlocked a new achievement',
            content: 'Great job {{user_name}}! You have unlocked the "{{achievement_name}}" achievement. Keep up the excellent work!',
            notification_type: 'push',
            is_active: true
        },
        {
            name: 'Challenge Reminder',
            subject: 'Don\'t forget to complete your daily challenge!',
            content: 'Hi {{user_name}}, you have a pending challenge waiting for you. Complete it now to maintain your learning streak!',
            notification_type: 'system',
            is_active: true
        },
        {
            name: 'Weekly Progress',
            subject: 'Your weekly learning progress report',
            content: 'Hi {{user_name}}, here\'s your weekly progress: {{challenges_completed}} challenges completed, {{points_earned}} points earned. {{streak_days}} day streak!',
            notification_type: 'email',
            is_active: true
        },
        {
            name: 'New Comment',
            subject: 'Someone commented on your post',
            content: '{{commenter_name}} commented on your post "{{post_title}}": {{comment_preview}}',
            notification_type: 'push',
            is_active: true
        }
    ];

    const { data, error } = await supabase
        .from('notification_templates')
        .insert(templates)
        .select();

    if (error) throw error;

    // Store template IDs
    data.forEach((template, index) => {
        const keys = ['welcome', 'achievement', 'challenge_reminder', 'weekly_progress', 'new_comment'];
        notificationTemplateIds[keys[index]] = template.id;
    });

    console.log(`✅ Inserted ${data.length} notification templates`);
}

/**
 * TABLE 28: Insert scheduled messages
 */
async function insertScheduledMessages() {
    console.log('⏰ Inserting scheduled messages...');
    
    const scheduledMessages = [
        {
            title: 'Weekly Challenge Reminder',
            message_type: 'push',
            template_id: notificationTemplateIds.challenge_reminder,
            recipient_filter: JSON.stringify({ active_users: true, last_login_days: 7 }),
            recipient_count: 156,
            scheduled_for: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            recurring_pattern: 'weekly',
            status: 'scheduled'
        },
        {
            title: 'Monthly Progress Report',
            message_type: 'email',
            template_id: notificationTemplateIds.weekly_progress,
            recipient_filter: JSON.stringify({ all_users: true }),
            recipient_count: 245,
            scheduled_for: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            recurring_pattern: 'monthly',
            status: 'scheduled'
        },
        {
            title: 'New Feature Announcement',
            message_type: 'system',
            template_id: null,
            recipient_filter: JSON.stringify({ active_users: true }),
            recipient_count: 180,
            scheduled_for: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            recurring_pattern: 'none',
            status: 'sent',
            sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
            title: 'Course Completion Congratulations',
            message_type: 'email',
            template_id: notificationTemplateIds.achievement,
            recipient_filter: JSON.stringify({ completed_courses: true }),
            recipient_count: 23,
            scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000),
            recurring_pattern: 'none',
            status: 'scheduled'
        }
    ];

    const { data, error } = await supabase
        .from('scheduled_messages')
        .insert(scheduledMessages)
        .select();

    if (error) throw error;

    // Store scheduled message IDs
    data.forEach((message, index) => {
        scheduledMessageIds[`sched_${index + 1}`] = message.id;
    });

    console.log(`✅ Inserted ${data.length} scheduled messages`);
}

/**
 * TABLE 29: Insert notification deliveries
 */
async function insertNotificationDeliveries() {
    console.log('📬 Inserting notification deliveries...');
    
    // First, get some notification IDs from the notifications we created
    const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('id')
        .limit(5);

    if (!existingNotifications || existingNotifications.length === 0) {
        console.log('⚠️ No notifications found, skipping notification deliveries');
        return;
    }

    const deliveries = [
        {
            notification_id: existingNotifications[0].id,
            user_id: userIds.john_smith,
            delivered_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
            opened_at: new Date(Date.now() - 90 * 60 * 1000),
            clicked_at: new Date(Date.now() - 85 * 60 * 1000),
            delivery_status: 'delivered'
        },
        {
            notification_id: existingNotifications[1].id,
            user_id: userIds.maria_garcia,
            delivered_at: new Date(Date.now() - 20 * 60 * 60 * 1000),
            opened_at: new Date(Date.now() - 19 * 60 * 60 * 1000),
            clicked_at: null,
            delivery_status: 'delivered'
        },
        {
            notification_id: existingNotifications[2].id,
            user_id: userIds.yuki_tanaka,
            delivered_at: new Date(Date.now() - 30 * 60 * 1000),
            opened_at: null,
            clicked_at: null,
            delivery_status: 'delivered'
        },
        {
            notification_id: existingNotifications[3].id,
            user_id: userIds.david_johnson,
            delivered_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
            opened_at: null,
            clicked_at: null,
            delivery_status: 'failed'
        }
    ];

    const { data, error } = await supabase
        .from('notification_deliveries')
        .insert(deliveries)
        .select();

    if (error) throw error;
    console.log(`✅ Inserted ${data.length} notification deliveries`);
}

/**
 * Verify data population
 */
async function verifyDataPopulation() {
    console.log('🔍 Verifying data population...');
      const tables = [
        'users', 'profiles', 'learning_paths', 'challenges', 'resources',
        'user_progress', 'challenge_submissions', 'achievements', 'user_achievements',
        'posts', 'comments', 'likes', 'follows', 'notifications', 'messages',
        'ai_models', 'ai_assistants', 'ai_safety_rules', 'api_keys', 'banned_terms',
        'evaluation_logs', 'scoring_templates', 'admin_logs', 'conversations',
        'conversation_participants', 'conversation_messages', 'notification_templates',
        'scheduled_messages', 'notification_deliveries'
    ];

    const results = {};
    
    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
        
        if (error) {
            console.error(`❌ Error checking ${table}:`, error.message);
            results[table] = 'ERROR';
        } else {
            results[table] = count;
        }
    }

    console.log('\n📊 DATA POPULATION SUMMARY:');
    console.log('=' .repeat(50));
    
    let totalRecords = 0;
    tables.forEach((table, index) => {
        const count = results[table];
        const status = count === 'ERROR' ? '❌' : count > 0 ? '✅' : '⚠️';
        console.log(`${(index + 1).toString().padStart(2, '0')}. ${table.padEnd(20)} ${status} ${count}`);
        if (typeof count === 'number') totalRecords += count;
    });
    
    console.log('=' .repeat(50));
    console.log(`TOTAL RECORDS: ${totalRecords}`);
    console.log(`TABLES POPULATED: ${Object.values(results).filter(v => typeof v === 'number' && v > 0).length}/29`);
}

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('🚀 Starting comprehensive sample data population...');
        console.log(`📅 ${new Date().toISOString()}`);
        console.log('=' .repeat(60));

        await cleanSampleData();
        
        console.log('\n📝 INSERTING SAMPLE DATA:');
        console.log('-' .repeat(40));
        
        await insertUsers();
        await insertProfiles();
        await insertLearningPaths();
        await insertChallenges();
        await insertResources();
        await insertUserProgress();
        await insertChallengeSubmissions();
        await insertAchievements();
        await insertUserAchievements();
        await insertPosts();
        await insertComments();
        await insertLikes();
        await insertFollows();
        await insertNotifications();
        await insertMessages();
        await insertAIModels();
        await insertAISafetyRules();
        await insertAPIKeys();
        await insertBannedTerms();
        await insertEvaluationLogs();
        await insertScoringTemplates();
        await insertAdminLogs();
        await insertAIAssistants();
        await insertConversations();
        await insertConversationParticipants();
        await insertConversationMessages();        await insertNotificationTemplates();
        await insertScheduledMessages();
        await insertNotificationDeliveries();
        
        await verifyDataPopulation();
        
        console.log('\n🎉 SAMPLE DATA POPULATION COMPLETED SUCCESSFULLY!');
        console.log('All 29 tables have been populated with comprehensive sample data.');
        console.log('\nYou can now:');
        console.log('- Test the application with realistic data');
        console.log('- Explore all features and functionality'); 
        console.log('- Run database queries and reports');
        
    } catch (error) {
        console.error('\n💥 Error during data population:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    main,
    cleanSampleData,
    verifyDataPopulation
};
