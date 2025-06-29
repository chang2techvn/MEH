/**
 * Simple script to send a test message to verify realtime UI
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ozdkuwvddmolbmfmkxzd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZGt1d3ZkZG1vbGJtZm1reHpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDA0OTcwMCwiZXhwIjoyMDQ5NjI1NzAwfQ.1QoVw2LKXtfr5FTL0JqaONlvVT0VbTQ1xrS5IrKZLoc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function sendTestMessage() {
  try {
    console.log('🧪 Sending test message...')
    
    // Get teacher accounts
    const { data: teachers, error: teacherError } = await supabase
      .from('users')
      .select('*')
      .in('email', ['teacher1@university.edu', 'teacher2@university.edu'])
      .order('email')
    
    if (teacherError || !teachers || teachers.length !== 2) {
      console.error('❌ Could not find teachers:', teacherError)
      return
    }

    const [teacher1, teacher2] = teachers
    console.log(`👥 Found teachers: ${teacher1.name} and ${teacher2.name}`)

    // Get conversation between teachers
    const { data: conversation, error: convError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner(id, title)
      `)
      .eq('user_id', teacher1.id)
      .limit(1)
      .single()

    if (convError || !conversation) {
      console.error('❌ No conversation found:', convError)
      return
    }

    const conversationId = conversation.conversation_id
    console.log(`💬 Using conversation: ${conversationId}`)

    // Send test message from teacher2 to teacher1
    const testMessage = `Test message from ${teacher2.name} at ${new Date().toLocaleTimeString()}`
    
    console.log(`📤 Sending: "${testMessage}"`)
    
    const { data: messageData, error: messageError } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: teacher2.id,
        content: testMessage,
        message_type: 'text',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (messageError) {
      console.error('❌ Failed to send message:', messageError)
      return
    }

    console.log('✅ Message sent successfully!')
    console.log('👀 Check the teacher1 UI to see if message appears instantly!')
    console.log(`📨 Message details:`, messageData)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

console.log(`
🧪 TEST MESSAGE SENDER

This script will send a test message from teacher2 to teacher1.

INSTRUCTIONS:
1. Open browser and log in as teacher1@university.edu
2. Open the chat with teacher2
3. Keep the chat window visible
4. Run this script
5. You should see the message appear instantly WITHOUT refreshing the page

Starting in 3 seconds...
`)

setTimeout(sendTestMessage, 3000)
