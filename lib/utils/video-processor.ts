import { GoogleGenerativeAI } from '@google/generative-ai';
import { getActiveApiKey, incrementUsage, markKeyAsInactive, rotateToNextKey } from '../api-key-manager';

export interface TranscriptItem {
  text: string;
  duration: number;
  offset: number;
}

export interface VideoInfo {
  videoId: string;
  title: string;
  duration: string;
  transcript: string;
  transcriptItems: TranscriptItem[];
  hasRealTranscript: boolean;
}

export async function extractYouTubeTranscriptForDuration(
  videoId: string, 
  videoDuration: number = 0, 
  maxWatchTimeSeconds: number = 300 // Default 5 minutes
): Promise<VideoInfo> {
  console.log(`🎬 Extracting LIMITED transcript for video: ${videoId} (max ${maxWatchTimeSeconds}s)`)
  
  try {
    // Get transcript using Gemini AI with time limit and API key rotation
    const transcriptResult = await fetchRealTranscriptWithApiKeyRotation(videoId, maxWatchTimeSeconds);
    
    if (transcriptResult.success && transcriptResult.transcript && transcriptResult.transcript.length > 0) {
      console.log(`✅ Successfully extracted LIMITED transcript for video ${videoId}`);
      console.log(`📊 Limited transcript length: ${transcriptResult.transcript.length} characters`);
      
      return {
        videoId,
        title: `Video ${videoId}`,
        duration: `${maxWatchTimeSeconds}s`, // Duration as limited time
        transcript: transcriptResult.transcript,
        transcriptItems: transcriptResult.items || [],
        hasRealTranscript: true
      };
    } else {
      console.log(`❌ No real limited transcript found for video ${videoId}`);
      throw new Error(`Failed to extract real transcript for video ${videoId}`);
    }
    
  } catch (error) {
    console.error(`❌ Error extracting limited transcript for video ${videoId}:`, error);
    throw error; // Re-throw to prevent fallback generation
  }
}





