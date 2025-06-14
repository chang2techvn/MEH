import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

export async function extractVideoTranscript(videoId: string): Promise<VideoInfo> {
  console.log(`🎬 Extracting transcript for video: ${videoId}`);
  
  try {
    // Try to get real transcript using the updated API
    console.log(`🔍 Attempting to fetch real transcript for video: ${videoId}`);
    
    const transcriptResult = await fetchRealTranscript(videoId);
    
    if (transcriptResult.success && transcriptResult.transcript && transcriptResult.transcript.length > 0) {
      console.log(`✅ Successfully extracted real transcript for video ${videoId}`);
      console.log(`📊 Transcript length: ${transcriptResult.transcript.length} characters`);
      
      return {
        videoId,
        title: `Video ${videoId}`,
        duration: "Unknown",
        transcript: transcriptResult.transcript,
        transcriptItems: transcriptResult.items || [],
        hasRealTranscript: true
      };
    } else {
      console.log(`❌ No real transcript found for video ${videoId}, using simulated content`);
      return generateSimulatedTranscript(videoId);
    }
    
  } catch (error) {
    console.error(`❌ Error extracting transcript for video ${videoId}:`, error);
    return generateSimulatedTranscript(videoId);
  }
}

async function fetchRealTranscript(videoId: string): Promise<{
  success: boolean;
  transcript: string;
  items: TranscriptItem[];
}> {
  try {
    // First try Gemini AI with YouTube URL for REAL transcript
    console.log(`🤖 Trying Gemini AI for REAL transcript extraction for video: ${videoId}`);
    const geminiResult = await tryGeminiTranscript(videoId);
    
    if (geminiResult.success) {
      console.log(`✅ Gemini AI extracted REAL transcript!`);
      return geminiResult;
    }

    // Fallback to traditional YouTube transcript
    console.log(`🔍 Falling back to YouTube transcript API for video: ${videoId}`);
    const youtubeResult = await tryYouTubeTranscript(videoId);
    
    if (youtubeResult.success) {
      console.log(`✅ YouTube transcript found!`);
      return youtubeResult;
    }

    // If no real transcript found, return failure
    console.log(`❌ No real transcript found for video ${videoId}`);
    return {
      success: false,
      transcript: '',
      items: []
    };
    
  } catch (error) {
    console.error('❌ Error in fetchRealTranscript:', error);
    return { success: false, transcript: '', items: [] };
  }
}

