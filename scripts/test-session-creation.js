/**
 * Simple script to test natural conversation session creation
 * This will help us debug the authentication and RLS issues
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

// Create both anon and service clients
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSessionCreation() {
    log('bold', '🧪 Testing natural conversation session creation\n');

    try {
        // Test 1: Check authentication
        log('cyan', '1. Checking authentication...');
        const { data: { user }, error: authError } = await supabaseAnon.auth.getUser();
        
        if (authError) {
            log('red', `❌ Auth error: ${authError.message}`);
            return;
        }

        if (!user) {
            log('yellow', '⚠️  No authenticated user found. Please login first.');
            
            // Try to sign in with test credentials
            log('blue', 'Attempting to sign in with test user...');
            const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
                email: 'teacher1@university.edu',
                password: 'teacher123'
            });

            if (signInError) {
                log('red', `❌ Sign in failed: ${signInError.message}`);
                return;
            }

            log('green', `✅ Signed in as: ${signInData.user?.email}`);
        } else {
            log('green', `✅ Already authenticated as: ${user.email}`);
        }

        // Test 2: Get AI assistants for the session
        log('cyan', '\n2. Getting AI assistants...');
        const { data: aiAssistants, error: aiError } = await supabaseAnon
            .from('ai_assistants')
            .select('id, name')
            .eq('is_active', true)
            .limit(2);

        if (aiError) {
            log('red', `❌ Failed to get AI assistants: ${aiError.message}`);
            return;
        }

        if (!aiAssistants || aiAssistants.length === 0) {
            log('yellow', '⚠️  No AI assistants found');
            return;
        }

        log('green', `✅ Found ${aiAssistants.length} AI assistants: ${aiAssistants.map(ai => ai.name).join(', ')}`);

        // Test 3: Try to create session with anon client (normal user flow)
        log('cyan', '\n3. Testing session creation with authenticated user...');
        
        const { data: { user: currentUser } } = await supabaseAnon.auth.getUser();
        
        const sessionData = {
            user_id: currentUser.id,
            title: `Test Chat with ${aiAssistants.length} AIs`,
            conversation_mode: 'natural_group',
            active_ai_ids: aiAssistants.map(ai => ai.id),
            session_settings: {
                allow_ai_interruptions: true,
                allow_ai_questions: true,
                topic_drift_allowed: true,
                max_ai_participants: 4,
                response_timing: 'natural'
            }
        };

        log('blue', `Attempting to create session for user: ${currentUser.id}`);
        
        const { data: session, error: sessionError } = await supabaseAnon
            .from('natural_conversation_sessions')
            .insert(sessionData)
            .select()
            .single();

        if (sessionError) {
            log('red', `❌ Session creation failed: ${sessionError.message}`);
            log('yellow', `Error code: ${sessionError.code}`);
            log('yellow', `Error details: ${sessionError.details}`);
            
            // Test 4: Try with service role to check if it's a policy issue
            log('cyan', '\n4. Testing with service role...');
            const { data: serviceSession, error: serviceError } = await supabaseService
                .from('natural_conversation_sessions')
                .insert(sessionData)
                .select()
                .single();

            if (serviceError) {
                log('red', `❌ Service role also failed: ${serviceError.message}`);
            } else {
                log('green', `✅ Service role succeeded - this is an RLS policy issue`);
                log('blue', `Session ID: ${serviceSession.id}`);
                
                // Clean up
                await supabaseService
                    .from('natural_conversation_sessions')
                    .delete()
                    .eq('id', serviceSession.id);
                log('blue', '🧹 Test session cleaned up');
            }
        } else {
            log('green', `✅ Session created successfully!`);
            log('blue', `Session ID: ${session.id}`);
            log('blue', `Session title: ${session.title}`);
            
            // Test 5: Try to create a message in this session
            log('cyan', '\n5. Testing message creation...');
            
            const messageData = {
                session_id: session.id,
                sender_id: currentUser.id,
                content: 'Hello, this is a test message!',
                message_type: 'text',
                interaction_type: 'user_to_ai'
            };

            const { data: message, error: messageError } = await supabaseAnon
                .from('natural_conversation_messages')
                .insert(messageData)
                .select()
                .single();

            if (messageError) {
                log('red', `❌ Message creation failed: ${messageError.message}`);
            } else {
                log('green', `✅ Message created successfully!`);
                log('blue', `Message ID: ${message.id}`);
            }

            // Clean up
            await supabaseAnon
                .from('natural_conversation_sessions')
                .delete()
                .eq('id', session.id);
            log('blue', '🧹 Test session cleaned up');
        }

    } catch (error) {
        log('red', `❌ Unexpected error: ${error.message}`);
        console.error(error);
    }
}

// Run the test
if (require.main === module) {
    testSessionCreation()
        .then(() => {
            log('blue', '\n✅ Test completed');
            process.exit(0);
        })
        .catch(error => {
            log('red', `\n❌ Test failed: ${error.message}`);
            process.exit(1);
        });
}

module.exports = { testSessionCreation };
