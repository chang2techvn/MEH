/**
 * Script to check notifications, messages, and conversations table structures
 * Run with: node scripts/check-database-structure.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure(tableName) {
  console.log(`\n📋 Checking ${tableName} table structure:`);
  
  try {
    // Query information schema to get column details
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `
    });

    if (error) {
      // Fallback: try to select from table to check existence
      const { data: testData, error: testError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (testError) {
        console.log(`❌ Table ${tableName} does not exist or is not accessible`);
        return false;
      } else {
        console.log(`✅ Table ${tableName} exists but structure query failed`);
        console.log('Sample row:', testData[0] || 'No data');
        return true;
      }
    }

    if (data && data.length > 0) {
      console.log(`✅ Table ${tableName} structure:`);
      console.table(data);
      return true;
    } else {
      console.log(`❌ Table ${tableName} has no columns or doesn't exist`);
      return false;
    }
  } catch (error) {
    console.error(`Error checking ${tableName}:`, error.message);
    return false;
  }
}

async function checkTableData(tableName, limit = 5) {
  console.log(`\n📊 Checking ${tableName} sample data:`);
  
  try {
    const { data, count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.log(`❌ Error fetching data from ${tableName}:`, error.message);
      return;
    }

    console.log(`Total rows: ${count}`);
    
    if (data && data.length > 0) {
      console.log(`Recent ${limit} records:`);
      console.table(data);
    } else {
      console.log('No data found');
    }
  } catch (error) {
    console.error(`Error checking ${tableName} data:`, error.message);
  }
}

async function checkIndexes(tableName) {
  console.log(`\n🔍 Checking ${tableName} indexes:`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename = '${tableName}' 
          AND schemaname = 'public'
        ORDER BY indexname;
      `
    });

    if (error) {
      console.log(`❌ Error fetching indexes for ${tableName}:`, error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log(`✅ Indexes for ${tableName}:`);
      data.forEach(index => {
        console.log(`  - ${index.indexname}: ${index.indexdef}`);
      });
    } else {
      console.log(`No custom indexes found for ${tableName}`);
    }
  } catch (error) {
    console.error(`Error checking ${tableName} indexes:`, error.message);
  }
}

async function main() {
  console.log('🔍 Database Structure Check\n');
  
  const tables = [
    'notifications',
    'messages', 
    'conversations',
    'conversation_participants',
    'conversation_messages',
    'story_views'
  ];

  for (const table of tables) {
    await checkTableStructure(table);
    await checkTableData(table, 3);
    await checkIndexes(table);
    console.log('\n' + '='.repeat(80));
  }

  // Check specific for story reply integration
  console.log('\n🔗 Story Reply Integration Check:');
  
  // Check notification types
  try {
    const { data: notificationTypes, error } = await supabase
      .from('notifications')
      .select('notification_type')
      .not('notification_type', 'is', null);

    if (!error) {
      const uniqueTypes = [...new Set(notificationTypes.map(n => n.notification_type))];
      console.log('Existing notification types:', uniqueTypes);
      
      if (!uniqueTypes.includes('story_reply')) {
        console.log('⚠️  story_reply type not found in notifications');
      }
    }
  } catch (error) {
    console.error('Error checking notification types:', error.message);
  }

  console.log('\n✅ Database structure check completed!');
}

main().catch(console.error);