async function tryYouTubeTranscript(videoId: string): Promise<{
  success: boolean;
  transcript: string;
  items: TranscriptItem[];
}> {
  try {
    // Try different language configurations
    const languagesToTry = [
      undefined, // Auto-detect
      'en',      // English
      'en-US',   // US English
      'en-GB',   // British English
      'auto',    // Auto-generated
    ];    for (const lang of languagesToTry) {
      try {
        console.log(`🌐 Trying language: ${lang || 'auto-detect'}`);
        
        // Prepare config object
        const config = lang ? { lang: lang } : {};
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, config);

        if (transcriptData && transcriptData.length > 0) {
          console.log(`✅ Found transcript in ${lang || 'auto-detect'} with ${transcriptData.length} items`);
          
          const transcript = transcriptData
            .map(item => item.text)
            .join(' ')
            .replace(/\[.*?\]/g, '') // Remove [Music], [Applause], etc.
            .replace(/\s+/g, ' ')    // Normalize whitespace
            .trim();

          const items: TranscriptItem[] = transcriptData.map(item => ({
            text: item.text,
            duration: item.duration || 0,
            offset: item.offset || 0
          }));

          return {
            success: true,
            transcript,
            items
          };
        } else {
          console.log(`❌ No transcript found in ${lang || 'auto-detect'}`);
        }
      } catch (langError) {
        const errorMessage = langError instanceof Error ? langError.message : String(langError);
        console.log(`❌ Failed to fetch transcript in ${lang || 'auto-detect'}:`, errorMessage);
        continue;
      }
    }

    // If no transcript found with any language, try without language specification
    console.log('🌍 Trying without specific language...');
    const fallbackTranscript = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (fallbackTranscript && fallbackTranscript.length > 0) {
      console.log(`✅ Found fallback transcript with ${fallbackTranscript.length} items`);
      
      const transcript = fallbackTranscript
        .map(item => item.text)
        .join(' ')
        .replace(/\[.*?\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      const items: TranscriptItem[] = fallbackTranscript.map(item => ({
        text: item.text,
        duration: item.duration || 0,
        offset: item.offset || 0
      }));

      return {
        success: true,
        transcript,
        items
      };
    }

    return { success: false, transcript: '', items: [] };
    
  } catch (error) {
    console.error('❌ Error in fetchRealTranscript:', error);
    return { success: false, transcript: '', items: [] };  }
}

async function tryGeminiTranscript(videoId: string): Promise<{
  success: boolean;
  transcript: string;
  items: TranscriptItem[];
}> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log(`❌ No Gemini API key found`);
      return { success: false, transcript: '', items: [] };
    }    // Use gemini-2.0-flash for video understanding with YouTube URL
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.1, // Low temperature for more accurate transcription
        maxOutputTokens: 8192,
      }
    });
    
    // Use YouTube URL directly with fileData as per documentation
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    console.log(`🤖 Requesting REAL transcript from Gemini for: ${youtubeUrl}`);    // Create content using the proper format from the documentation
    const prompt = `Please transcribe this YouTube video completely and accurately. 
Extract ALL spoken words exactly as they are said in the video.
Provide the transcript as a continuous paragraph format.
Do not summarize, do not add commentary, just transcribe what is actually spoken.
Video URL: ${youtubeUrl}`;
    
    console.log(`🤖 Sending video transcription request to Gemini AI...`);
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
    return { success: false, transcript: '', items: [] };
  }
}

function generateSimulatedTranscript(videoId: string): VideoInfo {
  console.log(`\n=== SIMULATED VIDEO TRANSCRIPT FOR ${videoId} ===`);
  
  const topics = [
    {
      topic: "CLIMATE CHANGE",
      content: "Climate change represents one of the most pressing challenges of our time. The Earth's climate system is warming at an unprecedented rate due to human activities, particularly the emission of greenhouse gases like carbon dioxide and methane. Scientific evidence shows that global temperatures have risen by approximately 1.1 degrees Celsius since pre-industrial times. This warming is causing dramatic changes in weather patterns, including more frequent extreme weather events such as hurricanes, droughts, and floods. The Arctic ice sheets are melting at alarming rates, contributing to rising sea levels that threaten coastal communities worldwide. To address this crisis, we need immediate action on multiple fronts: transitioning to renewable energy sources, improving energy efficiency, protecting and restoring forests, and implementing carbon pricing mechanisms. Individual actions also matter - from reducing energy consumption to choosing sustainable transportation options. The Paris Agreement represents a global commitment to limiting warming to well below 2 degrees Celsius, but achieving this goal requires unprecedented cooperation and rapid transformation of our energy systems."
    },
    {
      topic: "TECHNOLOGY AND SOCIETY",
      content: "The rapid advancement of technology is reshaping every aspect of our daily lives, from how we communicate and work to how we learn and entertain ourselves. Artificial intelligence and machine learning are becoming increasingly sophisticated, enabling computers to perform tasks that were once thought to be exclusively human. Social media platforms have connected billions of people across the globe, creating new opportunities for collaboration and cultural exchange, but also raising concerns about privacy, misinformation, and mental health. The rise of remote work and digital nomadism has challenged traditional notions of workplace and geography. Meanwhile, emerging technologies like virtual reality, blockchain, and quantum computing promise to unlock new possibilities we can barely imagine. However, with these advances come important questions about digital equity, cybersecurity, and the ethical implications of increasingly powerful technologies. As we navigate this digital transformation, it's crucial that we develop policies and practices that harness technology's benefits while mitigating its risks."
    },
    {
      topic: "SUSTAINABLE LIVING",
      content: "Sustainable living involves making conscious choices to reduce our environmental impact while maintaining a high quality of life. This approach encompasses various aspects of daily life, including energy consumption, transportation, food choices, and waste management. Simple changes like using energy-efficient appliances, choosing renewable energy sources, and improving home insulation can significantly reduce our carbon footprint. Transportation choices also play a crucial role - walking, cycling, using public transport, or driving electric vehicles can substantially lower emissions. Our food system has a major environmental impact, so choosing locally-sourced, seasonal, and plant-based foods can make a real difference. Reducing waste through the principles of reduce, reuse, and recycle helps minimize our consumption of natural resources. Water conservation through efficient fixtures and mindful usage protects this precious resource. Supporting businesses that prioritize sustainability creates market demand for environmentally responsible practices. Sustainable living isn't about perfection, but about making thoughtful choices that collectively contribute to a healthier planet for future generations."
    }
  ];

  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  const transcript = randomTopic.content;
  
  console.log(`Topic: ${randomTopic.topic}`);
  console.log(`Content Length: ${transcript.length} characters`);
  console.log(`\n--- TRANSCRIPT CONTENT ---`);
  console.log(transcript);
  console.log(`\n=== END TRANSCRIPT ===\n`);

  // Create simulated transcript items
  const words = transcript.split(' ');
  const items: TranscriptItem[] = [];
  let currentOffset = 0;
  
  for (let i = 0; i < words.length; i += 5) {
    const chunk = words.slice(i, i + 5).join(' ');
    items.push({
      text: chunk,
      duration: 3000, // 3 seconds per chunk
      offset: currentOffset
    });
    currentOffset += 3000;
  }

  return {
    videoId,
    title: `Video ${videoId} - ${randomTopic.topic}`,
    duration: `${Math.floor(currentOffset / 60000)}:${String(Math.floor((currentOffset % 60000) / 1000)).padStart(2, '0')}`,
    transcript,
    transcriptItems: items,
    hasRealTranscript: false
  };
}

