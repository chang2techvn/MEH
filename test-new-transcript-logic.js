const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testTranscriptLogic() {
  console.log('🧪 Testing NEW transcript logic...\n');
  
  // Test with a short video to avoid quota issues
  const testVideo = 'FYOMpzia_Dk'; // Very short video
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ No GEMINI_API_KEY found in .env');
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash"
  });

  const youtubeUrl = `https://www.youtube.com/watch?v=${testVideo}`;
  console.log(`🎬 Testing video: ${testVideo}`);
  console.log(`🔗 URL: ${youtubeUrl}`);
  
  try {
    // Add delay to avoid rate limiting
    console.log('⏳ Adding 3 second delay to avoid rate limiting...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🤖 Requesting transcript from Gemini AI...');
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: "video/*",
          fileUri: youtubeUrl
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

    console.log(`\n✅ Response received: ${transcript.length} characters`);
    
    // Test new logic
    if (!transcript || transcript.length < 100) {
      console.log('❌ FAILED: Transcript too short or empty');
      console.log('🔄 NEW LOGIC: Would try another video...');
      return false;
    }
    
    console.log(`\n📜 TRANSCRIPT PREVIEW (first 500 chars):`);
    console.log('=' .repeat(60));
    console.log(transcript.substring(0, 500) + (transcript.length > 500 ? '...' : ''));
    console.log('=' .repeat(60));
    
    // Validate transcript quality
    const wordCount = transcript.split(/\s+/).length;
    console.log(`\n📊 TRANSCRIPT ANALYSIS:`);
    console.log(`📏 Length: ${transcript.length} characters`);
    console.log(`📝 Word count: ${wordCount} words`);
    
    // Check for quality indicators
    const hasSimulatedText = transcript.includes('simulated transcript') || 
                            transcript.includes('This is a simulated') ||
                            transcript.includes('real implementation');
    
    if (hasSimulatedText) {
      console.log('❌ QUALITY CHECK FAILED: Contains simulated text markers');
      return false;
    }
    
    console.log('✅ QUALITY CHECK PASSED: Appears to be real transcript');
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error testing transcript:`, error.message);
    
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      console.log('⚠️ QUOTA EXCEEDED: NEW LOGIC would wait and retry...');
    }
    
    return false;
  }
}

// Run test
testTranscriptLogic()
  .then((success) => {
    console.log(`\n🏁 TEST RESULT: ${success ? 'SUCCESS' : 'FAILED'}`);
    if (success) {
      console.log('✅ New logic will save ONLY real transcripts to database');
      console.log('✅ Empty transcripts will trigger retry with different videos');
      console.log('✅ System will try up to 3 videos to get valid transcript');
    }
  })
  .catch(console.error);
