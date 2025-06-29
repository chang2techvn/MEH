#!/usr/bin/env node

/**
 * Chat Realtime Test Suite
 * Tests the chat realtime functionality between multiple accounts
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configuration - Updated for direct messaging schema
const TEST_USERS = [
  { user_id: 'teacher1-user-id', password: 'teacher123456', name: 'Teacher 1' },
  { user_id: 'student1-user-id', password: 'student123456', name: 'Student 1' },  
  { user_id: 'student2-user-id', password: 'student123456', name: 'Student 2' }
]

const TEST_TIMEOUT = 30000 // 30 seconds timeout
const MESSAGE_WAIT_TIME = 3000 // Wait 3 seconds for realtime messages

class ChatRealtimeTest {
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('❌ Missing Supabase environment variables')
    }

    this.supabase = createClient(this.supabaseUrl, this.supabaseKey)
    this.clients = new Map() // Store client instances for each user
    this.conversations = []
    this.messagesSent = 0
    this.messagesReceived = 0
    this.receivedMessages = []
    this.testStartTime = Date.now()
  }

  log(message) {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${message}`)
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async preFlightChecks() {
    this.log('🔍 Running pre-flight checks...')
    
    try {
      // Test database connection
      const { data, error } = await this.supabase.from('profiles').select('id').limit(1)
      if (error) throw error
      this.log('✅ Database connection successful')
      
      // Test realtime connection
      const channel = this.supabase.channel('test-connection')
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Realtime connection timeout')), 5000)
        
        channel.on('presence', { event: 'sync' }, () => {
          clearTimeout(timeout)
          resolve()
        })
        
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout)
            resolve()
          }
        })
      })
      
      await this.supabase.removeChannel(channel)
      this.log('✅ Realtime connection successful')
      
    } catch (error) {
      this.log(`❌ Pre-flight check failed: ${error.message}`)
      throw error
    }
  }

  async authenticateUsers() {
    this.log('📝 Step 1: Authenticating test users...')
    
    for (const testUser of TEST_USERS) {
      try {
        // Create separate client for each user to simulate multiple sessions
        const client = createClient(this.supabaseUrl, this.supabaseKey)
        
        const { data, error } = await client.auth.signInWithPassword({
          email: testUser.email,
          password: testUser.password
        })
        
        if (error) throw error
        
        this.clients.set(testUser.email, {
          client,
          user: data.user,
          name: testUser.name,
          email: testUser.email
        })
        
        this.log(`✅ Authenticated user: ${testUser.email}`)
        
      } catch (error) {
        this.log(`❌ Failed to authenticate ${testUser.email}: ${error.message}`)
        throw error
      }
    }
  }

  async createTestConversations() {
    this.log('📝 Step 2: Creating test conversations...')
    
    const clientEntries = Array.from(this.clients.entries())
    
    // Create conversation between teacher and student1
    const conversation1 = await this.createConversation(
      clientEntries[0][1], // teacher
      [clientEntries[1][1].user.id] // student1
    )
    this.conversations.push(conversation1)
    this.log(`✅ Created conversation: ${conversation1.id}`)
    
    // Create conversation between teacher and student2
    const conversation2 = await this.createConversation(
      clientEntries[0][1], // teacher
      [clientEntries[2][1].user.id] // student2
    )
    this.conversations.push(conversation2)
    this.log(`✅ Created conversation: ${conversation2.id}`)
  }

  async createConversation(creatorClient, participantIds) {
    try {
      // Create conversation
      const { data: conversationData, error: convError } = await creatorClient.client
        .from('conversations')
        .insert({
          name: null,
          created_by: creatorClient.user.id
        })
        .select()
        .single()
      
      if (convError) throw convError
      
      // Add participants
      const participants = [
        { conversation_id: conversationData.id, user_id: creatorClient.user.id },
        ...participantIds.map(id => ({ conversation_id: conversationData.id, user_id: id }))
      ]
      
      const { error: participantsError } = await creatorClient.client
        .from('conversation_participants')
        .insert(participants)
      
      if (participantsError) throw participantsError
      
      return conversationData
      
    } catch (error) {
      this.log(`❌ Error creating conversation: ${error.message}`)
      throw error
    }
  }

  async setupRealtimeListeners() {
    this.log('📝 Step 3: Setting up realtime listeners...')
    
    for (const [email, clientData] of this.clients.entries()) {
      try {
        const channel = clientData.client
          .channel(`messages-${clientData.user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages'
            },
            (payload) => {
              // Only count messages from our test (with [TEST] prefix)
              if (payload.new.content.includes('[TEST]')) {
                this.messagesReceived++
                this.receivedMessages.push({
                  recipient: email,
                  content: payload.new.content,
                  timestamp: new Date().toISOString(),
                  sender_id: payload.new.sender_id
                })
                this.log(`📨 ${email} received realtime message: "${payload.new.content}"`)
              }
            }
          )
          .subscribe()
        
        // Store channel for cleanup
        clientData.channel = channel
        
        // Wait a bit for subscription to be active
        await this.sleep(1000)
        this.log(`✅ Realtime subscription active for ${email}`)
        
      } catch (error) {
        this.log(`❌ Failed to set up realtime for ${email}: ${error.message}`)
        throw error
      }
    }
    
    // Extra wait to ensure all subscriptions are ready
    await this.sleep(2000)
  }

  async sendTestMessages() {
    this.log('📝 Step 4: Sending test messages...')
    
    const clientEntries = Array.from(this.clients.entries())
    const teacher = clientEntries[0][1]
    const student1 = clientEntries[1][1] 
    const student2 = clientEntries[2][1]
    
    const testMessages = [
      {
        sender: teacher,
        conversationId: this.conversations[0].id,
        content: '[TEST] Hello Student 1! This is a test message from the teacher.',
        recipient: 'student1@university.edu'
      },
      {
        sender: student1,
        conversationId: this.conversations[0].id,
        content: '[TEST] Hello Teacher! Thanks for the message.',
        recipient: 'teacher1@university.edu'
      },
      {
        sender: teacher,
        conversationId: this.conversations[1].id,
        content: '[TEST] Hey Student 2! How are your English studies going?',
        recipient: 'student2@university.edu'
      },
      {
        sender: student2,
        conversationId: this.conversations[1].id,
        content: '[TEST] Hi there! They are going great, thank you!',
        recipient: 'teacher1@university.edu'
      }
    ]
    
    for (const message of testMessages) {
      try {
        const { error } = await message.sender.client
          .from('messages')
          .insert({
            conversation_id: message.conversationId,
            content: message.content,
            sender_id: message.sender.user.id
          })
        
        if (error) throw error
        
        this.messagesSent++
        this.log(`✅ Message sent: "${message.content}" to conversation ${message.conversationId}`)
        
        // Wait between messages to avoid rate limiting
        await this.sleep(500)
        
      } catch (error) {
        this.log(`❌ Failed to send message: ${error.message}`)
        throw error
      }
    }
    
    // Wait for realtime messages to be received
    this.log(`⏳ Waiting ${MESSAGE_WAIT_TIME/1000} seconds for realtime message delivery...`)
    await this.sleep(MESSAGE_WAIT_TIME)
  }

  async analyzeResults() {
    this.log('📝 Step 5: Analyzing test results...')
    this.log('==================================================')
    
    const successRate = this.messagesSent > 0 ? (this.messagesReceived / this.messagesSent) * 100 : 0
    const testDuration = Date.now() - this.testStartTime
    
    console.log(`📈 Messages sent: ${this.messagesSent}`)
    console.log(`📨 Messages received via realtime: ${this.messagesReceived}`)
    console.log(`🎯 Success rate: ${successRate.toFixed(1)}%`)
    console.log(`⏱️  Test duration: ${(testDuration / 1000).toFixed(1)} seconds`)
    
    if (successRate === 100) {
      this.log('✅ All realtime messages received successfully!')
    } else if (successRate >= 80) {
      this.log('⚠️  Most messages received, but some may be delayed')
    } else {
      this.log('❌ Significant message delivery issues detected')
    }
    
    if (this.receivedMessages.length > 0) {
      console.log('\n📝 Detailed Results:')
      this.receivedMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.recipient} received: "${msg.content}"`)
      })
    }
    
    console.log('\n🔍 Recommendations:')
    if (successRate === 100) {
      console.log('  ✅ Chat realtime system is working perfectly!')
      console.log('  ✅ All users can send and receive messages in real-time')
      console.log('  ✅ No message delivery issues detected')
    } else if (successRate >= 80) {
      console.log('  ⚠️  Chat system mostly working, consider investigating delays')
      console.log('  💡 Check network connectivity and Supabase realtime status')
    } else {
      console.log('  ❌ Critical issues with chat realtime system')
      console.log('  💡 Check Supabase configuration and RLS policies')
      console.log('  💡 Verify WebSocket connections are not being blocked')
    }
    
    return successRate
  }

  async cleanup() {
    this.log('📝 Cleaning up connections...')
    
    try {
      // Remove all channels and sign out users
      for (const [email, clientData] of this.clients.entries()) {
        if (clientData.channel) {
          await clientData.client.removeChannel(clientData.channel)
        }
        await clientData.client.auth.signOut()
      }
      
      // Clean up test conversations (optional - comment out if you want to keep them)
      for (const conversation of this.conversations) {
        await this.supabase.from('conversations').delete().eq('id', conversation.id)
      }
      
      this.log('✅ Cleanup completed')
      
    } catch (error) {
      this.log(`⚠️  Cleanup warning: ${error.message}`)
    }
  }

  async run() {
    console.log('🧪 Chat Realtime Test Suite')
    console.log('==================================================')
    
    try {
      await this.preFlightChecks()
      this.log('🚀 Starting Chat Realtime Test...')
      
      await this.authenticateUsers()
      await this.createTestConversations()
      await this.setupRealtimeListeners()
      await this.sendTestMessages()
      
      const successRate = await this.analyzeResults()
      
      await this.cleanup()
      
      // Exit with appropriate code
      process.exit(successRate === 100 ? 0 : 1)
      
    } catch (error) {
      this.log(`💥 Test failed: ${error.message}`)
      await this.cleanup()
      process.exit(1)
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted by user')
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error.message)
  process.exit(1)
})

// Run the test
if (require.main === module) {
  const test = new ChatRealtimeTest()
  test.run().catch(error => {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  })
}

module.exports = ChatRealtimeTest