export async function processVideoForChallenge(videoId: string): Promise<VideoInfo> {
  try {
    const videoInfo = await extractVideoTranscript(videoId);
    
    if (!videoInfo.transcript || videoInfo.transcript.length < 100) {
      console.log(`⚠️ Transcript too short for video ${videoId}, regenerating...`);
      return generateSimulatedTranscript(videoId);
    }
    
    return videoInfo;
    
  } catch (error) {
    console.error(`❌ Error processing video ${videoId}:`, error);
    return generateSimulatedTranscript(videoId);
  }
}

// Compatibility functions for existing imports
export async function extractYouTubeTranscript(videoId: string): Promise<string> {
  try {
    const videoInfo = await extractVideoTranscript(videoId);
    return videoInfo.transcript;
  } catch (error) {
    console.error(`Error extracting YouTube transcript for ${videoId}:`, error);
    return '';
  }
}

export async function extractYouTubeTranscriptForDuration(videoId: string, maxDuration?: number): Promise<{
  transcript: string;
  duration: number;
  items: TranscriptItem[];
}> {
  try {
    const videoInfo = await extractVideoTranscript(videoId);
    let transcript = videoInfo.transcript;
    let items = videoInfo.transcriptItems;
    
    // If maxDuration is specified, limit the transcript
    if (maxDuration && videoInfo.transcriptItems.length > 0) {
      const filteredItems = videoInfo.transcriptItems.filter(item => item.offset < maxDuration * 1000);
      transcript = filteredItems.map(item => item.text).join(' ');
      items = filteredItems;
    }
    
    const totalDuration = items.length > 0 ? Math.max(...items.map(item => item.offset + item.duration)) : 0;
    
    return {
      transcript,
      duration: Math.floor(totalDuration / 1000), // Convert to seconds
      items
    };
  } catch (error) {
    console.error(`Error extracting YouTube transcript with duration for ${videoId}:`, error);
    return {
      transcript: '',
      duration: 0,
      items: []
    };
  }
}
