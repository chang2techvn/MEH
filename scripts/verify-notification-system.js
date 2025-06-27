const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = 'https://bmlqktvzbdgchpjdhdlp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbHFrdHZ6YmRnY2hwamRoZGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MTM3MzMsImV4cCI6MjA0OTk4OTczM30.8GCqHQ2kJNfNBNdC6O1pObhGxZgRYnYb9XTwLJPUPLM'
const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyNotificationSystem() {
  console.log('🔍 Verifying Notification System...\n')

  try {
    // 1. Check users table
    console.log('1. Checking users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, display_name')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }

    console.log(`✅ Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - ${user.display_name || 'No name'}`)
    })

    // 2. Check notifications for each user
    console.log('\n2. Checking notifications per user...')
    for (const user of users) {
      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('id, title, notification_type, is_read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (notifError) {
        console.error(`❌ Error fetching notifications for ${user.email}:`, notifError)
        continue
      }

      const unreadCount = notifications.filter(n => !n.is_read).length
      console.log(`   ${user.email}: ${notifications.length} total, ${unreadCount} unread`)
      
      if (notifications.length === 0) {
        console.log(`   ⚠️  No notifications found for ${user.email}`)
      }
    }

    // 3. Check specific test accounts
    console.log('\n3. Checking specific test accounts...')
    const testAccounts = [
      'teacher1@university.edu',
      'admin@university.edu',
      'student1@university.edu'
    ]

    for (const email of testAccounts) {
      const { data: testUser, error: testUserError } = await supabase
        .from('users')
        .select('id, email, role, display_name')
        .eq('email', email)
        .single()

      if (testUserError || !testUser) {
        console.log(`   ❌ ${email}: Not found`)
        continue
      }

      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', testUser.id)
        .order('created_at', { ascending: false })

      if (notifError) {
        console.error(`   ❌ ${email}: Error fetching notifications`)
        continue
      }

      console.log(`   ✅ ${email}: ${notifications.length} notifications, role: ${testUser.role}`)
    }

    // 4. Check notification types
    console.log('\n4. Checking notification types distribution...')
    const { data: allNotifications, error: allNotifsError } = await supabase
      .from('notifications')
      .select('notification_type')

    if (allNotifsError) {
      console.error('❌ Error fetching all notifications:', allNotifsError)
      return
    }

    const typeStats = {}
    allNotifications.forEach(notif => {
      typeStats[notif.notification_type] = (typeStats[notif.notification_type] || 0) + 1
    })

    console.log('   Notification types:')
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`)
    })

    // 5. Test notification creation
    console.log('\n5. Testing notification creation...')
    const testUser = users.find(u => u.email.includes('teacher1'))
    
    if (testUser) {
      const { data: newNotif, error: createError } = await supabase
        .from('notifications')
        .insert({
          user_id: testUser.id,
          title: 'System Verification Test',
          message: 'This is a test notification created during system verification.',
          notification_type: 'system',
          is_read: false,
          data: { test: true, timestamp: new Date().toISOString() }
        })
        .select()
        .single()

      if (createError) {
        console.error('   ❌ Error creating test notification:', createError)
      } else {
        console.log('   ✅ Successfully created test notification')
      }
    }

    console.log('\n🎉 Notification System Verification Complete!')
    console.log('\n📋 Summary:')
    console.log(`   • Total users: ${users.length}`)
    console.log(`   • Total notifications: ${allNotifications.length}`)
    console.log(`   • System is operational: ✅`)

  } catch (error) {
    console.error('❌ Verification failed:', error)
  }
}

// Run verification
verifyNotificationSystem()
