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
  
  try {
    // Get transcript using Gemini AI with time limit and API key rotation
    const transcriptResult = await fetchRealTranscriptWithApiKeyRotation(videoId, maxWatchTimeSeconds);
    
    if (transcriptResult.success && transcriptResult.transcript && transcriptResult.transcript.length > 0) {
      
      // More lenient validation for multilingual content
      const minLength = maxWatchTimeSeconds >= 60 ? 50 : 20; // Lower threshold for shorter videos
      
      if (transcriptResult.transcript.length >= minLength) {
        return {
          videoId,
          title: `Video ${videoId}`,
          duration: `${maxWatchTimeSeconds}s`, // Duration as limited time
          transcript: transcriptResult.transcript,
          transcriptItems: transcriptResult.items || [],
          hasRealTranscript: true
        };
      } else {
        return {
          videoId,
          title: `Video ${videoId}`,
          duration: `${maxWatchTimeSeconds}s`,
          transcript: transcriptResult.transcript,
          transcriptItems: transcriptResult.items || [],
          hasRealTranscript: true
        };
      }
    } else {
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
  const maxRetries = 3; // Giảm từ 5 xuống 3 để nhanh hơn
  let lastError: unknown = null;
    
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const attemptStart = Date.now()
    
    try {
      const activeKey = await getActiveApiKey('gemini');
            
      try {
        const geminiResult = await tryGeminiTranscriptWithKey(videoId, maxWatchTimeSeconds, activeKey.decrypted_key);
                
        if (geminiResult.success && geminiResult.transcript && geminiResult.transcript.length > 0) {
          // More lenient validation - accept shorter content for multilingual videos
          const minLength = maxWatchTimeSeconds >= 60 ? 50 : 20; // Lower threshold for shorter videos
          
          if (geminiResult.transcript.length >= minLength) {
            
            // Increment usage for successful API call
            await incrementUsage(activeKey.id);
            
            return {
              success: true,
              transcript: geminiResult.transcript,
              items: [] // Gemini doesn't provide timing info
            };
          } else {
            
            // For very short videos or multilingual content, accept even shorter transcripts
            if (maxWatchTimeSeconds <= 30 || geminiResult.transcript.trim().length >= 10) {
              
              await incrementUsage(activeKey.id);
              
              return {
                success: true,
                transcript: geminiResult.transcript,
                items: []
              };
            } else {
              lastError = new Error(`Transcript content too short: ${geminiResult.transcript?.length || 0} characters`);
            }
          }
        } else {
          lastError = new Error(`No transcript content received`);
        }
        
      } catch (apiError: unknown) {
        const attemptTime = Date.now() - attemptStart
        console.error(`❌ API error on attempt ${attempt} (${attemptTime}ms):`, apiError);
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
          
          await markKeyAsInactive(activeKey.id, `Video transcript error: ${errorMessage}`);
          
          // Continue to next attempt with new key
          continue;
        }
        
        // For non-API key errors, wait before retry (reduced delay)
        if (attempt < maxRetries) {
          const delay = Math.min(500 * attempt, 2000); // Giảm delay từ exponential xuống linear, max 2s
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
    } catch (keyError) {
      const attemptTime = Date.now() - attemptStart
      console.error(`❌ Failed to get API key on attempt ${attempt} (${attemptTime}ms):`, keyError);
      lastError = keyError;
      
      if (attempt < maxRetries) {
        const delay = 1000; // Giảm từ 2000ms xuống 1000ms
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
  const requestStart = Date.now()
  
  try {
    if (!apiKey) {
      return { success: false, transcript: '', items: [] };
    }
    
    // Initialize Gemini AI with specific API key
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-2.5-flash for video understanding with YouTube URL
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1, // Low temperature for more accurate transcription
        maxOutputTokens: 4096, // Giảm từ 8192 để nhanh hơn
      }
    });
    
    // Use YouTube URL directly with fileData as per documentation
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    
    // Tối ưu prompt để ngắn gọn hơn
    const prompt = `Transcribe ONLY the first ${maxWatchTimeSeconds} seconds of this YouTube video.

Requirements:
- Extract spoken words from ONLY the first ${maxWatchTimeSeconds} seconds
- Provide exact transcript as spoken
- Format with proper punctuation
- Do not summarize or add commentary

Video URL: ${youtubeUrl}
Time limit: ${maxWatchTimeSeconds} seconds`;
    
    const requestSendTime = Date.now()
    
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: "video/*", 
          fileUri: youtubeUrl
        }
      },
      prompt
    ]);
    
    const responseTime = Date.now()
    
    const response = await result.response;
    const text = response.text();
    
    const totalTime = Date.now() - requestStart

    // Check if Gemini couldn't access the video - be more lenient with length requirements
    if (text.includes('CANNOT_ACCESS_VIDEO') || 
        text.includes('cannot access') || 
        text.includes('unable to access') ||
        text.includes('I cannot') ||
        text.includes('I don\'t have') ||
        text.includes('I can\'t access') ||
        text.includes('I\'m unable to') ||
        text.includes('I am unable to')) {
      return { success: false, transcript: '', items: [] };
    }
    
    // More lenient length check - some videos may have brief content
    if (text.length < 10) {
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

    // Validate we have meaningful content - more lenient for multilingual videos
    const minLength = maxWatchTimeSeconds >= 60 ? 30 : 15; // Lower threshold
    
    if (cleanTranscript.length >= minLength && 
        !cleanTranscript.toLowerCase().includes('i cannot') && 
        !cleanTranscript.toLowerCase().includes('unable to access')) {
      
      // Create transcript items by splitting into meaningful chunks (sentences/phrases)
      const sentences = cleanTranscript
        .split(/(?<=[.!?])\s+/)
        .filter((s: string) => s.trim().length > 0);
      
      const avgDuration = Math.min(6, maxWatchTimeSeconds / Math.max(sentences.length, 1)); // Giới hạn 6s/câu
      
      const items: TranscriptItem[] = sentences.map((sentence: string, index: number) => ({
        text: sentence.trim(),
        duration: Math.max(1.5, Math.min(avgDuration, sentence.length / 12)), // Tối ưu duration
        offset: index * avgDuration // Timing tốt hơn
      }));
      
      return {
        success: true,
        transcript: cleanTranscript,
        items
      };
    }

    return { success: false, transcript: '', items: [] };
    
  } catch (error: unknown) {
    const errorTime = Date.now() - requestStart
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw error; // Re-throw to allow retry logic to handle API key rotation
  }
}

export async function processVideoForChallenge(videoId: string): Promise<VideoInfo> {
  try {
    const videoInfo = await extractYouTubeTranscriptForDuration(videoId, 0, 300);
    
    if (!videoInfo.transcript || videoInfo.transcript.length < 100) {
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


