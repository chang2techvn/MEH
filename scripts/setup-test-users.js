const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Setting up test users for Supabase local');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-8) : 'Missing');
console.log('Service Key:', supabaseServiceKey ? '***' + supabaseServiceKey.slice(-8) : 'Missing');

// Client with anon key for regular auth operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role key for user management
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const testUsers = [
  {
    email: 'teacher1@university.edu',
    password: 'teacher123456',
    full_name: 'Prof. Sarah Wilson',
    role: 'teacher',
    department: 'Computer Science'
  },
  {
    email: 'student1@university.edu', 
    password: 'student123456',
    full_name: 'John Smith',
    role: 'student',
    level: 'intermediate'
  },
  {
    email: 'student2@university.edu',
    password: 'student123456', 
    full_name: 'Emma Johnson',
    role: 'student',
    level: 'beginner'
  },
  {
    email: 'admin@university.edu',
    password: 'admin123456',
    full_name: 'System Admin',
    role: 'admin'
  }
];

async function setupTestUsers() {
  console.log('\n🗑️  Step 1: Cleaning up existing auth users...');
  
  // First, let's try to get all existing users and delete them
  try {
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
    } else {
      console.log(`📊 Found ${existingUsers.users.length} existing auth users`);
      
      // Delete existing auth users
      for (const user of existingUsers.users) {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (deleteError) {
          console.error(`❌ Error deleting user ${user.email}:`, deleteError.message);
        } else {
          console.log(`✅ Deleted auth user: ${user.email}`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Error in cleanup:', err.message);
  }

  console.log('\n👥 Step 2: Creating new test users...');
  
  for (const testUser of testUsers) {
    try {
      console.log(`\n🔄 Creating user: ${testUser.email}`);
      
      // Create user with admin client
      const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true, // Auto-confirm email for local testing
        user_metadata: {
          full_name: testUser.full_name,
          role: testUser.role
        }
      });

      if (createError) {
        console.error(`❌ Error creating user ${testUser.email}:`, createError.message);
        continue;
      }

      console.log(`✅ Created auth user: ${testUser.email} (ID: ${authUser.user.id})`);

      // Now create/update the user profile in the users table
      const { error: profileError } = await supabaseAdmin
        .from('users')
        .upsert({
          auth_id: authUser.user.id,
          email: testUser.email,
          full_name: testUser.full_name,
          role: testUser.role,
          department: testUser.department,
          level: testUser.level,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'auth_id'
        });

      if (profileError) {
        console.error(`❌ Error creating profile for ${testUser.email}:`, profileError.message);
      } else {
        console.log(`✅ Created/updated profile for: ${testUser.email}`);
      }

    } catch (err) {
      console.error(`💥 Unexpected error creating ${testUser.email}:`, err.message);
    }
  }

  console.log('\n🧪 Step 3: Testing authentication...');
  
  // Test signing in with the first user
  const testUser = testUsers[0];
  try {
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    if (signInError) {
      console.error(`❌ Sign in test failed for ${testUser.email}:`, signInError.message);
    } else {
      console.log(`✅ Sign in test successful for ${testUser.email}`);
      console.log(`User ID: ${authData.user.id}`);
      
      // Test getting user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Error fetching user profile:', profileError.message);
      } else {
        console.log('✅ User profile found:', profile.full_name);
      }

      // Sign out
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.error('💥 Sign in test error:', err.message);
  }

  console.log('\n📋 Test user credentials:');
  testUsers.forEach(user => {
    console.log(`${user.role}: ${user.email} / ${user.password}`);
  });
}

// Run the setup
setupTestUsers().then(() => {
  console.log('\n🎉 Test user setup completed!');
  process.exit(0);
}).catch((err) => {
  console.error('💥 Setup failed:', err);
  process.exit(1);
});
