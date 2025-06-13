"use server"
import { mkdir } from "fs/promises"
import path from "path"
import os from "os"
import { YoutubeTranscript } from 'youtube-transcript'

// This is a server-side utility for processing videos
// In a real implementation, you would use a proper video processing service

export async function downloadAndTrimYouTubeVideo(
  videoId: string,
  maxDuration: number,
  outputFileName: string,
): Promise<string> {
  try {
    // In a real implementation, you would:
    // 1. Use a proper YouTube downloader like ytdl-core
    // 2. Use FFmpeg installed on the server to process the video
    // 3. Upload the processed video to a storage service like S3 or Vercel Blob

    // For this example, we'll simulate the process
    console.log(`Simulating download and processing of YouTube video: ${videoId}`)
    console.log(`Trimming to ${maxDuration} seconds`)

    // Create a temporary directory for processing
    const tempDir = path.join(os.tmpdir(), "video-processing")
    await mkdir(tempDir, { recursive: true })

    // Simulate downloading the video
    const downloadedPath = path.join(tempDir, `${videoId}.mp4`)

    // Simulate processing with FFmpeg (in a real implementation, you would use actual FFmpeg commands)
    const outputPath = path.join(tempDir, outputFileName)

    // Return the path to the processed video
    // In a real implementation, you would upload this to a storage service and return the URL
    return `/videos/${outputFileName}`
  } catch (error) {
    console.error("Error processing YouTube video:", error)
    throw new Error("Failed to process YouTube video")
  }
}

// Function to extract captions/transcript from a YouTube video
export async function extractYouTubeTranscript(videoId: string): Promise<string> {
  try {
    console.log(`Extracting transcript for video: ${videoId}`)

    try {
      // Try to get the real transcript from YouTube
      console.log(`🔍 Attempting to fetch real transcript for video: ${videoId}`)
      
      // Try different language options
      const languages = ['en', 'en-US', 'en-GB']
      let transcript = null
      
      for (const lang of languages) {
        try {
          console.log(`🌐 Trying language: ${lang}`)
          transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang })
          if (transcript && transcript.length > 0) {
            console.log(`✅ Found transcript in ${lang}`)
            break
          }
        } catch (langError) {
          console.log(`❌ No transcript found in ${lang}`)
          continue
        }
      }
      
      // If no specific language worked, try without language specification
      if (!transcript || transcript.length === 0) {
        console.log(`🌍 Trying without specific language...`)
        try {
          transcript = await YoutubeTranscript.fetchTranscript(videoId)
        } catch (generalError) {
          console.log(`❌ No transcript found without language specification`)
        }
      }
      
      console.log(`📊 Transcript fetch result:`, {
        transcriptFound: !!transcript,
        transcriptLength: transcript?.length || 0,
        firstItem: transcript?.[0] || null
      })
      
      if (transcript && transcript.length > 0) {
        // Combine all transcript segments into a single string
        const fullTranscript = transcript
          .map((item: any) => item.text)
          .join(' ')
          .replace(/\s+/g, ' ') // Clean up multiple spaces
          .trim()

        // Print transcript to terminal for testing
        console.log(`\n=== ✅ REAL VIDEO TRANSCRIPT FOR ${videoId} ===`)
        console.log(`Content Length: ${fullTranscript.length} characters`)
        console.log(`\n--- TRANSCRIPT CONTENT ---`)
        console.log(fullTranscript.substring(0, 1000) + (fullTranscript.length > 1000 ? '...' : '')) // Show first 1000 chars
        console.log(`\n=== END REAL TRANSCRIPT ===\n`)

        return fullTranscript
      } else {
        console.warn(`❌ No transcript data found for video ${videoId}`)
      }
    } catch (transcriptError) {
      console.error(`❌ Failed to get real transcript for ${videoId}:`, {
        error: transcriptError instanceof Error ? transcriptError.message : 'Unknown error',
        stack: transcriptError instanceof Error ? transcriptError.stack : undefined
      })
      
      // Fallback to simulated transcript
      console.log("🔄 Falling back to simulated transcript...")
    }

    // Fallback: Generate a detailed simulated transcript based on the video ID
    const topics = [
      {
        name: "climate change",
        transcript: `Climate change represents one of the most pressing challenges of our time. The Earth's climate system is warming at an unprecedented rate due to human activities, particularly the emission of greenhouse gases like carbon dioxide and methane. Scientific evidence shows that global temperatures have risen by approximately 1.1 degrees Celsius since pre-industrial times. This warming is causing dramatic changes in weather patterns, including more frequent extreme weather events such as hurricanes, droughts, and floods. The Arctic ice sheets are melting at alarming rates, contributing to rising sea levels that threaten coastal communities worldwide. To address this crisis, we need immediate action on multiple fronts: transitioning to renewable energy sources, improving energy efficiency, protecting and restoring forests, and implementing carbon pricing mechanisms. Individual actions also matter - from reducing energy consumption to choosing sustainable transportation options. The Paris Agreement represents a global commitment to limiting warming to well below 2 degrees Celsius, but achieving this goal requires unprecedented cooperation and rapid transformation of our energy systems.`
      },
      {
        name: "artificial intelligence",
        transcript: `Artificial Intelligence, or AI, is revolutionizing nearly every aspect of our lives and work. At its core, AI involves creating computer systems that can perform tasks typically requiring human intelligence, such as learning, reasoning, problem-solving, and decision-making. Machine learning, a subset of AI, enables computers to learn and improve from experience without being explicitly programmed for every task. Deep learning, inspired by the human brain's neural networks, has led to breakthrough applications in image recognition, natural language processing, and autonomous systems. Today, AI powers recommendation systems on streaming platforms, enables voice assistants like Siri and Alexa, and drives autonomous vehicles. In healthcare, AI helps diagnose diseases more accurately and develop new treatments. However, the rapid advancement of AI also raises important ethical considerations about job displacement, privacy, bias in algorithms, and the need for responsible development. As AI becomes more sophisticated, it's crucial that we develop frameworks for ensuring these technologies benefit all of humanity while mitigating potential risks.`
      },
      {
        name: "sustainable development",
        transcript: `Sustainable development is about meeting the needs of the present without compromising the ability of future generations to meet their own needs. This concept encompasses three interconnected pillars: economic growth, social inclusion, and environmental protection. The United Nations' 17 Sustainable Development Goals provide a comprehensive framework for addressing global challenges including poverty, inequality, climate change, environmental degradation, peace, and justice. Achieving sustainability requires a fundamental shift in how we produce and consume goods, manage natural resources, and structure our economies. Circular economy principles, which emphasize reducing waste and reusing materials, are becoming increasingly important. Renewable energy technologies like solar and wind power are now cost-competitive with fossil fuels in many regions. Sustainable agriculture practices can feed growing populations while protecting biodiversity and soil health. Cities play a crucial role, as they consume 78% of global energy and produce 60% of greenhouse gas emissions. Smart urban planning, green buildings, and sustainable transportation systems are essential for creating livable, resilient communities. Education and awareness are also vital for empowering individuals and communities to make sustainable choices.`
      }
    ]

    // Use the video ID to deterministically select a topic
    const topicIndex = videoId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % topics.length
    const selectedTopic = topics[topicIndex]

    // Print simulated transcript to terminal for testing
    console.log(`\n=== SIMULATED VIDEO TRANSCRIPT FOR ${videoId} ===`)
    console.log(`Topic: ${selectedTopic.name.toUpperCase()}`)
    console.log(`Content Length: ${selectedTopic.transcript.length} characters`)
    console.log(`\n--- TRANSCRIPT CONTENT ---`)
    console.log(selectedTopic.transcript)
    console.log(`\n=== END TRANSCRIPT ===\n`)

    return selectedTopic.transcript
  } catch (error) {
    console.error("Error extracting YouTube transcript:", error)
    return "Transcript unavailable"
  }
}

