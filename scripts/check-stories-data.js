const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkStoriesData() {
  try {
    console.log('🔍 Checking stories data...\n');

    // Kiểm tra stories hiện tại
    const { data: stories, error } = await supabase
      .from('stories')
      .select(`
        id,
        content,
        media_url,
        media_type,
        background_color,
        background_image,
        images,
        is_active,
        expires_at,
        created_at,
        profiles!fk_stories_author_profiles(
          full_name,
          avatar_url
        )
      `)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching stories:', error);
      return;
    }

    console.log(`📊 Found ${stories?.length || 0} active stories\n`);

    stories?.forEach((story, index) => {
      console.log(`📖 Story ${index + 1}:`);
      console.log(`   ID: ${story.id}`);
      console.log(`   Content: ${story.content || 'No content'}`);
      console.log(`   Media URL: ${story.media_url || 'No media_url'}`);
      console.log(`   Media Type: ${story.media_type || 'No media_type'}`);
      console.log(`   Background Image: ${story.background_image || 'No background_image'}`);
      console.log(`   Images: ${story.images ? JSON.stringify(story.images) : 'No images'}`);
      console.log(`   Background Color: ${story.background_color}`);
      console.log(`   Author: ${story.profiles?.full_name || 'Unknown'}`);
      console.log(`   Avatar: ${story.profiles?.avatar_url || 'No avatar'}`);
      console.log(`   Created: ${new Date(story.created_at).toLocaleString()}`);
      console.log(`   Expires: ${new Date(story.expires_at).toLocaleString()}`);
      console.log('   ---');
    });

    // Kiểm tra stories có media
    const { data: storiesWithMedia, error: mediaError } = await supabase
      .from('stories')
      .select('id, media_url, background_image, images')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .or('media_url.not.is.null,background_image.not.is.null,images.not.eq.[]');

    if (mediaError) {
      console.error('❌ Error fetching stories with media:', mediaError);
    } else {
      console.log(`\n🖼️ Stories with media: ${storiesWithMedia?.length || 0}`);
      storiesWithMedia?.forEach((story) => {
        console.log(`   ${story.id}: media_url=${!!story.media_url}, bg_image=${!!story.background_image}, images=${Array.isArray(story.images) ? story.images.length : 0} items`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkStoriesData();
