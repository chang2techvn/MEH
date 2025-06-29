#!/usr/bin/env node

/**
 * Direct Chat Test Suite
 * Tests direct messaging functionality based on actual database schema
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

class DirectChatTest {
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('❌ Missing Supabase environment variables')
    }

    this.supabase = createClient(this.supabaseUrl, this.supabaseKey)
    this.testUsers = []
    this.messagesSent = 0
    this.messagesReceived = 0
    this.receivedMessages = []
    this.channels = []
    this.testStartTime = Date.now()
  }

  log(message) {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${message}`)
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getTestUsers() {
    this.log('📝 Step 1: Getting test users from database...')
    
    try {
      const { data: users, error } = await this.supabase
        .from('profiles')
        .select('id, user_id, full_name, username')
        .limit(3)
      
      if (error) throw error
      
      this.testUsers = users
      this.log(`✅ Found ${users.length} test users:`)
      users.forEach(user => {
        this.log(`   - ${user.full_name || user.username} (ID: ${user.user_id})`)
      })
      
      return users
      
    } catch (error) {
      this.log(`❌ Error getting test users: ${error.message}`)
      throw error
    }
  }

  async setupRealtimeListeners() {
    this.log('📝 Step 2: Setting up realtime listeners...')
    
    for (const user of this.testUsers) {
      try {
        const channel = this.supabase
          .channel(`messages-${user.user_id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `receiver_id=eq.${user.user_id}`
            },
            (payload) => {
              // Only count test messages
              if (payload.new.content.includes('[TEST]')) {
                this.messagesReceived++
                this.receivedMessages.push({
                  receiver: user.full_name || user.username,
                  receiver_id: user.user_id,
                  content: payload.new.content,
                  timestamp: new Date().toISOString(),
                  sender_id: payload.new.sender_id
                })
                this.log(`📨 ${user.full_name || user.username} received realtime message: "${payload.new.content}"`)
              }
            }
          )
          .subscribe()
        
        this.channels.push(channel)
        await this.sleep(1000)
        this.log(`✅ Realtime listener active for ${user.full_name || user.username}`)
        
      } catch (error) {
        this.log(`❌ Failed to set up realtime for ${user.full_name || user.username}: ${error.message}`)
        throw error
      }
    }
    
    // Extra wait to ensure all subscriptions are ready
    await this.sleep(2000)
  }

  async sendDirectMessage(senderId, receiverId, content) {
    try {
      const { error } = await this.supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content: content,
          message_type: 'text',
          is_read: false
        })
      
      if (error) throw error
      
      this.messagesSent++
      this.log(`✅ Message sent: "${content}" from ${senderId} to ${receiverId}`)
      
    } catch (error) {
      this.log(`❌ Failed to send message: ${error.message}`)
      throw error
    }
  }

  async sendTestMessages() {
    this.log('📝 Step 3: Sending test messages...')
    
    if (this.testUsers.length < 2) {
      throw new Error('Need at least 2 users for testing')
    }
    
    const user1 = this.testUsers[0]
    const user2 = this.testUsers[1]
    const user3 = this.testUsers[2] || user1 // Fallback if only 2 users
    
    const testMessages = [
      {
        sender: user1.user_id,
        receiver: user2.user_id,
        content: `[TEST] Hello ${user2.full_name || user2.username}! This is a test message from ${user1.full_name || user1.username}.`
      },
      {
        sender: user2.user_id,
        receiver: user1.user_id,
        content: `[TEST] Hi ${user1.full_name || user1.username}! Thanks for the message!`
      },
      {
        sender: user1.user_id,
        receiver: user3.user_id,
        content: `[TEST] Hey ${user3.full_name || user3.username}! How are you doing?`
      },
      {
        sender: user3.user_id,
        receiver: user1.user_id,
        content: `[TEST] Hi there ${user1.full_name || user1.username}! I'm doing great!`
      }
    ]
    
    for (const message of testMessages) {
      await this.sendDirectMessage(message.sender, message.receiver, message.content)
      await this.sleep(1000) // Wait between messages
    }
    
    // Wait for realtime messages to be received
    this.log('⏳ Waiting 5 seconds for realtime message delivery...')
    await this.sleep(5000)
  }

  async analyzeResults() {
    this.log('📝 Step 4: Analyzing test results...')
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
        console.log(`  ${index + 1}. ${msg.receiver} received: "${msg.content}"`)
      })
    }
    
    console.log('\n🔍 Recommendations:')
    if (successRate === 100) {
      console.log('  ✅ Direct chat realtime system is working perfectly!')
      console.log('  ✅ All users can send and receive messages in real-time')
      console.log('  ✅ No message delivery issues detected')
    } else if (successRate >= 80) {
      console.log('  ⚠️  Chat system mostly working, consider investigating delays')
      console.log('  💡 Check network connectivity and Supabase realtime status')
    } else {
      console.log('  ❌ Critical issues with direct chat realtime system')
      console.log('  💡 Check Supabase configuration and RLS policies')
      console.log('  💡 Verify WebSocket connections are not being blocked')
    }
    
    return successRate
  }

  async cleanup() {
    this.log('📝 Cleaning up connections...')
    
    try {
      // Remove all channels
      for (const channel of this.channels) {
        await this.supabase.removeChannel(channel)
      }
      
      this.log('✅ Cleanup completed')
      
    } catch (error) {
      this.log(`⚠️  Cleanup warning: ${error.message}`)
    }
  }

  async run() {
    console.log('🧪 Direct Chat Realtime Test Suite')
    console.log('==================================================')
    
    try {
      this.log('🚀 Starting Direct Chat Realtime Test...')
      
      await this.getTestUsers()
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
  const test = new DirectChatTest()
  test.run().catch(error => {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  })
}

module.exports = DirectChatTest
