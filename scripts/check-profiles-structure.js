// Script to check the structure of profiles table
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfilesTableStructure() {
  console.log('🔍 Checking profiles table structure...\n');

  try {
    // Check profiles table structure
    console.log('📋 PROFILES TABLE STRUCTURE:');
    console.log('=' .repeat(50));
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('❌ Error fetching profiles table:', profilesError.message);
    } else {
      if (profilesData && profilesData.length > 0) {
        console.log('✅ Profiles table columns:');
        Object.keys(profilesData[0]).forEach(column => {
          console.log(`  - ${column}`);
        });
      } else {
        console.log('⚠️  Profiles table is empty, trying to get table info...');
      }
    }

    // Test the exact query from StoryViewersModal
    console.log('\n🧪 TESTING STORY_VIEWS WITH PROFILES JOIN:');
    console.log('=' .repeat(50));
    
    const { data: testData, error: testError } = await supabase
      .from('story_views')
      .select(`
        id,
        viewer_id,
        viewed_at,
        profiles:viewer_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .limit(3);

    if (testError) {
      console.error('❌ Error with profiles join:', testError.message);
      
      // Try alternative approach - separate queries
      console.log('\n🔄 TRYING ALTERNATIVE APPROACH:');
      console.log('=' .repeat(50));
      
      const { data: viewsOnly, error: viewsError } = await supabase
        .from('story_views')
        .select('*')
        .limit(3);

      if (viewsError) {
        console.error('❌ Error fetching story_views:', viewsError.message);
      } else {
        console.log('✅ Story views data:', viewsOnly);
        
        if (viewsOnly && viewsOnly.length > 0) {
          // Try to get profile for one viewer
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', viewsOnly[0].viewer_id)
            .single();

          if (profileError) {
            console.error('❌ Error fetching profile:', profileError.message);
          } else {
            console.log('✅ Profile data:', profileData);
          }
        }
      }
    } else {
      console.log('✅ Profiles join works! Data:', testData);
    }

    console.log('\n🎉 Profiles table check completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkProfilesTableStructure();
