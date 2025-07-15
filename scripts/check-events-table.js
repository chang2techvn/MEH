/**
 * Script to check events table structure and data
 * Run with: node scripts/check-events-table.js
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

async function checkEventsTable() {
  console.log('🔍 Checking Events Table Structure and Data\n');
  
  try {
    // 1. Check table structure by querying information_schema
    console.log('📋 Table Structure:');
    const { data: columns, error: structureError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'events')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (structureError) {
      console.error('Error fetching table structure:', structureError);
    } else {
      console.table(columns);
    }

    // 2. Check total count
    console.log('\n📊 Table Statistics:');
    const { count, error: countError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting count:', countError);
    } else {
      console.log(`Total events: ${count}`);
    }

    // 3. Check recent events
    console.log('\n🎯 Recent Events (Last 10):');
    const { data: recentEvents, error: recentError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        event_type,
        start_date,
        end_date,
        is_online,
        is_public,
        is_active,
        current_attendees,
        max_attendees,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('Error fetching recent events:', recentError);
    } else {
      if (recentEvents && recentEvents.length > 0) {
        console.table(recentEvents);
      } else {
        console.log('No events found');
      }
    }

    // 4. Check upcoming events
    console.log('\n📅 Upcoming Events:');
    const now = new Date().toISOString();
    const { data: upcomingEvents, error: upcomingError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        event_type,
        start_date,
        location,
        is_online,
        current_attendees,
        max_attendees
      `)
      .gte('start_date', now)
      .eq('is_active', true)
      .eq('is_public', true)
      .order('start_date', { ascending: true })
      .limit(5);

    if (upcomingError) {
      console.error('Error fetching upcoming events:', upcomingError);
    } else {
      if (upcomingEvents && upcomingEvents.length > 0) {
        console.table(upcomingEvents);
      } else {
        console.log('No upcoming events found');
      }
    }

    // 5. Check event types distribution
    console.log('\n📈 Event Types Distribution:');
    const { data: eventTypes, error: typesError } = await supabase
      .from('events')
      .select('event_type')
      .not('event_type', 'is', null);

    if (typesError) {
      console.error('Error fetching event types:', typesError);
    } else {
      const distribution = eventTypes.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {});
      console.table(distribution);
    }

    // 6. Check RLS policies
    console.log('\n🔒 RLS Policies:');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, permissive, roles, cmd, qual')
      .eq('tablename', 'events');

    if (policiesError) {
      console.error('Error fetching policies:', policiesError);
    } else {
      console.table(policies);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkEventsTable().then(() => {
  console.log('\n✅ Events table check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error during check:', error);
  process.exit(1);
});
