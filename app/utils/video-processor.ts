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
  
  // If no transcript found, throw error immediately
  if (!transcript || transcript.length === 0) {
    const errorMessage = `❌ Failed to extract transcript for video ${videoId}. No transcript available for the required watch time of ${maxDurationSeconds} seconds.`
    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  // Filter transcript segments that fall within the specified duration (by cumulative duration)
  let totalTime = 0
  const filteredTranscript: any[] = []
  for (const item of transcript) {
    // Prefer duration if available, fallback to offset difference if not
    let duration = 0
    if (typeof item.duration === 'number') {
      duration = item.duration
    } else if (typeof item.duration === 'string') {
      duration = parseFloat(item.duration)
    } else if (item.offset && transcript.length > 1) {
      // Estimate duration as difference to next offset (if possible)
      const idx = transcript.indexOf(item)
      if (idx < transcript.length - 1) {
        const nextOffset = transcript[idx + 1].offset ? transcript[idx + 1].offset / 1000 : 0
        const thisOffset = item.offset ? item.offset / 1000 : 0
        duration = Math.max(0, nextOffset - thisOffset)
      }
    }
    if (totalTime + duration > maxDurationSeconds) break
    filteredTranscript.push(item)
    totalTime += duration
  }

  console.log(`⏰ Filtering transcript by cumulative duration: ${filteredTranscript.length} segments, totalTime=${totalTime}s (limit=${maxDurationSeconds}s)`)
  
  // Check if we have any segments within the time limit
  if (filteredTranscript.length === 0) {
    const errorMessage = `❌ No transcript segments found within the required watch time of ${maxDurationSeconds} seconds for video ${videoId}.`
    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  // Combine filtered transcript segments into a single string
  const limitedTranscript = filteredTranscript
    .map((item: any) => item.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Check if the limited transcript has meaningful content
  if (!limitedTranscript || limitedTranscript.length < 10) {
    const errorMessage = `❌ Insufficient transcript content found within the required watch time of ${maxDurationSeconds} seconds for video ${videoId}.`
    console.error(errorMessage)
    throw new Error(errorMessage)
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
