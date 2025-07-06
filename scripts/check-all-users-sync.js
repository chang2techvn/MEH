const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllUsers() {
  console.log('=== Checking ALL users sync status ===');
  
  try {
    // Get all auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }
    
    // Get all public.users
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('*');
    if (publicError) {
      console.error('Error fetching public users:', publicError);
      return;
    }
    
    console.log('\n--- Auth Users ---');
    authUsers.users.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}`);
    });
    
    console.log('\n--- Public Users ---');
    publicUsers.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}`);
    });
    
    console.log('\n--- ID Mismatches ---');
    let mismatches = [];
    authUsers.users.forEach(authUser => {
      const publicUser = publicUsers.find(pu => pu.email === authUser.email);
      if (publicUser && publicUser.id !== authUser.id) {
        console.log(`MISMATCH: ${authUser.email}`);
        console.log(`  Auth ID: ${authUser.id}`);
        console.log(`  Public ID: ${publicUser.id}`);
        mismatches.push({
          email: authUser.email,
          authId: authUser.id,
          publicId: publicUser.id
        });
      }
    });
    
    console.log('\n--- Missing Users ---');
    let missing = [];
    authUsers.users.forEach(authUser => {
      const publicUser = publicUsers.find(pu => pu.email === authUser.email);
      if (!publicUser) {
        console.log(`MISSING in public.users: ${authUser.email} (${authUser.id})`);
        missing.push({
          email: authUser.email,
          authId: authUser.id,
          type: 'missing_public'
        });
      }
    });
    
    publicUsers.forEach(publicUser => {
      const authUser = authUsers.users.find(au => au.email === publicUser.email);
      if (!authUser) {
        console.log(`MISSING in auth.users: ${publicUser.email} (${publicUser.id})`);
        missing.push({
          email: publicUser.email,
          publicId: publicUser.id,
          type: 'missing_auth'
        });
      }
    });
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total auth users: ${authUsers.users.length}`);
    console.log(`Total public users: ${publicUsers.length}`);
    console.log(`ID mismatches: ${mismatches.length}`);
    console.log(`Missing users: ${missing.length}`);
    
    if (mismatches.length > 0) {
      console.log('\nUsers that need ID sync:');
      mismatches.forEach(m => console.log(`- ${m.email}`));
    }
    
    if (missing.length > 0) {
      console.log('\nUsers that need to be created:');
      missing.forEach(m => console.log(`- ${m.email} (${m.type})`));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAllUsers();
