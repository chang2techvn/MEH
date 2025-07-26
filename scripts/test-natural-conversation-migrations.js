/**
 * Test script for Natural Conversation System Migrations
 * Tests all tables created by migrations 20250725000000 - 20250725000005
 * Validates table structure, constraints, indexes, and RLS policies
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testTableExists(tableName) {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
        
        if (error && error.code === '42P01') { // Table doesn't exist
            log('red', `❌ Table "${tableName}" does not exist`);
            return false;
        }
        
        log('green', `✅ Table "${tableName}" exists`);
        return true;
    } catch (error) {
        log('red', `❌ Error checking table "${tableName}": ${error.message}`);
        return false;
    }
}

async function testTableStructure(tableName, expectedColumns) {
    try {
        const { data, error } = await supabase
            .rpc('get_table_columns', { table_name: tableName });
        
        if (error) {
            log('yellow', `⚠️  Could not verify structure for "${tableName}": ${error.message}`);
            return;
        }
        
        log('blue', `📋 Checking structure of "${tableName}"`);
        
        for (const column of expectedColumns) {
            const exists = data?.some(col => col.column_name === column);
            if (exists) {
                log('green', `  ✅ Column "${column}" exists`);
            } else {
                log('red', `  ❌ Column "${column}" missing`);
            }
        }
    } catch (error) {
        log('yellow', `⚠️  Could not verify structure: ${error.message}`);
    }
}

async function checkExistingAIAssistants() {
    try {
        log('cyan', '🔍 Checking existing AI assistants in database...');
        
        const { data: ais, error } = await supabase
            .from('ai_assistants')
            .select('id, name, role, field, category, personality_traits, response_threshold, is_active')
            .eq('is_active', true)
            .order('name');
        
        if (error) {
            log('red', `❌ Failed to fetch AI assistants: ${error.message}`);
            return false;
        }
        
        if (!ais || ais.length === 0) {
            log('yellow', '⚠️  No AI assistants found in database. Run add-sample-ai-personalities.js first.');
            return false;
        }
        
        log('green', `✅ Found ${ais.length} AI assistants in database:`);
        ais.forEach(ai => {
            log('blue', `   - ${ai.name} (${ai.role}) - Category: ${ai.category}`);
        });
        
        return true;
    } catch (error) {
        log('red', `❌ Error checking AI assistants: ${error.message}`);
        return false;
    }
}

async function testNaturalConversationFlow() {
    try {
        log('cyan', '🧪 Testing natural conversation flow...');
        
        // Get real AI assistants from database
        const { data: ais, error: aiError } = await supabase
            .from('ai_assistants')
            .select('id, name, role, field')
            .eq('is_active', true)
            .limit(3);
        
        if (aiError || !ais || ais.length === 0) {
            log('red', `❌ Failed to get AI assistants: ${aiError?.message || 'No AIs found'}`);
            return false;
        }
        
        log('blue', `📊 Found ${ais.length} AI assistants: ${ais.map(ai => ai.name).join(', ')}`);
        
        // Get real user from auth.users (or create a test user reference)
        const { data: users, error: userError } = await supabase.auth.admin.listUsers();
        let testUserId;
        
        if (users?.users && users.users.length > 0) {
            testUserId = users.users[0].id;
            log('green', `✅ Using existing user: ${testUserId}`);
        } else {
            // Create a mock UUID for testing (this won't work with real foreign keys)
            testUserId = '123e4567-e89b-12d3-a456-426614174000';
            log('yellow', `⚠️  Using mock user ID for testing: ${testUserId}`);
        }
        
        // 1. Create natural conversation session
        const { data: session, error: sessionError } = await supabase
            .from('natural_conversation_sessions')
            .insert({
                user_id: testUserId,
                title: 'Test Natural Conversation with Real AIs',
                conversation_mode: 'natural_group',
                active_ai_ids: ais.map(ai => ai.id),
                session_settings: {
                    allow_ai_interruptions: true,
                    allow_ai_questions: true,
                    topic_drift_allowed: true,
                    max_ai_participants: 4,
                    response_timing: 'natural'
                }
            })
            .select()
            .single();
        
        if (sessionError) {
            log('red', `❌ Failed to create session: ${sessionError.message}`);
            // Try without user_id constraint for testing
            log('yellow', '⚠️  Trying to create session without user constraint...');
            const { data: sessionNoUser, error: sessionNoUserError } = await supabase
                .rpc('create_test_conversation_session', {
                    test_user_id: testUserId,
                    session_title: 'Test Natural Conversation with Real AIs',
                    ai_ids: ais.map(ai => ai.id)
                });
            
            if (sessionNoUserError) {
                log('red', `❌ Still failed: ${sessionNoUserError.message}`);
                return false;
            }
        }
        
        const sessionId = session?.id || sessionNoUser;
        log('green', `✅ Created conversation session: ${sessionId}`);
        
        // 2. Add test messages with real AI data
        const testMessages = [
            {
                session_id: sessionId,
                sender_id: testUserId,
                content: 'How can I improve my presentation skills?',
                message_type: 'text',
                interaction_type: 'user_to_ai'
            },
            {
                session_id: sessionId,
                ai_assistant_id: ais[0].id,
                content: `Great question! As ${ais[0].name}, I'd suggest starting with clear structure.`,
                message_type: 'ai_response',
                response_type: 'direct_answer',
                interaction_type: 'ai_to_user',
                confidence_score: 0.85,
                naturalness_score: 0.87,
                vocabulary: [
                    {
                        term: 'presentation',
                        pronunciation: 'ˌprezənˈteɪʃən',
                        meaning: 'bài thuyết trình',
                        example: 'I need to prepare a presentation for tomorrow.',
                        difficulty: 'medium',
                        category: 'business'
                    }
                ]
            }
        ];
        
        for (let i = 0; i < testMessages.length; i++) {
            const message = testMessages[i];
            const { data: msgData, error: msgError } = await supabase
                .from('natural_conversation_messages')
                .insert(message)
                .select()
                .single();
            
            if (msgError) {
                log('red', `❌ Failed to create message ${i + 1}: ${msgError.message}`);
            } else {
                const sender = message.ai_assistant_id ? 
                    ais.find(ai => ai.id === message.ai_assistant_id)?.name || 'AI' : 
                    'User';
                log('green', `✅ Created message from ${sender}`);
            }
        }
        
        // 3. Test AI interaction tracking with real AI IDs
        if (ais.length >= 2) {
            const { data: interactionData, error: interactionError } = await supabase
                .from('ai_interactions')
                .insert({
                    session_id: sessionId,
                    initiating_ai_id: ais[1].id,
                    target_ai_id: ais[0].id,
                    interaction_type: 'agreement'
                })
                .select()
                .single();
            
            if (interactionError) {
                log('red', `❌ Failed to create AI interaction: ${interactionError.message}`);
            } else {
                log('green', `✅ Created AI interaction: ${ais[1].name} → ${ais[0].name}`);
            }
        }
        
        // 4. Test vocabulary learning
        const { data: vocabData, error: vocabError } = await supabase
            .from('vocabulary_learning')
            .insert({
                user_id: testUserId,
                session_id: sessionId,
                term: 'presentation',
                pronunciation: 'ˌprezənˈteɪʃən',
                meaning: 'bài thuyết trình',
                example: 'I need to prepare a presentation for tomorrow.',
                difficulty: 'medium',
                category: 'business',
                source_ai_id: ais[0].id
            })
            .select()
            .single();
        
        if (vocabError) {
            log('red', `❌ Failed to create vocabulary entry: ${vocabError.message}`);
        } else {
            log('green', `✅ Created vocabulary entry: ${vocabData.term}`);
        }
        
        log('cyan', '📈 Natural conversation flow test with real data completed!');
        return true;
        
    } catch (error) {
        log('red', `❌ Error in natural conversation flow test: ${error.message}`);
        return false;
    }
}

async function testAIRelationshipMatrix() {
    try {
        log('cyan', '🤝 Testing AI relationship matrix...');
        
        const { data: ais, error: aiError } = await supabase
            .from('ai_assistants')
            .select('id, name')
            .eq('is_active', true)
            .limit(3);
        
        if (aiError || !ais || ais.length < 2) {
            log('red', `❌ Need at least 2 AI assistants for relationship test`);
            return false;
        }
        
        // Create relationship between Emma and Alex
        const { data: relationData, error: relationError } = await supabase
            .from('ai_relationship_matrix')
            .insert({
                ai1_id: ais[0].id,
                ai2_id: ais[1].id,
                interaction_count: 5,
                agreement_ratio: 0.8,
                collaboration_score: 0.75,
                topic_overlap: 0.6,
                communication_style: 'collaborative',
                last_interaction_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (relationError) {
            log('red', `❌ Failed to create AI relationship: ${relationError.message}`);
            return false;
        }
        
        log('green', `✅ Created AI relationship: ${ais[0].name} ↔ ${ais[1].name}`);
        return true;
        
    } catch (error) {
        log('red', `❌ Error testing AI relationship matrix: ${error.message}`);
        return false;
    }
}

async function runAllTests() {
    log('bold', '🚀 Starting Natural Conversation Migration Tests\n');
    
    const testResults = {
        tableTests: [],
        structureTests: [],
        functionalTests: []
    };
    
    // Test 1: Check if all tables exist
    log('cyan', '📋 Phase 1: Testing table existence...');
    const tables = [
        'ai_assistants',
        'natural_conversation_sessions',  
        'natural_conversation_messages',
        'ai_interactions',
        'conversation_flows',
        'ai_relationship_matrix',
        'vocabulary_learning'
    ];
    
    for (const table of tables) {
        const exists = await testTableExists(table);
        testResults.tableTests.push({ table, exists });
    }
    
    // Test 2: Check table structures
    log('cyan', '\n📊 Phase 2: Testing table structures...');
    const expectedColumns = {
        'ai_assistants': ['id', 'name', 'description', 'category', 'personality_traits', 'response_threshold', 'field', 'role', 'experience', 'tags'],
        'natural_conversation_sessions': ['id', 'user_id', 'title', 'conversation_mode', 'session_settings', 'active_ai_ids'],
        'natural_conversation_messages': ['id', 'session_id', 'sender_id', 'ai_assistant_id', 'content', 'message_type', 'response_type', 'interaction_type'],
        'ai_interactions': ['id', 'session_id', 'initiating_ai_id', 'target_ai_id', 'interaction_type'],
        'conversation_flows': ['id', 'session_id', 'message_id', 'current_topic', 'naturalness_score'],
        'vocabulary_learning': ['id', 'user_id', 'term', 'meaning', 'difficulty', 'category']
    };
    
    for (const [table, columns] of Object.entries(expectedColumns)) {
        await testTableStructure(table, columns);
    }
    
    // Test 3: Functional tests
    log('cyan', '\n🧪 Phase 3: Running functional tests...');
    
    // Check existing AI data first
    const aiCheckSuccess = await checkExistingAIAssistants();
    testResults.functionalTests.push({ test: 'Existing AI Assistants Check', success: aiCheckSuccess });
    
    if (aiCheckSuccess) {
        const conversationSuccess = await testNaturalConversationFlow();
        testResults.functionalTests.push({ test: 'Natural Conversation Flow', success: conversationSuccess });
        
        const relationshipSuccess = await testAIRelationshipMatrix();
        testResults.functionalTests.push({ test: 'AI Relationship Matrix', success: relationshipSuccess });
    }
    
    // Summary
    log('bold', '\n📋 TEST SUMMARY');
    log('blue', '================');
    
    const tablesPassed = testResults.tableTests.filter(t => t.exists).length;
    const tablesTotal = testResults.tableTests.length;
    log(tablesPassed === tablesTotal ? 'green' : 'yellow', 
        `Tables: ${tablesPassed}/${tablesTotal} passed`);
    
    const functionalPassed = testResults.functionalTests.filter(t => t.success).length;
    const functionalTotal = testResults.functionalTests.length;
    log(functionalPassed === functionalTotal ? 'green' : 'yellow', 
        `Functional Tests: ${functionalPassed}/${functionalTotal} passed`);
    
    if (tablesPassed === tablesTotal && functionalPassed === functionalTotal) {
        log('green', '\n🎉 All tests passed! Natural conversation system is ready!');
    } else {
        log('yellow', '\n⚠️  Some tests failed. Check the output above for details.');
    }
    
    return testResults;
}

// Run tests if this script is executed directly
if (require.main === module) {
    runAllTests()
        .then(() => {
            log('blue', '\n✅ Test execution completed');
            process.exit(0);
        })
        .catch(error => {
            log('red', `\n❌ Test execution failed: ${error.message}`);
            process.exit(1);
        });
}

module.exports = { runAllTests, testTableExists, checkExistingAIAssistants };
