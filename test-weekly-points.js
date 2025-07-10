// Test script to check weekly_points data
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔗 Supabase URL:', supabaseUrl ? 'Found' : 'Not found');
console.log('🔑 Supabase Key:', supabaseKey ? 'Found' : 'Not found');

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get Monday of current week (same as in hook)
function getCurrentWeekStart() {
  const today = new Date()
  console.log('Debug - Today:', today.toDateString(), 'Day:', today.getDay())
  
  const currentWeekStart = new Date(today)
  const dayOfWeek = today.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
  
  console.log('Debug - dayOfWeek:', dayOfWeek)
  
  // Calculate days to subtract to get Monday (day 1)
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // If Sunday, go back 6 days; otherwise go back (dayOfWeek - 1) days
  
  console.log('Debug - daysToSubtract:', daysToSubtract)
  console.log('Debug - today.getDate():', today.getDate())
  
  currentWeekStart.setDate(today.getDate() - daysToSubtract)
  
  console.log('Debug - currentWeekStart after setDate:', currentWeekStart.toDateString())
  
  // Fix timezone issue by formatting manually
  const year = currentWeekStart.getFullYear()
  const month = String(currentWeekStart.getMonth() + 1).padStart(2, '0')
  const day = String(currentWeekStart.getDate()).padStart(2, '0')
  const result = `${year}-${month}-${day}`
  
  console.log('Debug - final result:', result)
  
  return result
}

async function checkWeeklyPoints() {
  console.log('🔍 Checking weekly_points table...');
  
  // Check all weekly points data
  const { data: allWeekly, error: allError } = await supabase
    .from('weekly_points')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (allError) {
    console.error('❌ Error fetching weekly points:', allError);
    return;
  }
  
  console.log('📊 All weekly points data:', allWeekly);
  
  // Check current week calculation
  const today = new Date();
  console.log('📅 Today:', today.toDateString());
  console.log('📅 Day of week:', today.getDay(), '(0=Sunday, 1=Monday, etc.)');
  
  // Updated JS calculation (same as hook)
  const weekStartJS = getCurrentWeekStart();
  console.log('🗓️ JS Week Start (Updated):', weekStartJS);
  
  // Test SQL function
  const { data: sqlWeekStart, error: sqlError } = await supabase
    .rpc('get_week_start');
    
  if (sqlError) {
    console.error('❌ Error calling get_week_start:', sqlError);
  } else {
    console.log('🗓️ SQL Week Start:', sqlWeekStart);
  }
  
  // Check for current week data with JS calculation
  const { data: currentWeekJS, error: currentErrorJS } = await supabase
    .from('weekly_points')
    .select('*')
    .eq('week_start_date', weekStartJS);
    
  console.log('📈 Current week data (Updated JS):', currentWeekJS);
  
  // Check for current week data with SQL calculation
  if (sqlWeekStart) {
    const { data: currentWeekSQL, error: currentErrorSQL } = await supabase
      .from('weekly_points')
      .select('*')
      .eq('week_start_date', sqlWeekStart);
      
    console.log('📈 Current week data (SQL):', currentWeekSQL);
  }
}

checkWeeklyPoints().catch(console.error);
