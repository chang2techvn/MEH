import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

async function fixUserNames() {
  console.log('🔧 Fixing user names and avatars...\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // User data with proper names and avatars
  const userUpdates = [
    {
      email: 'john.smith@university.edu',
      name: 'John Smith',
      avatar: 'https://avatar.iran.liara.run/public/3'
    },
    {
      email: 'sarah.wilson@university.edu', 
      name: 'Sarah Wilson',
      avatar: 'https://avatar.iran.liara.run/public/4'
    },
    {
      email: 'maria.garcia@university.edu',
      name: 'Maria Garcia',
      avatar: 'https://avatar.iran.liara.run/public/5'
    },
    {
      email: 'michael.brown@university.edu',
      name: 'Michael Brown',
      avatar: 'https://avatar.iran.liara.run/public/6'
    },
    {
      email: 'admin@university.edu',
      name: 'Admin User',
      avatar: 'https://avatar.iran.liara.run/public/7'
    },
    {
      email: 'ahmed.hassan@university.edu',
      name: 'Ahmed Hassan',
      avatar: 'https://avatar.iran.liara.run/public/8'
    },
    {
      email: 'david.johnson@university.edu',
      name: 'David Johnson',
      avatar: 'https://avatar.iran.liara.run/public/9'
    },
    {
      email: 'yuki.tanaka@university.edu',
      name: 'Yuki Tanaka',
      avatar: 'https://avatar.iran.liara.run/public/10'
    }
  ];

  console.log(`📝 Updating ${userUpdates.length} users...\n`);

  for (const userData of userUpdates) {
    console.log(`Updating ${userData.email}...`);
    
    const { data, error } = await supabase
      .from('users')
      .update({
        name: userData.name,
        avatar: userData.avatar
      })
      .eq('email', userData.email)
      .select();

    if (error) {
      console.log(`❌ Error updating ${userData.email}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✅ Updated ${userData.email} -> ${userData.name}`);
    } else {
      console.log(`⚠️ No user found with email ${userData.email}`);
    }
  }

  console.log('\n✅ Completed updating user names and avatars!');
  console.log('\n🔄 Please refresh your UI to see the changes.');
}

fixUserNames();
