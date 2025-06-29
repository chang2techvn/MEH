"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useChat } from "@/contexts/chat-context-realtime"
import { useAuth } from "@/contexts/auth-context"

interface TestUser {
  id: string
  email: string
  full_name: string
  role: string
}

interface TestMessage {
  id: string
  content: string
  sender_id: string
  sender_name: string
  created_at: string
  conversation_id: string
}

export default function ChatTestPage() {
  const { user } = useAuth()
  const { 
    conversations, 
    sendMessage,
    loadConversations
  } = useChat()
  
  const [testUsers, setTestUsers] = useState<TestUser[]>([])
  const [selectedUser, setSelectedUser] = useState<TestUser | null>(null)
  const [testMessage, setTestMessage] = useState("Hello! This is a test message from chat testing system.")
  const [testMessages, setTestMessages] = useState<TestMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("Unknown")

  // Load test users
  useEffect(() => {
    loadTestUsers()
    checkRealtimeConnection()
  }, [])

  // Listen for test messages
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('test-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `content.ilike.*test message*`
        },
        (payload) => {
          console.log('📨 Test message received:', payload)
          fetchTestMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const loadTestUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .neq('id', user?.id)
        .limit(10)

      if (error) throw error
      setTestUsers(data || [])
    } catch (error) {
      console.error('Error loading test users:', error)
      setStatus(`❌ Error loading users: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const fetchTestMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          conversation_id,
          profiles:sender_id (full_name)
        `)
        .ilike('content', '%test message%')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      
      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        sender_name: (msg.profiles as any)?.full_name || 'Unknown',
        created_at: msg.created_at,
        conversation_id: msg.conversation_id
      })) || []

      setTestMessages(formattedMessages)
    } catch (error) {
      console.error('Error fetching test messages:', error)
    }
  }

  const createConversation = async (participantIds: string[]) => {
    try {
      // Create conversation in database
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .insert({
          name: null, // Private conversation
          created_by: user?.id
        })
        .select()
        .single()

      if (convError) throw convError

      // Add participants
      const participants = [
        { conversation_id: conversationData.id, user_id: user?.id },
        ...participantIds.map(id => ({ conversation_id: conversationData.id, user_id: id }))
      ]

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants)

      if (participantsError) throw participantsError

      // Reload conversations
      await loadConversations()

      return conversationData
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }

  const checkRealtimeConnection = () => {
    const connected = supabase.realtime.isConnected()
    setSubscriptionStatus(connected ? 'SUBSCRIBED' : 'DISCONNECTED')
  }

  const sendTestMessage = async () => {
    if (!selectedUser || !testMessage.trim()) {
      setStatus("❌ Please select a user and enter a message")
      return
    }

    setLoading(true)
    setStatus("📤 Sending test message...")

    try {
      // Find existing conversation or create new one
      let conversationId = null
      const existingConv = conversations.find(conv => 
        conv.participants.some(p => p.id === selectedUser.id)
      )

      if (existingConv) {
        conversationId = existingConv.id
      } else {
        // Create new conversation
        const newConv = await createConversation([selectedUser.id])
        conversationId = newConv?.id
      }

      if (!conversationId) {
        throw new Error("Could not create or find conversation")
      }

      // Send message
      await sendMessage(conversationId, testMessage)
      
      setStatus(`✅ Test message sent to ${selectedUser.full_name}`)
      setTestMessage("Hello! This is a test message from chat testing system.")
      
      // Refresh test messages after a delay
      setTimeout(fetchTestMessages, 1000)
      
    } catch (error) {
      console.error('Error sending test message:', error)
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testBroadcast = async () => {
    if (!testMessage.trim()) {
      setStatus("❌ Please enter a message")
      return
    }

    setLoading(true)
    setStatus("📡 Broadcasting test message to multiple users...")

    const selectedUsers = testUsers.slice(0, 3) // Test with first 3 users
    let successCount = 0

    for (const testUser of selectedUsers) {
      try {
        // Find or create conversation
        let conversationId = null
        const existingConv = conversations.find(conv => 
          conv.participants.some(p => p.id === testUser.id)
        )

        if (existingConv) {
          conversationId = existingConv.id
        } else {
          const newConv = await createConversation([testUser.id])
          conversationId = newConv?.id
        }

        if (conversationId) {
          await sendMessage(conversationId, `[BROADCAST TEST] ${testMessage}`)
          successCount++
        }
        
        // Small delay between messages
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        console.error(`Error sending to ${testUser.full_name}:`, error)
      }
    }

    setStatus(`✅ Broadcast completed: ${successCount}/${selectedUsers.length} messages sent`)
    setTimeout(fetchTestMessages, 2000)
    setLoading(false)
  }

  const checkRealtimeStatus = () => {
    const statusCheck = {
      authenticated: !!user,
      userId: user?.id,
      conversationsLoaded: conversations.length,
      subscriptionStatus: subscriptionStatus,
      realtimeConnected: supabase.realtime.isConnected()
    }
    
    console.log('🔍 Realtime Status Check:', statusCheck)
    setStatus(`🔍 Status: Auth=${statusCheck.authenticated}, Conversations=${statusCheck.conversationsLoaded}, Realtime=${statusCheck.realtimeConnected}`)
    checkRealtimeConnection()
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">🧪 Chat Realtime Test Center</h1>
        <p className="text-gray-600">Test chat functionality with all users on the platform</p>
      </div>

      {/* Status Panel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 System Status
            <Button onClick={checkRealtimeStatus} variant="outline" size="sm">
              Check Status
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="font-semibold">User</div>
              <Badge variant={user ? "default" : "secondary"}>
                {user ? "✅ Authenticated" : "❌ Not Auth"}
              </Badge>
            </div>
            <div className="text-center">
              <div className="font-semibold">Conversations</div>
              <Badge variant="outline">{conversations.length}</Badge>
            </div>
            <div className="text-center">
              <div className="font-semibold">Subscription</div>
              <Badge variant={subscriptionStatus === 'SUBSCRIBED' ? "default" : "secondary"}>
                {subscriptionStatus || 'Unknown'}
              </Badge>
            </div>
            <div className="text-center">
              <div className="font-semibold">Test Users</div>
              <Badge variant="outline">{testUsers.length}</Badge>
            </div>
          </div>
          
          {status && (
            <div className="text-sm p-3 bg-gray-50 rounded-lg">
              {status}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Controls */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Single User Test */}
        <Card>
          <CardHeader>
            <CardTitle>👤 Single User Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Test User:</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={selectedUser?.id || ''}
                onChange={(e) => {
                  const user = testUsers.find(u => u.id === e.target.value)
                  setSelectedUser(user || null)
                }}
              >
                <option value="">Choose a user...</option>
                {testUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.role}) - {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Test Message:</label>
              <Input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter test message..."
              />
            </div>

            <Button 
              onClick={sendTestMessage} 
              disabled={loading || !selectedUser}
              className="w-full"
            >
              {loading ? "Sending..." : "Send Test Message"}
            </Button>
          </CardContent>
        </Card>

        {/* Broadcast Test */}
        <Card>
          <CardHeader>
            <CardTitle>📡 Broadcast Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Send test message to multiple users (first 3 users)
              </p>
              <div className="space-y-2">
                {testUsers.slice(0, 3).map(user => (
                  <div key={user.id} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {user.full_name} ({user.role})
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={testBroadcast} 
              disabled={loading || testUsers.length === 0}
              className="w-full"
              variant="outline"
            >
              {loading ? "Broadcasting..." : "Broadcast Test"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Test Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📨 Recent Test Messages
            <Button onClick={fetchTestMessages} variant="outline" size="sm">
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testMessages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No test messages found</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testMessages.map(message => (
                <div key={message.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{message.sender_name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Conversation: {message.conversation_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Users List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>👥 Available Test Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {testUsers.map(user => (
              <div key={user.id} className="border rounded-lg p-3">
                <div className="font-medium">{user.full_name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <Badge variant="outline" className="mt-1 text-xs">
                  {user.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
