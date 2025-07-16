/**
 * Script to populate sample stories for testing
 * Run with: node scripts/populate-sample-stories.js
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

async function populateStories() {
  console.log('📖 Populating Sample Stories\n');
  
  try {
    // Get first few users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(5);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('No users found. Please run populate-sample-data.js first');
      return;
    }

    console.log(`Found ${users.length} users to create stories for`);

    // Create sample stories for each user
    const stories = [];
    
    for (const user of users) {
      // Create 2-3 stories per user
      stories.push(
        {
          author_id: user.id,
          content: 'Just finished my morning English practice! 📚 Feeling motivated to learn more.',
          media_url: null,
          media_type: 'text',
          background_color: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          text_elements: [
            {
              id: 'text-1',
              text: 'Good Morning! ☀️',
              x: 50,
              y: 30,
              fontSize: 24,
              color: '#ffffff',
              fontFamily: 'Arial',
              fontWeight: 'bold',
              textAlign: 'center'
            },
            {
              id: 'text-2',
              text: 'Daily English Practice ✨',
              x: 50,
              y: 70,
              fontSize: 16,
              color: '#ffffff',
              fontFamily: 'Arial',
              fontWeight: 'normal',
              textAlign: 'center'
            }
          ],
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          is_active: true
        },
        {
          author_id: user.id,
          content: 'Learning new vocabulary today! 🌟',
          media_url: null,
          media_type: 'text',
          background_color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          text_elements: [
            {
              id: 'text-1',
              text: 'New Words Today:',
              x: 50,
              y: 25,
              fontSize: 20,
              color: '#ffffff',
              fontFamily: 'Arial',
              fontWeight: 'bold',
              textAlign: 'center'
            },
            {
              id: 'text-2',
              text: '• Serendipity\n• Eloquent\n• Resilient',
              x: 50,
              y: 60,
              fontSize: 16,
              color: '#ffffff',
              fontFamily: 'Arial',
              fontWeight: 'normal',
              textAlign: 'center'
            }
          ],
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        }
      );
    }

    // Insert stories
    const { data: insertedStories, error: insertError } = await supabase
      .from('stories')
      .insert(stories)
      .select();

    if (insertError) {
      console.error('Error inserting stories:', insertError);
      return;
    }

    console.log(`✅ Successfully created ${insertedStories.length} stories`);

    // Show summary by user
    console.log('\n📊 Stories Summary by User:');
    for (const user of users) {
      const userStories = insertedStories.filter(s => s.author_id === user.id);
      console.log(`${user.email}: ${userStories.length} stories`);
    }

    // Now create some sample story views for interactions
    console.log('\n👁️ Creating sample story views for testing...');
    const storyViews = [];
    
    // Create views for first few stories
    for (let i = 0; i < Math.min(insertedStories.length, 3); i++) {
      const story = insertedStories[i];
      
      // Add views from other users
      for (let j = 0; j < users.length; j++) {
        if (users[j].id !== story.author_id) {
          storyViews.push({
            story_id: story.id,
            viewer_id: users[j].id,
            interaction_type: 'view',
            viewed_at: new Date().toISOString()
          });
        }
      }
    }

    if (storyViews.length > 0) {
      const { data: insertedViews, error: viewsError } = await supabase
        .from('story_views')
        .insert(storyViews)
        .select();

      if (viewsError) {
        console.error('Error inserting story views:', viewsError);
      } else {
        console.log(`✅ Created ${insertedViews.length} story views`);
      }
    }

    console.log('\n🔍 Stories created:');
    console.table(insertedStories.map(s => ({
      id: s.id.substring(0, 8) + '...',
      author: users.find(u => u.id === s.author_id)?.email || 'Unknown',
      content: s.content.substring(0, 50) + '...',
      background: s.background_color.substring(0, 20) + '...',
      active: s.is_active
    })));

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the population
populateStories().then(() => {
  console.log('\n✅ Sample stories population completed!');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error during population:', error);
  process.exit(1);
});
