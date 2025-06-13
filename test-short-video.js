const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testShortVideoTranscript() {
  console.log('🎬 Testing SHORT video transcript extraction...\n');
  
  // Test with very short videos (under 1 minute)
  const shortVideos = [
    {
      id: 'FYOMpzia_Dk', 
      url: 'https://www.youtube.com/watch?v=FYOMpzia_Dk',
      description: 'Very short video (few seconds)'
    },
    {
      id: 'dQw4w9WgXcQ', 
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'Rick Roll - well known video (3.5 minutes)'
    },
    {
      id: 'jNQXAC9IVRw',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', 
      description: 'Short animal video'
    }
  ];

  for (const video of shortVideos) {
    console.log(`\n📹 Testing: ${video.description}`);
    console.log(`🔗 Video ID: ${video.id}`);
    console.log(`🔗 URL: ${video.url}`);
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash" // Use flash model to save quota
      });

      console.log('⏳ Requesting transcript from Gemini AI...');
      
      const result = await model.generateContent([
        {
          fileData: {
            mimeType: "video/*",
            fileUri: video.url
          }
        },
        `Please provide the COMPLETE and ACCURATE transcript of this YouTube video.

REQUIREMENTS:
- Extract 100% of all spoken words from the entire video
- Include every single word that is spoken
- Format as clean paragraphs with proper punctuation
- Do NOT summarize or paraphrase - give exact spoken words
- If there are multiple speakers, indicate speaker changes
- Include any significant pauses or [music] annotations if relevant

Please transcribe the ENTIRE audio content word-for-word:`
      ]);

      const response = await result.response;
      const transcript = response.text();
      
      console.log(`✅ Response received: ${transcript.length} characters`);
      
      if (transcript && transcript.length > 0) {
        console.log('\n📝 COMPLETE TRANSCRIPT:');
        console.log('=' .repeat(60));
        console.log(transcript);
        console.log('=' .repeat(60));
        
        // Analyze transcript quality
        const wordCount = transcript.split(/\s+/).length;
        const hasRepeatedPhrases = /(.{20,})\1/.test(transcript);
        
        console.log(`\n📊 TRANSCRIPT ANALYSIS:`);
        console.log(`📏 Length: ${transcript.length} characters`);
        console.log(`📝 Word count: ${wordCount} words`);
        console.log(`🔄 Has repetition: ${hasRepeatedPhrases ? 'Yes' : 'No'}`);
        console.log(`✅ Quality: ${transcript.length > 50 && !hasRepeatedPhrases ? 'GOOD' : 'NEEDS REVIEW'}`);
        
      } else {
        console.log('❌ Empty transcript received');
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      if (error.message.includes('quota')) {
        console.log('💰 Quota exceeded - try again later');
        break;
      }
    }
    
    // Wait between requests to avoid rate limiting
    console.log('\n⏱️ Waiting 2 seconds before next request...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Run the test
testShortVideoTranscript().catch(console.error);
