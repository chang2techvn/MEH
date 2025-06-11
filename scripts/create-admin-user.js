#!/usr/bin/env node

/**
 * Create Admin User Script
 * Creates a real Supabase Auth user with admin privileges
 * 
 * Usage: node scripts/create-admin-user.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🔧 Creating admin user...');
  
  const adminEmail = 'admin@university.edu';
  const adminPassword = 'admin123'; // Strong default password
  
  try {
    // 1. Create Supabase Auth user
    console.log('📝 Creating Supabase Auth user...');
    let authUser;
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        full_name: 'Admin User',
        role: 'admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        console.log('⚠️  User already exists in Supabase Auth');
        
        // Get existing user
        const { data: existingUsersData } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsersData.users.find(u => u.email === adminEmail);
        
        if (existingUser) {
          console.log('🔄 Updating existing user password...');
          const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
            password: adminPassword
          });
          
          if (updateError) {
            console.error('Error updating password:', updateError);
          } else {
            console.log('✅ Password updated successfully');
          }
          
          // Use existing user data
          authUser = existingUser;
        }
      } else {
        throw authError;
      }
    } else {
      authUser = authData.user;
    }

    console.log('✅ Supabase Auth user created/updated');    // 2. Create or update user record in database
    console.log('📝 Creating/updating database user record...');
    
    // First check if user exists in database
    const { data: existingDbUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .single();

    let dbData, dbError;
    
    if (existingDbUser) {
      // Update existing user
      console.log('🔄 Updating existing database record...');
      const result = await supabase
        .from('users')
        .update({
          role: 'admin',
          is_active: true,
          last_login: new Date().toISOString()
        })
        .eq('email', adminEmail)
        .select()
        .single();
      
      dbData = result.data;
      dbError = result.error;
    } else {
      // Create new user
      console.log('➕ Creating new database record...');
      const result = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: adminEmail,
          role: 'admin',
          is_active: true,
          last_login: new Date().toISOString()
        })
        .select()
        .single();
      
      dbData = result.data;
      dbError = result.error;
    }

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('✅ Database user record created/updated');

    // 3. Display login credentials
    console.log('\n🎉 Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('\n🚀 You can now login at: http://localhost:3000/auth/login');
    console.log('🔗 Admin dashboard: http://localhost:3000/admin');
    
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    await createAdminUser();
    console.log('\n✨ Admin user setup completed!');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