async function fetchRealTranscriptWithApiKeyRotation(videoId: string, maxWatchTimeSeconds: number = 300): Promise<{
  success: boolean;
  transcript: string;
  items: TranscriptItem[];
}> {
  const maxRetries = 5;
  let lastError: unknown = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 Using Gemini AI for LIMITED transcript extraction (attempt ${attempt}/${maxRetries}) for video: ${videoId} (max ${maxWatchTimeSeconds}s)`);
      
      // Get fresh API key for each attempt
      const activeKey = await getActiveApiKey('gemini');
      
      try {
        // Try to get transcript with this API key
        const geminiResult = await tryGeminiTranscriptWithKey(videoId, maxWatchTimeSeconds, activeKey.decrypted_key);
        
        if (geminiResult.success && geminiResult.transcript && geminiResult.transcript.length > 100) {
          console.log(`✅ Limited Gemini transcript received: ${geminiResult.transcript.length} characters`);
          
          // Increment usage for successful API call
          await incrementUsage(activeKey.id);
          
          return {
            success: true,
            transcript: geminiResult.transcript,
            items: [] // Gemini doesn't provide timing info
          };
        } else {
          console.log(`❌ Gemini AI failed to extract transcript for video: ${videoId} (attempt ${attempt})`);
          lastError = new Error(`Insufficient transcript content received`);
        }
        
      } catch (apiError: unknown) {
        console.error(`❌ API error on attempt ${attempt}:`, apiError);
        lastError = apiError;
        
        const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
        
        // Check if it's an API key related error
        if (errorMessage.includes('403') || 
            errorMessage.includes('401') || 
            errorMessage.includes('invalid') ||
            errorMessage.includes('quota') ||
            errorMessage.includes('limit') ||
            errorMessage.includes('overloaded') ||
            errorMessage.includes('503')) {
          
          console.log(`🔄 API key error detected, marking key as inactive and rotating`);
          await markKeyAsInactive(activeKey.id, `Video transcript error: ${errorMessage}`);
          
          // Continue to next attempt with new key
          continue;
        }
        
        // For non-API key errors, wait before retry
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
    } catch (keyError) {
      console.error(`❌ Failed to get API key on attempt ${attempt}:`, keyError);
      lastError = keyError;
      
      if (attempt < maxRetries) {
        const delay = 2000;
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(`❌ All ${maxRetries} attempts failed for video ${videoId}. Last error:`, lastError);
  return {
    success: false,
    transcript: "",
    items: []
  };
}
    
async function tryGeminiTranscriptWithKey(videoId: string, maxWatchTimeSeconds: number = 300, apiKey: string): Promise<{
  success: boolean;
  transcript: string;
  items: TranscriptItem[];
}> {
  try {
    if (!apiKey) {
      console.log(`❌ No Gemini API key provided`);
      return { success: false, transcript: '', items: [] };
    }
    
    // Initialize Gemini AI with specific API key
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-2.5-flash for video understanding with YouTube URL
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1, // Low temperature for more accurate transcription
        maxOutputTokens: 8192,
      }
    });
    
    // Use YouTube URL directly with fileData as per documentation
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    console.log(`🤖 Requesting LIMITED transcript from Gemini for: ${youtubeUrl} (${maxWatchTimeSeconds}s)`);
    
    // Create content using the proper format with time limit
    const prompt = `Please transcribe ONLY the first ${maxWatchTimeSeconds} seconds of this YouTube video.

IMPORTANT REQUIREMENTS:
- Extract spoken words from ONLY the first ${maxWatchTimeSeconds} seconds (${Math.floor(maxWatchTimeSeconds/60)} minutes ${maxWatchTimeSeconds%60} seconds)
- Do NOT transcribe beyond ${maxWatchTimeSeconds} seconds
- Provide the transcript exactly as spoken within this time limit
- Format as continuous paragraphs with proper punctuation
- Do not summarize, do not add commentary, just transcribe what is actually spoken in the first ${maxWatchTimeSeconds} seconds

Video URL: ${youtubeUrl}
Time limit: First ${maxWatchTimeSeconds} seconds only`;
    
    console.log(`🤖 Sending LIMITED video transcription request to Gemini AI...`);
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: "video/*", 
          fileUri: youtubeUrl
        }
      },
      prompt
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    console.log(`🤖 Gemini response received: ${text.length} characters`);
    console.log(`🤖 Preview: "${text.substring(0, 200)}..."`);

    // Check if Gemini couldn't access the video
    if (text.includes('CANNOT_ACCESS_VIDEO') || 
        text.includes('cannot access') || 
        text.includes('unable to access') ||
        text.includes('I cannot') ||
        text.includes('I don\'t have') ||
        text.includes('I can\'t access') ||
        text.includes('I\'m unable to') ||
        text.includes('I am unable to') ||
        text.length < 100) {
      console.log(`❌ Gemini cannot access this YouTube video or provided insufficient content`);
      return { success: false, transcript: '', items: [] };
    }

    // Clean the transcript text while preserving actual content
    let cleanTranscript = text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/^[\s]*Transcript:[\s]*/i, '') // Remove "Transcript:" prefix
      .replace(/\[Music\]/gi, '')
      .replace(/\[Applause\]/gi, '')
      .replace(/\[Laughter\]/gi, '')
      .replace(/\[Sound effects?\]/gi, '')
      .replace(/\[Background music\]/gi, '')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Validate we have substantial, real content
    if (cleanTranscript.length > 100 && !cleanTranscript.toLowerCase().includes('i cannot') && !cleanTranscript.toLowerCase().includes('unable to access')) {
      
      // Create transcript items by splitting into meaningful chunks (sentences/phrases)
      const sentences = cleanTranscript
        .split(/(?<=[.!?])\s+/)
        .filter((s: string) => s.trim().length > 0);
      
      const items: TranscriptItem[] = sentences.map((sentence: string, index: number) => ({
        text: sentence.trim(),
        duration: Math.max(2, Math.min(8, sentence.length / 15)), // Dynamic duration based on length
        offset: index * 4 // Approximate timing
      }));

      console.log(`✅ Successfully extracted REAL transcript from Gemini!`);
      console.log(`📊 Content: ${cleanTranscript.length} chars, ${items.length} segments`);
      
      return {
        success: true,
        transcript: cleanTranscript,
        items
      };
    }

    console.log(`❌ Gemini transcript validation failed - length: ${cleanTranscript.length}`);
    return { success: false, transcript: '', items: [] };
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`❌ Gemini AI transcription error:`, errorMessage);
    throw error; // Re-throw to allow retry logic to handle API key rotation
  }
}

export async function processVideoForChallenge(videoId: string): Promise<VideoInfo> {
  try {
    const videoInfo = await extractYouTubeTranscriptForDuration(videoId, 0, 300);
    
    if (!videoInfo.transcript || videoInfo.transcript.length < 100) {
      console.log(`⚠️ Transcript too short for video ${videoId}`);
      throw new Error(`Transcript too short for video ${videoId}: ${videoInfo.transcript?.length || 0} characters`);
    }
    
    return videoInfo;
    
  } catch (error) {
    console.error(`❌ Error processing video ${videoId}:`, error);
    throw error; // Re-throw to prevent fallback generation
  }
}

// Compatibility functions for existing imports
export async function extractYouTubeTranscript(videoId: string): Promise<string> {
  try {
    const videoInfo = await extractYouTubeTranscriptForDuration(videoId, 0, 300);
    return videoInfo.transcript;
  } catch (error) {
    console.error(`Error extracting YouTube transcript for ${videoId}:`, error);
    throw error; // Re-throw instead of returning empty string to prevent silent failures
  }
}


