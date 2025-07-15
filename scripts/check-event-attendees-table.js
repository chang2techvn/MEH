/**
 * Script to check event_attendees table structure and data
 * Run with: node scripts/check-event-attendees-table.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEventAttendeesTable() {
  console.log('🔍 Checking Event Attendees Table Structure and Data\n');
  
  try {
    // 1. Check if table exists and get structure
    console.log('📋 Table Structure:');
    const { data: columns, error: structureError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'event_attendees')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (structureError) {
      console.error('Error fetching table structure:', structureError);
    } else if (columns && columns.length > 0) {
      console.table(columns);
    } else {
      console.log('❌ Table "event_attendees" does not exist');
    }

    // 2. Check total count
    console.log('\n📊 Table Statistics:');
    const { count, error: countError } = await supabase
      .from('event_attendees')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting count:', countError);
    } else {
      console.log(`Total attendees: ${count}`);
    }

    // 3. Get sample data
    console.log('\n📄 Sample Attendees (Last 10):');
    const { data: attendees, error: dataError } = await supabase
      .from('event_attendees')
      .select(`
        id,
        event_id,
        user_id,
        status,
        attended,
        joined_at,
        events!inner(title),
        users!inner(email)
      `)
      .order('joined_at', { ascending: false })
      .limit(10);

    if (dataError) {
      console.error('Error fetching attendees:', dataError);
    } else {
      console.table(attendees);
    }

    // 4. Check attendee statistics by event
    console.log('\n📈 Attendees by Event:');
    const { data: eventStats, error: statsError } = await supabase
      .from('event_attendees')
      .select(`
        event_id,
        status,
        events!inner(title, start_date)
      `)
      .order('event_id');

    if (statsError) {
      console.error('Error fetching event stats:', statsError);
    } else {
      // Group by event and count
      const eventCounts = {};
      eventStats?.forEach(attendee => {
        const eventTitle = attendee.events.title;
        if (!eventCounts[eventTitle]) {
          eventCounts[eventTitle] = {
            title: eventTitle,
            start_date: attendee.events.start_date,
            total: 0,
            attending: 0,
            interested: 0,
            not_attending: 0
          };
        }
        eventCounts[eventTitle].total++;
        eventCounts[eventTitle][attendee.status]++;
      });
      
      console.table(Object.values(eventCounts));
    }

    // 5. Check RLS policies
    console.log('\n🔒 RLS Policies:');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, permissive, roles, cmd, qual')
      .eq('tablename', 'event_attendees')
      .eq('schemaname', 'public');

    if (policiesError) {
      console.error('Error fetching policies:', policiesError);
    } else {
      console.table(policies);
    }

    // 6. Check foreign key constraints
    console.log('\n🔗 Foreign Key Constraints:');
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.key_column_usage')
      .select('column_name, referenced_table_name, referenced_column_name')
      .eq('table_name', 'event_attendees')
      .eq('table_schema', 'public');

    if (constraintsError) {
      console.error('Error fetching constraints:', constraintsError);
    } else {
      console.table(constraints);
    }

    // 7. Test join functionality
    console.log('\n🧪 Testing Join/Leave Functionality:');
    
    // Get first event and first user for testing
    const { data: testEvent, error: eventError } = await supabase
      .from('events')
      .select('id, title')
      .limit(1)
      .single();

    const { data: testUser, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)
      .single();

    if (eventError || userError) {
      console.log('No test data available for join/leave testing');
    } else {
      console.log(`Test Event: ${testEvent.title} (${testEvent.id})`);
      console.log(`Test User: ${testUser.email} (${testUser.id})`);
      
      // Try to join event
      const { data: joinResult, error: joinError } = await supabase
        .from('event_attendees')
        .upsert({
          event_id: testEvent.id,
          user_id: testUser.id,
          status: 'attending',
          attended: false
        }, {
          onConflict: 'event_id,user_id'
        })
        .select();

      if (joinError) {
        console.error('❌ Join event failed:', joinError);
      } else {
        console.log('✅ Join event successful:', joinResult);
        
        // Try to leave event
        const { error: leaveError } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', testEvent.id)
          .eq('user_id', testUser.id);

        if (leaveError) {
          console.error('❌ Leave event failed:', leaveError);
        } else {
          console.log('✅ Leave event successful');
        }
      }
    }

    // 8. Check indexes
    console.log('\n📇 Table Indexes:');
    const { data: indexes, error: indexError } = await supabase
      .from('pg_indexes')
      .select('indexname, indexdef')
      .eq('tablename', 'event_attendees')
      .eq('schemaname', 'public');

    if (indexError) {
      console.error('Error fetching indexes:', indexError);
    } else {
      console.table(indexes);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkEventAttendeesTable()
  .then(() => {
    console.log('\n✅ Event attendees table check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  });
