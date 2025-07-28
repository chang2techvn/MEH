#!/usr/bin/env node

/**
 * Script: Add Sample Learning Goals and Vocabulary Data
 * Purpose: Populate the database with sample learning goals and vocabulary entries
 * Usage: node scripts/add-learning-goals-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample vocabulary entries for Vietnamese English learners
const sampleVocabulary = [
    {
        term: "Conference",
        meaning: "hội nghị",
        pronunciation: "ˈkɒnfərəns",
        definition: "A formal meeting of people to discuss matters of common interest",
        example_sentence: "I attended the annual technology conference last week.",
        example_translation: "Tôi đã tham dự hội nghị công nghệ thường niên tuần trước.",
        difficulty_level: "intermediate",
        category: "business",
        usage_count: 4,
        mastery_level: 3,
        source: "ai_conversation"
    },
    {
        term: "Presentation",
        meaning: "bài thuyết trình",
        pronunciation: "ˌprezənˈteɪʃən",
        definition: "A speech or talk in which a new product, idea, or piece of work is shown and explained",
        example_sentence: "She gave an excellent presentation about climate change.",
        example_translation: "Cô ấy đã có một bài thuyết trình xuất sắc về biến đổi khí hậu.",
        difficulty_level: "intermediate",
        category: "academic",
        usage_count: 3,
        mastery_level: 4,
        source: "daily_challenge"
    },
    {
        term: "Achievement",
        meaning: "thành tựu",
        pronunciation: "əˈtʃiːvmənt",
        definition: "A thing done successfully, especially with effort, skill, or courage",
        example_sentence: "Graduating from university was my greatest achievement.",
        example_translation: "Tốt nghiệp đại học là thành tựu lớn nhất của tôi.",
        difficulty_level: "intermediate",
        category: "personal",
        usage_count: 2,
        mastery_level: 3,
        source: "vocabulary_practice"
    },
    {
        term: "Opportunity",
        meaning: "cơ hội",
        pronunciation: "ˌɒpəˈtjuːnɪti",
        definition: "A set of circumstances that makes it possible to do something",
        example_sentence: "This job offers a great opportunity for career growth.",
        example_translation: "Công việc này mang lại cơ hội tuyệt vời để phát triển sự nghiệp.",
        difficulty_level: "intermediate",
        category: "career",
        usage_count: 5,
        mastery_level: 4,
        source: "ai_conversation"
    },
    {
        term: "Development",
        meaning: "phát triển",
        pronunciation: "dɪˈveləpmənt",
        definition: "The process of developing or being developed",
        example_sentence: "The development of new technologies is accelerating rapidly.",
        example_translation: "Sự phát triển của các công nghệ mới đang tăng tốc nhanh chóng.",
        difficulty_level: "intermediate",
        category: "technology",
        usage_count: 7,
        mastery_level: 5,
        source: "reading_comprehension"
    },
    {
        term: "Collaboration",
        meaning: "hợp tác",
        pronunciation: "kəˌlæbəˈreɪʃən",
        definition: "The action of working with someone to produce or create something",
        example_sentence: "International collaboration is essential for scientific research.",
        example_translation: "Hợp tác quốc tế là điều cần thiết cho nghiên cứu khoa học.",
        difficulty_level: "advanced",
        category: "business",
        usage_count: 3,
        mastery_level: 2,
        source: "listening_exercise"
    },
    {
        term: "Innovation",
        meaning: "sự đổi mới",
        pronunciation: "ˌɪnəˈveɪʃən",
        definition: "The action or process of innovating; a new method, idea, product, etc.",
        example_sentence: "The company is known for its innovation in renewable energy.",
        example_translation: "Công ty này nổi tiếng về sự đổi mới trong năng lượng tái tạo.",
        difficulty_level: "advanced",
        category: "technology",
        usage_count: 6,
        mastery_level: 3,
        source: "ai_conversation"
    },
    {
        term: "Sustainability",
        meaning: "tính bền vững",
        pronunciation: "səˌsteɪnəˈbɪlɪti",
        definition: "The ability to be maintained at a certain rate or level",
        example_sentence: "Environmental sustainability is crucial for future generations.",
        example_translation: "Tính bền vững môi trường là điều quan trọng cho các thế hệ tương lai.",
        difficulty_level: "advanced",
        category: "environment",
        usage_count: 2,
        mastery_level: 2,
        source: "reading_comprehension"
    },
    {
        term: "Communication",
        meaning: "giao tiếp",
        pronunciation: "kəˌmjuːnɪˈkeɪʃən",
        definition: "The imparting or exchanging of information or ideas",
        example_sentence: "Effective communication is key to successful teamwork.",
        example_translation: "Giao tiếp hiệu quả là chìa khóa cho làm việc nhóm thành công.",
        difficulty_level: "intermediate",
        category: "social",
        usage_count: 8,
        mastery_level: 4,
        source: "speaking_practice"
    },
    {
        term: "Methodology",
        meaning: "phương pháp luận",
        pronunciation: "ˌmeθəˈdɒlədʒi",
        definition: "A system of methods used in a particular area of study or activity",
        example_sentence: "The research methodology was carefully designed and tested.",
        example_translation: "Phương pháp luận nghiên cứu đã được thiết kế và kiểm tra cẩn thận.",
        difficulty_level: "advanced",
        category: "academic",
        usage_count: 1,
        mastery_level: 1,
        source: "vocabulary_practice"
    }
];

// Sample learning goals templates
const sampleGoals = [
    {
        title: "Học 10 từ vựng mới mỗi ngày",
        description: "Mở rộng vốn từ vựng tiếng Anh với 10 từ mới mỗi ngày",
        category: "vocabulary",
        target: 10,
        current: 8,
        unit: "từ",
        deadline: "2025-06-30",
        priority: "high"
    },
    {
        title: "Luyện nói 30 phút mỗi ngày",
        description: "Cải thiện kỹ năng nói tiếng Anh thông qua thực hành hàng ngày",
        category: "speaking",
        target: 30,
        current: 25,
        unit: "phút",
        deadline: "2025-06-30",
        priority: "high"
    },
    {
        title: "Hoàn thành 5 bài tập ngữ pháp mỗi tuần",
        description: "Nắm vững các quy tắc ngữ pháp tiếng Anh cơ bản và nâng cao",
        category: "grammar",
        target: 5,
        current: 2,
        unit: "bài",
        deadline: "2025-06-25",
        priority: "medium"
    },
    {
        title: "Nghe 20 phút podcast tiếng Anh mỗi ngày",
        description: "Cải thiện khả năng nghe hiểu và làm quen với các giọng nói khác nhau",
        category: "listening",
        target: 20,
        current: 15,
        unit: "phút",
        deadline: "2025-07-31",
        priority: "medium"
    },
    {
        title: "Đọc 1 bài báo tiếng Anh mỗi ngày",
        description: "Nâng cao kỹ năng đọc hiểu và mở rộng kiến thức về thế giới",
        category: "reading",
        target: 1,
        current: 0,
        unit: "bài",
        deadline: "2025-08-31",
        priority: "low"
    },
    {
        title: "Viết 200 từ tiếng Anh mỗi ngày",
        description: "Phát triển kỹ năng viết và khả năng diễn đạt ý tưởng bằng tiếng Anh",
        category: "writing",
        target: 200,
        current: 150,
        unit: "từ",
        deadline: "2025-07-15",
        priority: "medium"
    }
];

// Sample study streaks
const sampleStreaks = [
    { category: "vocabulary", current_streak: 7, longest_streak: 15 },
    { category: "grammar", current_streak: 3, longest_streak: 10 },
    { category: "speaking", current_streak: 12, longest_streak: 18 },
    { category: "listening", current_streak: 5, longest_streak: 8 },
    { category: "reading", current_streak: 2, longest_streak: 6 },
    { category: "writing", current_streak: 1, longest_streak: 4 },
    { category: "overall", current_streak: 9, longest_streak: 21 }
];

async function addLearningGoalsData() {
    try {
        console.log('🚀 Starting Learning Goals data insertion...');

        // First, let's get a sample user (you can specify a specific user_id if needed)
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (usersError) {
            console.error('❌ Error fetching users:', usersError);
            return;
        }

        if (!users || users.length === 0) {
            console.error('❌ No users found. Please ensure you have at least one user in the database.');
            return;
        }

        const userId = users[0].id;
        console.log(`📝 Using user ID: ${userId}`);

        // Insert vocabulary entries
        console.log('📚 Inserting vocabulary entries...');
        const vocabularyData = sampleVocabulary.map(vocab => ({
            ...vocab,
            user_id: userId
        }));

        const { data: vocabInserted, error: vocabError } = await supabase
            .from('vocabulary_entries')
            .insert(vocabularyData)
            .select();

        if (vocabError) {
            console.error('❌ Error inserting vocabulary:', vocabError);
        } else {
            console.log(`✅ Successfully inserted ${vocabInserted.length} vocabulary entries`);
        }

        // Insert learning goals
        console.log('🎯 Inserting learning goals...');
        const goalsData = sampleGoals.map(goal => ({
            ...goal,
            user_id: userId
        }));

        const { data: goalsInserted, error: goalsError } = await supabase
            .from('learning_goals')
            .insert(goalsData)
            .select();

        if (goalsError) {
            console.error('❌ Error inserting goals:', goalsError);
        } else {
            console.log(`✅ Successfully inserted ${goalsInserted.length} learning goals`);
        }

        // Insert study streaks
        console.log('🔥 Inserting study streaks...');
        const streaksData = sampleStreaks.map(streak => ({
            ...streak,
            user_id: userId
        }));

        const { data: streaksInserted, error: streaksError } = await supabase
            .from('study_streaks')
            .insert(streaksData)
            .select();

        if (streaksError) {
            console.error('❌ Error inserting streaks:', streaksError);
        } else {
            console.log(`✅ Successfully inserted ${streaksInserted.length} study streaks`);
        }

        // Insert some sample learning progress entries
        console.log('📊 Inserting learning progress entries...');
        const progressData = [
            {
                user_id: userId,
                goal_id: goalsInserted?.[0]?.id,
                activity_type: 'vocabulary_learned',
                activity_data: { words_learned: ['conference', 'presentation'] },
                progress_value: 2,
                session_duration: 15,
                accuracy_score: 85.5
            },
            {
                user_id: userId,
                goal_id: goalsInserted?.[1]?.id,
                activity_type: 'speaking_session',
                activity_data: { topics_covered: ['daily_routine', 'hobbies'] },
                progress_value: 1,
                session_duration: 25,
                accuracy_score: 78.0
            },
            {
                user_id: userId,
                goal_id: goalsInserted?.[2]?.id,
                activity_type: 'grammar_practice',
                activity_data: { topics: ['present_perfect', 'passive_voice'] },
                progress_value: 2,
                session_duration: 20,
                accuracy_score: 92.0
            }
        ];

        const { data: progressInserted, error: progressError } = await supabase
            .from('learning_progress')
            .insert(progressData)
            .select();

        if (progressError) {
            console.error('❌ Error inserting progress:', progressError);
        } else {
            console.log(`✅ Successfully inserted ${progressInserted.length} progress entries`);
        }

        console.log('\n🎉 Learning Goals data insertion completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   - ${vocabInserted?.length || 0} vocabulary entries`);
        console.log(`   - ${goalsInserted?.length || 0} learning goals`);
        console.log(`   - ${streaksInserted?.length || 0} study streaks`);
        console.log(`   - ${progressInserted?.length || 0} progress entries`);
        console.log(`   - User ID: ${userId}`);

    } catch (error) {
        console.error('💥 Unexpected error:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    addLearningGoalsData()
        .then(() => {
            console.log('\n✨ Script execution completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Script failed:', error);
            process.exit(1);
        });
}

module.exports = { addLearningGoalsData };
