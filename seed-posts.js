const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://localhost:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function seedData() {
  console.log('🌱 Starting data seeding...')

  // 1. Create sample users first
  console.log('👤 Creating sample users...')
  const users = [
    {
      id: 'user-001',
      name: 'Emma Watson',
      email: 'emma@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
      bio: 'English learning enthusiast from London. Love helping others improve their communication skills.',
      level: 'advanced',
      points: 2450,
      streak: 15,
      created_at: '2025-06-01T10:00:00Z'
    },
    {
      id: 'user-002', 
      name: 'John Smith',
      email: 'john@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Business professional learning English for international meetings.',
      level: 'intermediate',
      points: 1320,
      streak: 8,
      created_at: '2025-06-02T14:30:00Z'
    },
    {
      id: 'user-003',
      name: 'Maria Garcia',
      email: 'maria@example.com', 
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      bio: 'Spanish teacher learning English to help my students better.',
      level: 'intermediate',
      points: 890,
      streak: 12,
      created_at: '2025-06-03T09:15:00Z'
    },
    {
      id: 'user-004',
      name: 'David Kim',
      email: 'david@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Tech enthusiast from Seoul. Studying English for software development.',
      level: 'beginner',
      points: 450,
      streak: 3,
      created_at: '2025-06-04T16:45:00Z'
    },
    {
      id: 'user-005',
      name: 'Sophie Chen',
      email: 'sophie@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      bio: 'University student preparing for IELTS exam.',
      level: 'advanced',
      points: 3120,
      streak: 22,
      created_at: '2025-06-05T11:20:00Z'
    }
  ]

  try {
    const { error: usersError } = await supabase
      .from('users')
      .upsert(users, { onConflict: 'id' })
    
    if (usersError) {
      console.error('❌ Error inserting users:', usersError)
      return
    }
    console.log(`✅ Created ${users.length} users`)
  } catch (error) {
    console.error('❌ Users creation failed:', error)
    return
  }

  // 2. Create sample posts
  console.log('📝 Creating sample posts...')
  const posts = [
    {
      id: 'post-001',
      user_id: 'user-001',
      title: 'My Journey Learning English: From Beginner to Advanced',
      content: `Hi everyone! 👋 I wanted to share my English learning journey with you all. 

When I started 3 years ago, I could barely form a complete sentence. Today, I'm confident speaking in business meetings and even presenting to international clients!

**Here's what helped me the most:**
- Daily practice with YouTube videos (like the ones on this platform!)
- Joining English conversation groups
- Reading English news articles every morning
- Watching movies with English subtitles

The key is consistency. Even 15 minutes a day makes a huge difference! 

What strategies have worked best for you? I'd love to hear your tips! 💪

#EnglishLearning #MotivationMonday #LanguageJourney`,
      post_type: 'text',
      tags: ['motivation', 'learning-tips', 'journey'],
      likes_count: 24,
      comments_count: 8,
      shares_count: 3,
      is_featured: true,
      created_at: '2025-06-11T08:30:00Z'
    },
    {
      id: 'post-002',
      user_id: 'user-002',
      title: 'Business English Phrases That Changed My Career',
      content: `As someone working in international business, I've learned that certain phrases can make you sound more professional and confident.

**Here are my top 10 business English phrases:**

1. "I'd like to circle back on this topic..."
2. "Let's table this discussion for now..."
3. "Could you elaborate on that point?"
4. "I appreciate your perspective on this matter."
5. "Let's schedule a follow-up meeting to discuss next steps."

These phrases have helped me navigate meetings with clients from different countries. Practice them and you'll sound more professional instantly!

What business phrases do you find most useful? Share below! 👔

#BusinessEnglish #Professional #Career #Networking`,
      post_type: 'text',
      tags: ['business-english', 'phrases', 'career'],
      likes_count: 31,
      comments_count: 12,
      shares_count: 7,
      is_featured: false,
      created_at: '2025-06-11T14:15:00Z'
    },
    {
      id: 'post-003',
      user_id: 'user-003',
      title: 'Common English Pronunciation Mistakes (And How to Fix Them)',
      content: `As a Spanish speaker learning English, I've made every pronunciation mistake in the book! 😅

**Here are the most common ones I see:**

**1. TH sounds** - "Think" vs "Sink"
- Put your tongue between your teeth and blow air gently

**2. V vs B sounds** - "Very" vs "Berry"  
- For V: bite your bottom lip lightly with upper teeth

**3. R sounds** - "Red" vs "Led"
- Curl your tongue back slightly (don't roll it like in Spanish!)

**4. ED endings** - "Worked" should sound like "workt", not "work-ed"

**Practice tip:** Record yourself saying these words and compare with native speakers on YouTube!

What pronunciation challenges do you face? Let's help each other! 🎯

#Pronunciation #Speaking #Tips #SpanishSpeakers`,
      post_type: 'text',
      tags: ['pronunciation', 'speaking', 'tips'],
      likes_count: 45,
      comments_count: 18,
      shares_count: 12,
      is_featured: true,
      created_at: '2025-06-11T10:45:00Z'
    },
    {
      id: 'post-004',
      user_id: 'user-004',
      title: 'Tech Vocabulary for Software Developers',
      content: `Learning English as a developer? Here's essential tech vocabulary that will help you in international teams:

**Development Terms:**
- Debug (not "remove bugs" 🐛)
- Deploy/Deployment
- Refactor
- Code review
- Pull request
- Merge conflict

**Meeting Phrases:**
- "Let's pair program on this"
- "I'll push the changes to the repo"
- "Can you review my PR?"
- "We need to fix this critical bug"

**Bonus tip:** Follow English tech YouTubers and read documentation in English. It's the best way to learn naturally!

Currently learning from @freeCodeCamp and @TraversyMedia. Any other recommendations?

#TechEnglish #Programming #SoftwareDeveloper #Coding`,
      post_type: 'text',
      tags: ['tech-english', 'programming', 'vocabulary'],
      likes_count: 28,
      comments_count: 6,
      shares_count: 5,
      is_featured: false,
      created_at: '2025-06-11T16:20:00Z'
    },
    {
      id: 'post-005',
      user_id: 'user-005',
      title: 'IELTS Speaking Test: My 8.5 Score Strategy',
      content: `Just got my IELTS results - 8.5 in Speaking! 🎉

Here's exactly what I did to prepare:

**Part 1 (Personal Questions):**
- Practice describing daily routines naturally
- Don't memorize answers - sound conversational
- Use present tense confidently

**Part 2 (Long Turn):**
- Always use the full 2 minutes
- Structure: Introduction → Main points → Conclusion
- Practice with a timer daily

**Part 3 (Discussion):**
- Give detailed answers with examples
- Use phrases like "In my opinion..." and "On the other hand..."
- Don't be afraid to ask for clarification

**Study materials I used:**
- IELTS Liz (YouTube)
- Cambridge IELTS books 15-17
- Daily speaking practice with language exchange partners

The secret? Practice speaking English for at least 30 minutes every day, even if it's just talking to yourself!

Questions about IELTS prep? Ask away! 📚

#IELTS #SpeakingTest #TestPrep #StudyTips #Success`,
      post_type: 'text',
      tags: ['ielts', 'test-prep', 'speaking', 'success-story'],
      likes_count: 67,
      comments_count: 23,
      shares_count: 15,
      is_featured: true,
      created_at: '2025-06-11T12:00:00Z'
    },
    {
      id: 'post-006',
      user_id: 'user-001',
      title: 'Weekly Challenge: Describe Your Morning Routine',
      content: `Let's practice descriptive English together! 🌅

**This week's challenge:** Write about your morning routine in English. Try to include:

- Time expressions (first, then, after that, finally)
- Present simple tense
- Descriptive adjectives
- At least 5 sentences

**My example:**
"First, I wake up at 6:30 AM and drink a large glass of cold water. Then, I do 10 minutes of gentle stretching exercises. After that, I prepare a healthy breakfast with fresh fruit and oatmeal. Finally, I review my English vocabulary flashcards while eating."

**Bonus points for:**
- Using linking words (because, although, however)
- Adding emotions (I feel energized when...)
- Including specific details

Share your morning routine in the comments! I'll give feedback to everyone who participates. Let's learn together! 💪

#WeeklyChallenge #Writing #Practice #MorningRoutine #Community`,
      post_type: 'challenge',
      tags: ['challenge', 'writing', 'routine', 'practice'],
      likes_count: 19,
      comments_count: 14,
      shares_count: 2,
      is_featured: false,
      created_at: '2025-06-10T18:30:00Z'
    },
    {
      id: 'post-007',
      user_id: 'user-002',
      title: 'Networking Event Success Story',
      content: `Update: Just attended my first international networking event in English! 🎉

**What I learned:**
- Small talk is actually important (I used to think it was pointless)
- "How's business?" is better than "How are you?" in professional settings
- Always have your elevator pitch ready in 30 seconds

**Phrases that worked well:**
- "What brings you to this event?"
- "That's an interesting perspective..."
- "I'd love to stay in touch"
- "Could I get your business card?"

**Mistake I made:** Talking too fast when nervous! Slow down and breathe.

Got 3 new business contacts and potential collaboration opportunities. English really opens doors! 🚪

For those preparing for networking events, practice common scenarios with a friend first. It makes a huge difference!

#Networking #Business #English #Success #Professional`,
      post_type: 'text',
      tags: ['networking', 'business', 'success-story'],
      likes_count: 22,
      comments_count: 7,
      shares_count: 4,
      is_featured: false,
      created_at: '2025-06-10T20:15:00Z'
    },
    {
      id: 'post-008',
      user_id: 'user-003',
      title: 'Teaching English vs Learning English: Different Perspectives',
      content: `Interesting observation as both an English learner and Spanish teacher...

**When I teach Spanish to English speakers, I notice:**
- They struggle with gendered nouns (la mesa, el libro)
- Verb conjugations are overwhelming at first
- They want to translate everything literally

**When I learn English, I struggle with:**
- Articles (a, an, the) - Spanish doesn't emphasize these!
- Phrasal verbs (give up, turn on, look after) - so confusing!
- When to use present perfect vs simple past

**Teaching has made me a better learner because:**
1. I understand the frustration students feel
2. I know patience is key to progress
3. Mistakes are part of the learning process

**For fellow language teachers:** Try learning a new language yourself. It makes you more empathetic and effective!

What insights have you gained from your learning journey?

#Teaching #Learning #Languages #SpanishTeacher #Perspective #Education`,
      post_type: 'text',
      tags: ['teaching', 'learning', 'perspective', 'education'],
      likes_count: 33,
      comments_count: 11,
      shares_count: 6,
      is_featured: false,
      created_at: '2025-06-10T15:45:00Z'
    }
  ]

  try {
    const { error: postsError } = await supabase
      .from('posts')
      .upsert(posts, { onConflict: 'id' })
    
    if (postsError) {
      console.error('❌ Error inserting posts:', postsError)
      return
    }
    console.log(`✅ Created ${posts.length} posts`)
  } catch (error) {
    console.error('❌ Posts creation failed:', error)
    return
  }

  // 3. Create sample comments
  console.log('💬 Creating sample comments...')
  const comments = [
    {
      id: 'comment-001',
      post_id: 'post-001',
      user_id: 'user-002',
      content: 'This is so inspiring! I especially love your tip about watching movies with subtitles. I\'ve been doing this for 2 months and my listening skills have improved dramatically. Keep sharing your journey! 👏',
      likes_count: 5,
      created_at: '2025-06-11T09:15:00Z'
    },
    {
      id: 'comment-002',
      post_id: 'post-001',
      user_id: 'user-003',
      content: 'Thank you for sharing this! As a teacher, I always tell my students that consistency is key, and your story is perfect proof. 15 minutes a day really does add up! 📚',
      likes_count: 3,
      created_at: '2025-06-11T09:45:00Z'
    },
    {
      id: 'comment-003',
      post_id: 'post-002',
      user_id: 'user-004',
      content: 'These phrases are gold! I used "Let\'s circle back on this" in a meeting yesterday and felt so professional. Do you have any tips for remembering them during high-pressure situations?',
      likes_count: 7,
      created_at: '2025-06-11T15:30:00Z'
    },
    {
      id: 'comment-004',
      post_id: 'post-003',
      user_id: 'user-005',
      content: 'OMG the TH sound tip is amazing! I\'ve been struggling with this for years. The tongue placement explanation finally makes sense. Recording myself was eye-opening - I didn\'t realize how different I sounded! 🎯',
      likes_count: 8,
      created_at: '2025-06-11T11:20:00Z'
    },
    {
      id: 'comment-005',
      post_id: 'post-005',
      user_id: 'user-001',
      content: 'Congratulations on your amazing score! 🎉 Your Part 2 strategy is exactly what I needed. I\'ve been running out of things to say after 1 minute. The structure tip is super helpful!',
      likes_count: 4,
      created_at: '2025-06-11T13:15:00Z'
    },
    {
      id: 'comment-006',
      post_id: 'post-006',
      user_id: 'user-004',
      content: 'Great challenge! Here\'s mine: First, I wake up at 7 AM and immediately check my phone (bad habit!). Then, I brush my teeth and take a quick shower. After that, I make coffee and read English tech blogs for 15 minutes. Finally, I review yesterday\'s code before starting work. How did I do? 😊',
      likes_count: 2,
      created_at: '2025-06-10T19:45:00Z'
    },
    {
      id: 'comment-007',
      post_id: 'post-006',
      user_id: 'user-002',
      content: '@user-004 Excellent work! Your routine description is very clear and well-structured. One suggestion: instead of "bad habit!" try "which I know I should change" - sounds more natural in English! Keep practicing! 👍',
      likes_count: 6,
      created_at: '2025-06-10T20:30:00Z'
    },
    {
      id: 'comment-008',
      post_id: 'post-003',
      user_id: 'user-002',
      content: 'As someone who also struggled with pronunciation, I can relate to every point you made! The V vs B distinction was my biggest challenge. One thing that helped me was practicing in front of a mirror to see my mouth movements.',
      likes_count: 3,
      created_at: '2025-06-11T12:30:00Z'
    }
  ]

  try {
    const { error: commentsError } = await supabase
      .from('comments')
      .upsert(comments, { onConflict: 'id' })
    
    if (commentsError) {
      console.error('❌ Error inserting comments:', commentsError)
      return
    }
    console.log(`✅ Created ${comments.length} comments`)
  } catch (error) {
    console.error('❌ Comments creation failed:', error)
    return
  }

  console.log('🎉 Data seeding completed successfully!')
  console.log(`📊 Summary:
  - ${users.length} users created
  - ${posts.length} posts created  
  - ${comments.length} comments created`)
}

seedData().then(() => {
  console.log('✅ Seeding process finished')
  process.exit(0)
}).catch(error => {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
})
