/**
 * Script to check and fix RLS policies for natural conversation system
 * Run this to ensure all policies are properly set up
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
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkAndFixRLSPolicies() {
    log('bold', '🔒 Checking and fixing RLS policies for natural conversation system\n');

    try {
        // Check current policies
        log('cyan', '📋 Checking current RLS policies...');
        
        const { data: policies, error: policiesError } = await supabase
            .rpc('get_policies');
        
        if (policiesError) {
            log('yellow', `⚠️  Could not fetch policies: ${policiesError.message}`);
        }

        // Fix natural_conversation_sessions policies
        log('blue', '\n🛠️  Fixing natural_conversation_sessions policies...');
        
        // Drop existing conflicting policies first
        await supabase.rpc('execute_sql', {
            sql: `
                DROP POLICY IF EXISTS "Users can read their own conversation sessions" ON public.natural_conversation_sessions;
                DROP POLICY IF EXISTS "Users can create their own conversation sessions" ON public.natural_conversation_sessions;
                DROP POLICY IF EXISTS "Users can update their own conversation sessions" ON public.natural_conversation_sessions;
                DROP POLICY IF EXISTS "Users can manage their own conversation sessions" ON public.natural_conversation_sessions;
            `
        });

        // Create comprehensive policy for sessions
        const sessionPolicySQL = `
            CREATE POLICY "Users can manage their own conversation sessions" ON public.natural_conversation_sessions
              FOR ALL 
              TO authenticated
              USING (user_id = auth.uid())
              WITH CHECK (user_id = auth.uid());
              
            CREATE POLICY "Service role can manage all conversation sessions" ON public.natural_conversation_sessions
              FOR ALL 
              TO service_role
              USING (true)
              WITH CHECK (true);
        `;

        const { error: sessionPolicyError } = await supabase.rpc('execute_sql', {
            sql: sessionPolicySQL
        });

        if (sessionPolicyError) {
            log('red', `❌ Error creating session policies: ${sessionPolicyError.message}`);
        } else {
            log('green', '✅ Session policies created successfully');
        }

        // Fix natural_conversation_messages policies
        log('blue', '\n🛠️  Fixing natural_conversation_messages policies...');
        
        await supabase.rpc('execute_sql', {
            sql: `
                DROP POLICY IF EXISTS "Users can read messages in their sessions" ON public.natural_conversation_messages;
                DROP POLICY IF EXISTS "Users can create messages in their sessions" ON public.natural_conversation_messages;
                DROP POLICY IF EXISTS "Users can manage messages in their sessions" ON public.natural_conversation_messages;
            `
        });

        const messagesPolicySQL = `
            CREATE POLICY "Users can manage messages in their sessions" ON public.natural_conversation_messages
              FOR ALL 
              TO authenticated
              USING (
                session_id IN (
                  SELECT id FROM natural_conversation_sessions 
                  WHERE user_id = auth.uid()
                )
              )
              WITH CHECK (
                session_id IN (
                  SELECT id FROM natural_conversation_sessions 
                  WHERE user_id = auth.uid()
                )
              );
              
            CREATE POLICY "Service role can manage all messages" ON public.natural_conversation_messages
              FOR ALL 
              TO service_role
              USING (true)
              WITH CHECK (true);
        `;

        const { error: messagesPolicyError } = await supabase.rpc('execute_sql', {
            sql: messagesPolicySQL
        });

        if (messagesPolicyError) {
            log('red', `❌ Error creating messages policies: ${messagesPolicyError.message}`);
        } else {
            log('green', '✅ Messages policies created successfully');
        }

        // Fix vocabulary_learning policies
        log('blue', '\n🛠️  Fixing vocabulary_learning policies...');
        
        await supabase.rpc('execute_sql', {
            sql: `
                DROP POLICY IF EXISTS "Users can read their own vocabulary" ON public.vocabulary_learning;
                DROP POLICY IF EXISTS "Users can create their own vocabulary" ON public.vocabulary_learning;
                DROP POLICY IF EXISTS "Users can update their own vocabulary" ON public.vocabulary_learning;
            `
        });

        const vocabPolicySQL = `
            CREATE POLICY "Users can manage their own vocabulary" ON public.vocabulary_learning
              FOR ALL 
              TO authenticated
              USING (user_id = auth.uid())
              WITH CHECK (user_id = auth.uid());
              
            CREATE POLICY "Service role can manage all vocabulary" ON public.vocabulary_learning
              FOR ALL 
              TO service_role
              USING (true)
              WITH CHECK (true);
        `;

        const { error: vocabPolicyError } = await supabase.rpc('execute_sql', {
            sql: vocabPolicySQL
        });

        if (vocabPolicyError) {
            log('red', `❌ Error creating vocabulary policies: ${vocabPolicyError.message}`);
        } else {
            log('green', '✅ Vocabulary policies created successfully');
        }

        // Test session creation with authenticated user
        log('cyan', '\n🧪 Testing session creation...');
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            log('blue', `Testing with user: ${user.email}`);
            
            const { data: testSession, error: testError } = await supabase
                .from('natural_conversation_sessions')
                .insert({
                    user_id: user.id,
                    title: 'Test Session',
                    conversation_mode: 'natural_group',
                    active_ai_ids: [],
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

            if (testError) {
                log('red', `❌ Test session creation failed: ${testError.message}`);
            } else {
                log('green', `✅ Test session created successfully: ${testSession.id}`);
                
                // Clean up test session
                await supabase
                    .from('natural_conversation_sessions')
                    .delete()
                    .eq('id', testSession.id);
                log('blue', '🧹 Test session cleaned up');
            }
        } else {
            log('yellow', '⚠️  No authenticated user found for testing');
        }

        log('bold', '\n🎉 RLS policies check and fix completed!');

    } catch (error) {
        log('red', `❌ Error in RLS policies check: ${error.message}`);
    }
}

// Run the script
if (require.main === module) {
    checkAndFixRLSPolicies()
        .then(() => {
            log('blue', '\n✅ Script execution completed');
            process.exit(0);
        })
        .catch(error => {
            log('red', `\n❌ Script execution failed: ${error.message}`);
            process.exit(1);
        });
}

module.exports = { checkAndFixRLSPolicies };