// Function to extract captions/transcript from a YouTube video up to a specific duration
export async function extractYouTubeTranscriptForDuration(videoId: string, maxDurationSeconds: number): Promise<string> {
  console.log(`Extracting transcript for video: ${videoId} (max duration: ${maxDurationSeconds}s)`)

  // Try to get the real transcript from YouTube
  console.log(`🔍 Attempting to fetch real transcript for video: ${videoId}`)
  
  // Try different language options
  const languages = ['en', 'en-US', 'en-GB']
  let transcript = null
  
  for (const lang of languages) {
    try {
      console.log(`🌐 Trying language: ${lang}`)
      transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang })
      if (transcript && transcript.length > 0) {
        console.log(`✅ Found transcript in ${lang}`)
        break
      }
    } catch (langError) {
      console.log(`❌ No transcript found in ${lang}`)
      continue
    }
  }
  
  // If no specific language worked, try without language specification
  if (!transcript || transcript.length === 0) {
    console.log(`🌍 Trying without specific language...`)
    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId)
    } catch (generalError) {
      console.log(`❌ No transcript found without language specification`)
    }
  }
    console.log(`📊 Transcript fetch result:`, {
    transcriptFound: !!transcript,
    transcriptLength: transcript?.length || 0,
    firstItem: transcript?.[0] || null
  })
  
  // If no real transcript found, fallback to simulated transcript
  if (!transcript || transcript.length === 0) {
    console.log(`⚠️ No real transcript found, falling back to simulated content...`)
    
    // Get simulated transcript from the main function
    const fullSimulatedTranscript = await extractYouTubeTranscript(videoId)
    
    if (fullSimulatedTranscript === "Transcript unavailable") {
      const errorMessage = `❌ Failed to extract transcript for video ${videoId}. No transcript available for the required watch time of ${maxDurationSeconds} seconds.`
      console.error(errorMessage)
      throw new Error(errorMessage)
    }
    
    // For simulated transcript, estimate word timing and return appropriate portion
    const words = fullSimulatedTranscript.split(' ')
    const avgWordsPerSecond = 2.5 // Average speaking rate
    const maxWords = Math.ceil(maxDurationSeconds * avgWordsPerSecond)
    const limitedSimulatedTranscript = words.slice(0, maxWords).join(' ')
    
    console.log(`✅ Using simulated transcript: ${limitedSimulatedTranscript.length} characters (estimated ${maxDurationSeconds}s)`)
    console.log(`\n=== SIMULATED LIMITED TRANSCRIPT FOR ${videoId} (${maxDurationSeconds}s) ===`)
    console.log(limitedSimulatedTranscript.substring(0, 500) + (limitedSimulatedTranscript.length > 500 ? '...' : ''))
    console.log(`=== END SIMULATED LIMITED TRANSCRIPT ===\n`)
    
    return limitedSimulatedTranscript
  }
  // Filter transcript segments that fall within the specified duration
  let cumulativeTime = 0
  const filteredTranscript: any[] = []
  
  console.log(`🔍 Processing ${transcript.length} transcript segments for ${maxDurationSeconds}s limit`)
  
  for (let i = 0; i < transcript.length; i++) {
    const item = transcript[i]
    
    // Calculate segment duration more reliably
    let segmentDuration = 0
    
    if (typeof item.duration === 'number' && item.duration > 0) {
      segmentDuration = item.duration
    } else if (typeof item.duration === 'string' && parseFloat(item.duration) > 0) {
      segmentDuration = parseFloat(item.duration)
    } else if (item.offset !== undefined && i < transcript.length - 1) {
      // Use offset difference for duration calculation
      const currentOffset = (item.offset || 0) / 1000
      const nextOffset = (transcript[i + 1].offset || 0) / 1000
      segmentDuration = Math.max(0.1, nextOffset - currentOffset) // Minimum 0.1s per segment
    } else {
      // Default segment duration if no other info available
      segmentDuration = 2.0 // Assume 2 seconds per segment as default
    }
    
    // Include segment if we haven't exceeded the time limit
    if (cumulativeTime < maxDurationSeconds) {
      filteredTranscript.push(item)
      console.log(`📝 Segment ${i}: "${item.text?.substring(0, 50)}..." (${segmentDuration}s) - Total: ${cumulativeTime}s`)
    }
    
    cumulativeTime += segmentDuration
    
    // Stop if we've exceeded the time limit significantly
    if (cumulativeTime > maxDurationSeconds + 5) {
      break
    }
  }
  console.log(`⏰ Filtering result: ${filteredTranscript.length} segments from ${transcript.length} total, estimated time=${cumulativeTime.toFixed(1)}s (limit=${maxDurationSeconds}s)`)
  
  // If no segments found, use a more lenient approach
  if (filteredTranscript.length === 0) {
    console.log(`⚠️ No segments found with time filtering, using first few segments as fallback`)
    // Take at least the first 3 segments or 10% of total, whichever is larger
    const fallbackCount = Math.max(3, Math.ceil(transcript.length * 0.1))
    for (let i = 0; i < Math.min(fallbackCount, transcript.length); i++) {
      filteredTranscript.push(transcript[i])
    }
    console.log(`📄 Fallback: Using first ${filteredTranscript.length} segments`)
  }
  // Combine filtered transcript segments into a single string
  const limitedTranscript = filteredTranscript
    .map((item: any) => item.text || '')
    .filter(text => text.trim().length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Check if the limited transcript has meaningful content
  if (!limitedTranscript || limitedTranscript.length < 5) {
    console.log(`⚠️ Very short transcript content (${limitedTranscript.length} chars), using more segments`)
    
    // If content is too short, take more segments
    const extraSegments = Math.min(10, transcript.length)
    const expandedTranscript = transcript
      .slice(0, extraSegments)
      .map((item: any) => item.text || '')
      .filter(text => text.trim().length > 0)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    if (expandedTranscript.length < 5) {
      const errorMessage = `❌ Video ${videoId} has insufficient transcript content. Total available: ${expandedTranscript.length} characters.`
      console.error(errorMessage)
      throw new Error(errorMessage)
    }
    
    console.log(`✅ Using expanded transcript: ${expandedTranscript.length} characters from ${extraSegments} segments`)
    return expandedTranscript
  }

  // Print limited transcript to terminal for testing
  console.log(`\n=== ✅ LIMITED REAL VIDEO TRANSCRIPT FOR ${videoId} (${maxDurationSeconds}s) ===`)
  console.log(`Content Length: ${limitedTranscript.length} characters`)
  console.log(`Segments Used: ${filteredTranscript.length}/${transcript.length}`)
  console.log(`\n--- LIMITED TRANSCRIPT CONTENT ---`)
  console.log(limitedTranscript.substring(0, 1000) + (limitedTranscript.length > 1000 ? '...' : ''))
  console.log(`\n=== END LIMITED TRANSCRIPT ===\n`)

  return limitedTranscript
}
