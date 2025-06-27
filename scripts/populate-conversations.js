#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function populateConversations() {
  console.log('🗣️ Populating conversations and messages...\n')

  try {
    // First, get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at')

    if (usersError || !users) {
      console.error('❌ Error fetching users:', usersError)
      return
    }

    console.log(`👥 Found ${users.length} users`)

    // Find teacher and students
    const teacher = users.find(u => u.email === 'teacher1@university.edu')
    const admin = users.find(u => u.role === 'admin')
    const students = users.filter(u => u.role === 'student')

    if (!teacher) {
      console.error('❌ Teacher account not found')
      return
    }

    console.log(`👨‍🏫 Teacher: ${teacher.email}`)
    console.log(`👨‍💼 Admin: ${admin?.email || 'None'}`)
    console.log(`👥 Students: ${students.length}`)

    // Create conversations
    const conversations = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'English Grammar Help',
        status: 'active'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002', 
        title: 'Pronunciation Practice',
        status: 'active'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        title: 'Writing Workshop',
        status: 'active'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        title: 'Vocabulary Building',
        status: 'active'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        title: 'Speaking Practice',
        status: 'active'
      }
    ]

    // Insert conversations
    const { error: convError } = await supabase
      .from('conversations')
      .upsert(conversations)

    if (convError) {
      console.error('❌ Error creating conversations:', convError)
      return
    }

    console.log(`✅ Created ${conversations.length} conversations`)

    // Create conversation participants
    const participants = []

    // Teacher participates in all conversations
    conversations.forEach(conv => {
      participants.push({
        conversation_id: conv.id,
        user_id: teacher.id,
        role: 'teacher'
      })
    })

    // Add admin to some conversations
    if (admin) {
      conversations.slice(0, 2).forEach(conv => {
        participants.push({
          conversation_id: conv.id,
          user_id: admin.id,
          role: 'moderator'
        })
      })
    }

    // Add students to conversations
    students.forEach((student, index) => {
      // Each student joins 2-3 conversations
      const studentConversations = conversations.slice(index % 3, (index % 3) + 2)
      studentConversations.forEach(conv => {
        participants.push({
          conversation_id: conv.id,
          user_id: student.id,
          role: 'student'
        })
      })
    })

    // Insert participants
    const { error: partError } = await supabase
      .from('conversation_participants')
      .upsert(participants)

    if (partError) {
      console.error('❌ Error creating participants:', partError)
      return
    }

    console.log(`✅ Created ${participants.length} conversation participants`)

    // Create sample messages
    const messages = []

    // Messages for conversation 1 (Grammar Help)
    messages.push(
      {
        conversation_id: '550e8400-e29b-41d4-a716-446655440001',
        sender_id: teacher.id,
        content: 'Welcome to our grammar help session! Feel free to ask any questions about English grammar.',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        conversation_id: '550e8400-e29b-41d4-a716-446655440001',
        sender_id: students[0]?.id,
        content: 'Hi! Can you help me understand when to use "a" vs "an"?',
        created_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
      },
      {
        conversation_id: '550e8400-e29b-41d4-a716-446655440001',
        sender_id: teacher.id,
        content: 'Great question! Use "a" before consonant sounds and "an" before vowel sounds. For example: "a book" but "an apple".',
        created_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString()
      }
    )

    // Messages for conversation 2 (Pronunciation)
    if (students[1]) {
      messages.push(
        {
          conversation_id: '550e8400-e29b-41d4-a716-446655440002',
          sender_id: teacher.id,
          content: 'Today we\'ll practice pronunciation. Please share any words you find difficult to pronounce.',
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        },
        {
          conversation_id: '550e8400-e29b-41d4-a716-446655440002',
          sender_id: students[1].id,
          content: 'I have trouble with "thorough" and "through". They sound so similar!',
          created_at: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString()
        },
        {
          conversation_id: '550e8400-e29b-41d4-a716-446655440002',
          sender_id: teacher.id,
          content: 'Those are tricky! "Thorough" has the "th" sound, while "through" is more like "thru". Practice saying them slowly.',
          created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
        }
      )
    }

    // Messages for conversation 3 (Writing Workshop)
    if (students[2]) {
      messages.push(
        {
          conversation_id: '550e8400-e29b-41d4-a716-446655440003',
          sender_id: teacher.id,
          content: 'Welcome to our writing workshop! Today we\'ll focus on essay structure and paragraph development.',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          conversation_id: '550e8400-e29b-41d4-a716-446655440003',
          sender_id: students[2].id,
          content: 'How do I write a good introduction paragraph?',
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        }
      )
    }

    // Recent messages for active conversations
    if (students[0]) {
      messages.push(
        {
          conversation_id: '550e8400-e29b-41d4-a716-446655440004',
          sender_id: students[0].id,
          content: 'What are some effective ways to memorize new vocabulary?',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          conversation_id: '550e8400-e29b-41d4-a716-446655440004',
          sender_id: teacher.id,
          content: 'Try using flashcards, reading in context, and practicing with example sentences. Spaced repetition works well too!',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          conversation_id: '550e8400-e29b-41d4-a716-446655440004',
          sender_id: students[0].id,
          content: 'Thank you! I\'ll try those methods.',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      )
    }

    // Filter out messages with undefined sender_id
    const validMessages = messages.filter(msg => msg.sender_id)

    // Insert messages
    const { error: msgError } = await supabase
      .from('conversation_messages')
      .insert(validMessages)

    if (msgError) {
      console.error('❌ Error creating messages:', msgError)
      return
    }

    console.log(`✅ Created ${validMessages.length} conversation messages`)

    // Update conversation last_message_at
    for (const conv of conversations) {
      const convMessages = validMessages.filter(m => m.conversation_id === conv.id)
      if (convMessages.length > 0) {
        const lastMessage = convMessages[convMessages.length - 1]
        await supabase
          .from('conversations')
          .update({ last_message_at: lastMessage.created_at })
          .eq('id', conv.id)
      }
    }

    console.log('\n🎉 Successfully populated conversations system!')
    console.log(`✅ ${conversations.length} conversations`)
    console.log(`✅ ${participants.length} participants`)
    console.log(`✅ ${validMessages.length} messages`)
    console.log(`✅ Teacher has conversations with ${students.length} students`)

  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

populateConversations()
