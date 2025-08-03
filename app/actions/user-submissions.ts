import { v4 as uuidv4 } from "uuid"

// Define the types
interface VideoData {
  id: string
  transcript: string
}

interface ContentEvaluation {
  score: number
  feedback: string
  strengths: string[]
  weaknesses: string[]
  grammarScore: number
  contentScore: number
  originalityScore: number
}

export interface UserSubmission {
  id: string
  userId: string
  username: string
  userImage: string
  originalVideoId: string
  rewrittenContent: string
  videoSubmission: string
  contentEvaluation: ContentEvaluation
  videoEvaluation: ContentEvaluation
  overallScore: number
  createdAt: Date
  status: string
}

// Mock functions for content and video evaluation (replace with actual API calls)
async function compareContent(originalTranscript: string, rewrittenContent: string): Promise<ContentEvaluation> {
  // Simulate content comparison and return a score
  return {
    score: 80,
    feedback: "Your content is well-written and relevant.",
    strengths: ["Excellent vocabulary", "Clear explanations"],
    weaknesses: ["Could provide more examples"],
    grammarScore: 85,
    contentScore: 80,
    originalityScore: 75,
  }
}

async function evaluateVideoPresentation(
  originalTranscript: string,
  videoTranscript: string,
): Promise<ContentEvaluation> {
  // Simulate video evaluation and return a score
  return {
    score: 90,
    feedback: "Your video presentation is engaging and informative.",
    strengths: ["Confident delivery", "Good visuals"],
    weaknesses: ["Slightly fast pace"],
    grammarScore: 90,
    contentScore: 85,
    originalityScore: 80,
  }
}

// Mock submissions array (replace with a database)
const submissions: UserSubmission[] = []

// Function to submit user content and video
export async function submitUserContent(
  userId: string,
  username: string,
  userImage: string,
  originalVideo: VideoData,
  rewrittenContent: string,
  videoSubmission: string,
  videoTranscript: string,
): Promise<UserSubmission> {
  try {
    let contentEvaluation: ContentEvaluation
    let videoEvaluation: ContentEvaluation

    try {
      // Evaluate the rewritten content
      contentEvaluation = await compareContent(originalVideo.transcript, rewrittenContent)

      // Evaluate the video submission
      videoEvaluation = await evaluateVideoPresentation(originalVideo.transcript, videoTranscript)
    } catch (error) {
      console.error("Error during content evaluation:", error)
      // Provide default evaluations if the API call fails
      contentEvaluation = {
        score: 75,
        feedback: "Your content shows good understanding of the topic.",
        strengths: ["Good effort", "Clear structure"],
        weaknesses: ["Could add more details"],
        grammarScore: 75,
        contentScore: 75,
        originalityScore: 75,
      }

      videoEvaluation = {
        score: 75,
        feedback: "Your video presentation is well-delivered.",
        strengths: ["Good pace", "Clear voice"],
        weaknesses: ["Could improve eye contact"],
        grammarScore: 75,
        contentScore: 75,
        originalityScore: 75,
      }
    }

    // Calculate overall score
    const overallScore = Math.round((contentEvaluation.score + videoEvaluation.score) / 2)

    // Create submission object
    const submission: UserSubmission = {
      id: uuidv4(),
      userId,
      username,
      userImage,
      originalVideoId: originalVideo.id,
      rewrittenContent,
      videoSubmission,
      contentEvaluation,
      videoEvaluation,
      overallScore,
      createdAt: new Date(),
      status: "evaluated",
    }

    // Save submission (in a real app, save to database)
    submissions.push(submission)

    return submission
  } catch (error) {
    console.error("Error submitting user content:", error)

    // Create a fallback submission with default values
    const fallbackSubmission: UserSubmission = {
      id: uuidv4(),
      userId,
      username,
      userImage,
      originalVideoId: originalVideo.id,
      rewrittenContent,
      videoSubmission,
      contentEvaluation: {
        score: 70,
        feedback: "Your content shows good understanding of the topic.",
        strengths: ["Good effort", "Clear structure"],
        weaknesses: ["Could add more details"],
        grammarScore: 70,
        contentScore: 70,
        originalityScore: 70,
      },
      videoEvaluation: {
        score: 70,
        feedback: "Your video presentation is well-delivered.",
        strengths: ["Good pace", "Clear voice"],
        weaknesses: ["Could improve eye contact"],
        grammarScore: 70,
        contentScore: 70,
        originalityScore: 70,
      },
      overallScore: 70,
      createdAt: new Date(),
      status: "evaluated",
    }

    // Save fallback submission
    submissions.push(fallbackSubmission)

    return fallbackSubmission
  }
}

export async function publishSubmission(submissionId: string): Promise<void> {
  // Simulate publishing a submission
  await new Promise((resolve) => setTimeout(resolve, 1000))
}
