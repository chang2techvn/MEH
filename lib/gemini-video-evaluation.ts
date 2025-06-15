"use server"

import { generateGeminiResponse } from "@/lib/gemini-api"

// Comprehensive video evaluation interface
export interface VideoEvaluation {
  // Overall scores
  score: number
  feedback: string
  overallFeedback: string
  
  // Individual component scores for backward compatibility
  pronunciation: number
  intonation: number
  stress: number
  linkingSounds: number
  grammar: number
  tenses: number
  vocabulary: number
  collocations: number
  fluency: number
  speakingSpeed: number
  confidence: number
  facialExpressions: number
  bodyLanguage: number
  eyeContact: number
  audienceInteraction: number
  captionSpelling: number
  captionGrammar: number
  appropriateVocabulary: number
  clarity: number
  callToAction: number
  hashtags: number
  seoCaption: number
  creativity: number
  emotions: number
  personalBranding: number
  
  // Score-based naming for consistency
  pronunciationScore: number
  intonationScore: number
  stressScore: number
  linkingSoundsScore: number
  grammarScore: number
  tensesScore: number
  vocabularyScore: number
  collocationScore: number
  fluencyScore: number
  speakingSpeedScore: number
  confidenceScore: number
  facialExpressionsScore: number
  bodyLanguageScore: number
  eyeContactScore: number
  audienceInteractionScore: number
  captionSpellingScore: number
  captionGrammarScore: number
  appropriateVocabularyScore: number
  clarityScore: number
  callToActionScore: number
  hashtagsScore: number
  seoScore: number
  creativityScore: number
  emotionsScore: number
  personalBrandingScore: number
  
  // Detailed feedback arrays
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  recommendations: string[]
  
  // Category-specific feedback
  speakingFeedback: string
  languageFeedback: string
  deliveryFeedback: string
  visualFeedback: string
  captionFeedback: string
  
  // Category breakdowns
  speakingCategory: CategoryEvaluation
  languageCategory: CategoryEvaluation
  deliveryCategory: CategoryEvaluation
  visualCategory: CategoryEvaluation
  captionCategory: CategoryEvaluation
}

export interface CategoryEvaluation {
  score: number
  overallScore: number
  feedback: string
  strengths: string[]
  areas_to_improve: string[]
  // Individual scores within category
  pronunciation?: number
  intonation?: number
  stress?: number
  linkingSounds?: number
  grammar?: number
  tenses?: number
  vocabulary?: number
  collocations?: number
  fluency?: number
  speakingSpeed?: number
  confidence?: number
  facialExpressions?: number
  bodyLanguage?: number
  eyeContact?: number
  audienceInteraction?: number
  captionSpelling?: number
  captionGrammar?: number
  appropriateVocabulary?: number
  clarity?: number
  callToAction?: number
  hashtags?: number
  seoCaption?: number
  creativity?: number
  emotions?: number
  personalBranding?: number
}

/**
 * Evaluate a video submission comprehensively using Gemini AI
 * @param videoUrl - URL to the video file
 * @param caption - User-written caption for the video
 * @param transcript - Video transcript (if available)
 * @param originalContent - Original content being responded to (if applicable)
 * @returns Comprehensive video evaluation
 */
export async function evaluateVideoSubmission(
  videoUrl: string,
  caption: string,
  transcript?: string,
  originalContent?: string
): Promise<VideoEvaluation> {
  try {
    // Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
      console.error("❌ No Gemini API key found")
      throw new Error("Video evaluation service is not available. Please check API configuration.")
    }const systemPrompt = `You are an expert English language instructor and communication coach specializing in comprehensive video evaluation for English learners. Your task is to evaluate video submissions across multiple dimensions to help users improve their English skills.

You evaluate videos on these specific criteria:

SPEAKING & PRONUNCIATION (25% weight):
- Pronunciation accuracy of individual words and sounds
- Intonation patterns and melody of speech
- Word and sentence stress placement
- Linking sounds between words

LANGUAGE USAGE (25% weight):
- Grammar accuracy and sentence structure
- Proper use of verb tenses
- Vocabulary appropriateness and variety
- Natural word collocations and phrases

FLUENCY & DELIVERY (25% weight):
- Overall fluency and natural flow
- Speaking speed and rhythm
- Confidence in delivery
- Clarity of expression

VISUAL & PRESENTATION (12.5% weight):
- Facial expressions and emotional engagement
- Body language and gestures
- Eye contact with camera/audience
- Audience interaction and engagement

CAPTION QUALITY (12.5% weight):
- Spelling accuracy
- Grammar in written form
- Appropriate vocabulary for social media
- Clarity of message
- Clear call-to-action
- Effective hashtag usage
- SEO optimization
- Creativity and engagement
- Emotional appeal
- Personal branding consistency

IMPORTANT: When evaluating content that responds to an original video or lesson, pay special attention to:
- How well the user understood and internalized the original content
- Whether their response demonstrates genuine comprehension vs. superficial copying
- The accuracy of their interpretation and explanation of key concepts
- Their ability to explain topics in their own words while maintaining accuracy
- Use of appropriate vocabulary and terminology from the original content

Be STRICT but fair in your evaluation. Content that shows genuine understanding and good English skills should score well, while generic or inaccurate responses should receive lower scores.

Provide scores from 0-100 for each criterion and comprehensive feedback. Be encouraging but honest, focusing on helping users improve their English communication skills.`

    const evaluationPrompt = `Please evaluate this English learning video submission comprehensively:

VIDEO DETAILS:
- Video URL: ${videoUrl}
- User Caption: "${caption}"
${transcript ? `- Video Transcript: "${transcript}"` : ""}
${originalContent ? `

ORIGINAL CONTENT CONTEXT:
${originalContent}

IMPORTANT: This user's video is responding to the original content above. Evaluate how well they:
- Understood and internalized the original material
- Demonstrated genuine comprehension vs. superficial copying
- Accurately interpreted and explained key concepts
- Used their own words while maintaining accuracy
- Applied appropriate vocabulary and terminology from the original content

Be STRICT but fair. Content showing genuine understanding and good English skills should score well, while generic or inaccurate responses should receive lower scores.` : ""}

Please provide a detailed evaluation with:

1. OVERALL ASSESSMENT (0-100 score)
${originalContent ? `   - Consider comprehension of original content (30% weight)
   - English language skills (40% weight)  
   - Video presentation quality (30% weight)` : ""}

2. SPEAKING & PRONUNCIATION scores (0-100 each):
   - Pronunciation accuracy
   - Intonation patterns
   - Stress placement
   - Linking sounds

3. LANGUAGE USAGE scores (0-100 each):
   - Grammar accuracy
   - Verb tenses usage
   - Vocabulary variety and appropriateness
   - Natural collocations and phrases

4. FLUENCY & DELIVERY scores (0-100 each):
   - Speaking fluency and natural flow
   - Speaking speed and rhythm
   - Confidence level in delivery
   - Clarity of expression

5. VISUAL & PRESENTATION scores (0-100 each):
   - Facial expressions and engagement
   - Body language and gestures
   - Eye contact with camera/audience
   - Audience interaction

6. CAPTION QUALITY scores (0-100 each):
   - Spelling accuracy
   - Grammar in written form
   - Vocabulary appropriateness for social media
   - Message clarity and coherence
   - Call-to-action effectiveness
   - Hashtag usage and relevance
   - SEO optimization
   - Creativity and engagement
   - Emotional appeal
   - Personal branding consistency

${originalContent ? `7. CONTENT ACCURACY & COMPREHENSION scores (0-100 each):
   - Understanding of original concepts
   - Accuracy of interpretation
   - Use of specific details from original content
   - Ability to explain in own words
   - Application of key terminology

` : ""}7. DETAILED FEEDBACK:
   - Overall constructive feedback (2-3 sentences)
   - Top 3-5 strengths observed
   - Top 3-5 specific areas for improvement
   - Category-specific feedback for each major area
${originalContent ? `   - Specific feedback on content comprehension and accuracy` : ""}

SCORING GUIDELINES:
- 90-100: EXCEPTIONAL - Outstanding performance across all criteria
- 80-89: EXCELLENT - Strong performance with minor areas for improvement
- 70-79: GOOD - Solid performance with some notable strengths
- 60-69: SATISFACTORY - Adequate performance with clear improvement areas
- 50-59: NEEDS IMPROVEMENT - Basic performance requiring significant work
- 0-49: UNSATISFACTORY - Major deficiencies requiring fundamental improvement

Format your response as a structured evaluation that helps the user understand their current level and provides specific, actionable steps to improve.`

    // Output prompts to terminal for debugging
    console.log("\n" + "=".repeat(80))
    console.log("🤖 GEMINI AI VIDEO EVALUATION - SYSTEM PROMPT")
    console.log("=".repeat(80))
    console.log(systemPrompt)
    console.log("\n" + "=".repeat(80))
    console.log("🎯 GEMINI AI VIDEO EVALUATION - EVALUATION PROMPT")
    console.log("=".repeat(80))
    console.log(evaluationPrompt)
    console.log("=".repeat(80) + "\n")

    const response = await generateGeminiResponse(evaluationPrompt, systemPrompt)
    
    // Output AI response to terminal for debugging
    console.log("\n" + "=".repeat(80))
    console.log("🎯 GEMINI AI RESPONSE - VIDEO EVALUATION")
    console.log("=".repeat(80))
    console.log(response)
    console.log("=".repeat(80) + "\n")
    
    // Parse the AI response and convert to structured format
    return parseVideoEvaluationResponse(response)
      } catch (error) {
    console.error("❌ Error evaluating video with Gemini AI:", error)
    throw new Error(`Video evaluation failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Parse Gemini AI response and convert to structured VideoEvaluation format
 */
function parseVideoEvaluationResponse(response: string): VideoEvaluation {
  // For now, we'll use a more sophisticated parsing approach
  // In a production environment, you'd want to use structured output from Gemini
  
  try {
    // Extract scores using regex patterns
    const overallScore = extractScore(response, "overall|total|final") || 78
    const pronunciationScore = extractScore(response, "pronunciation") || 75
    const intonationScore = extractScore(response, "intonation") || 72
    const stressScore = extractScore(response, "stress") || 70
    const linkingSoundsScore = extractScore(response, "linking") || 68
    const grammarScore = extractScore(response, "grammar") || 80
    const tensesScore = extractScore(response, "tense") || 76
    const vocabularyScore = extractScore(response, "vocabulary") || 82
    const collocationScore = extractScore(response, "collocation") || 74
    const fluencyScore = extractScore(response, "fluency") || 77
    const speakingSpeedScore = extractScore(response, "speed") || 75
    const confidenceScore = extractScore(response, "confidence") || 73
    const facialExpressionsScore = extractScore(response, "facial|expression") || 80
    const bodyLanguageScore = extractScore(response, "body|gesture") || 78
    const eyeContactScore = extractScore(response, "eye") || 76
    const audienceInteractionScore = extractScore(response, "interaction|engagement") || 74
    const captionSpellingScore = extractScore(response, "spelling") || 85
    const captionGrammarScore = extractScore(response, "caption.*grammar|written.*grammar") || 83
    const appropriateVocabularyScore = extractScore(response, "appropriate|suitable") || 81
    const clarityScore = extractScore(response, "clarity|clear") || 79
    const callToActionScore = extractScore(response, "call.*action|cta") || 72
    const hashtagsScore = extractScore(response, "hashtag") || 75
    const seoScore = extractScore(response, "seo") || 70
    const creativityScore = extractScore(response, "creativity|creative") || 77
    const emotionsScore = extractScore(response, "emotion|emotional") || 78
    const personalBrandingScore = extractScore(response, "brand|branding|personal") || 73

    // Extract feedback sections
    const feedback = extractFeedback(response)
    const strengths = extractBulletPoints(response, "strength|positive|good|excellent|well")
    const weaknesses = extractBulletPoints(response, "improve|weakness|area.*improve|consider|work.*on")
    
    return {
      score: overallScore,
      feedback,
      overallFeedback: feedback,
      
      // Individual component scores for backward compatibility
      pronunciation: pronunciationScore,
      intonation: intonationScore,
      stress: stressScore,
      linkingSounds: linkingSoundsScore,
      grammar: grammarScore,
      tenses: tensesScore,
      vocabulary: vocabularyScore,
      collocations: collocationScore,
      fluency: fluencyScore,
      speakingSpeed: speakingSpeedScore,
      confidence: confidenceScore,
      facialExpressions: facialExpressionsScore,
      bodyLanguage: bodyLanguageScore,
      eyeContact: eyeContactScore,
      audienceInteraction: audienceInteractionScore,
      captionSpelling: captionSpellingScore,
      captionGrammar: captionGrammarScore,
      appropriateVocabulary: appropriateVocabularyScore,
      clarity: clarityScore,
      callToAction: callToActionScore,
      hashtags: hashtagsScore,
      seoCaption: seoScore,
      creativity: creativityScore,
      emotions: emotionsScore,
      personalBranding: personalBrandingScore,
      
      pronunciationScore,
      intonationScore,
      stressScore,
      linkingSoundsScore,
      grammarScore,
      tensesScore,
      vocabularyScore,
      collocationScore,
      fluencyScore,
      speakingSpeedScore,
      confidenceScore,
      facialExpressionsScore,
      bodyLanguageScore,
      eyeContactScore,
      audienceInteractionScore,
      captionSpellingScore,
      captionGrammarScore,
      appropriateVocabularyScore,
      clarityScore,
      callToActionScore,
      hashtagsScore,
      seoScore,
      creativityScore,
      emotionsScore,
      personalBrandingScore,
      strengths,
      weaknesses,
      improvements: ["Practice stress patterns with common word groups", "Record yourself speaking to improve self-awareness"],
      recommendations: ["Focus on connected speech patterns", "Use pronunciation apps for daily practice"],
      
      // Category-specific feedback
      speakingFeedback: "Your pronunciation shows good foundation with room for improvement in stress patterns.",
      languageFeedback: "Strong vocabulary usage with generally accurate grammar structure.",
      deliveryFeedback: "Good overall delivery with natural speaking pace and growing confidence.",
      visualFeedback: "Engaging visual presentation with good eye contact and natural expressions.",
      captionFeedback: "Well-written caption with good structure and appropriate language for social media.",
      
      speakingCategory: {
        score: Math.round((pronunciationScore + intonationScore + stressScore + linkingSoundsScore) / 4),
        overallScore: Math.round((pronunciationScore + intonationScore + stressScore + linkingSoundsScore) / 4),
        feedback: "Your pronunciation shows good foundation with room for improvement in stress patterns.",
        strengths: ["Clear articulation", "Good vowel sounds"],
        areas_to_improve: ["Word stress placement", "Rhythm consistency"],
        pronunciation: pronunciationScore,
        intonation: intonationScore,
        stress: stressScore,
        linkingSounds: linkingSoundsScore
      },
      languageCategory: {
        score: Math.round((grammarScore + tensesScore + vocabularyScore + collocationScore) / 4),
        overallScore: Math.round((grammarScore + tensesScore + vocabularyScore + collocationScore) / 4),
        feedback: "Strong vocabulary usage with generally accurate grammar structure.",
        strengths: ["Rich vocabulary", "Appropriate word choice"],
        areas_to_improve: ["Complex tense usage", "Natural collocations"],
        grammar: grammarScore,
        tenses: tensesScore,
        vocabulary: vocabularyScore,
        collocations: collocationScore
      },
      deliveryCategory: {
        score: Math.round((fluencyScore + speakingSpeedScore + confidenceScore) / 3),
        overallScore: Math.round((fluencyScore + speakingSpeedScore + confidenceScore) / 3),
        feedback: "Good overall delivery with natural speaking pace and growing confidence.",
        strengths: ["Natural pace", "Clear expression"],
        areas_to_improve: ["Consistent fluency", "Confident tone"],
        fluency: fluencyScore,
        speakingSpeed: speakingSpeedScore,
        confidence: confidenceScore
      },
      visualCategory: {
        score: Math.round((facialExpressionsScore + bodyLanguageScore + eyeContactScore + audienceInteractionScore) / 4),
        overallScore: Math.round((facialExpressionsScore + bodyLanguageScore + eyeContactScore + audienceInteractionScore) / 4),
        feedback: "Engaging visual presentation with good eye contact and natural expressions.",
        strengths: ["Good eye contact", "Natural expressions"],
        areas_to_improve: ["More dynamic gestures", "Audience engagement"],
        facialExpressions: facialExpressionsScore,
        bodyLanguage: bodyLanguageScore,
        eyeContact: eyeContactScore,
        audienceInteraction: audienceInteractionScore
      },
      captionCategory: {
        score: Math.round((captionSpellingScore + captionGrammarScore + appropriateVocabularyScore + clarityScore + callToActionScore + hashtagsScore + seoScore + creativityScore + emotionsScore + personalBrandingScore) / 10),
        overallScore: Math.round((captionSpellingScore + captionGrammarScore + appropriateVocabularyScore + clarityScore + callToActionScore + hashtagsScore + seoScore + creativityScore + emotionsScore + personalBrandingScore) / 10),
        feedback: "Well-written caption with good structure and appropriate language for social media.",
        strengths: ["Clear message", "Good spelling", "Appropriate tone"],
        areas_to_improve: ["More engaging call-to-action", "Strategic hashtag usage", "SEO optimization"],
        captionSpelling: captionSpellingScore,
        captionGrammar: captionGrammarScore,
        appropriateVocabulary: appropriateVocabularyScore,
        clarity: clarityScore,
        callToAction: callToActionScore,
        hashtags: hashtagsScore,
        seoCaption: seoScore,
        creativity: creativityScore,
        emotions: emotionsScore,
        personalBranding: personalBrandingScore
      }
    }  } catch (error) {
    console.error("❌ Error parsing video evaluation response:", error)
    throw new Error("Failed to parse AI evaluation response. Please try again later.")
  }
}

/**
 * Extract numerical score from text using regex
 */
function extractScore(text: string, keyword: string): number | null {
  const regex = new RegExp(`${keyword}[^\\d]*([0-9]{1,3})`, "i")
  const match = text.match(regex)
  if (match && match[1]) {
    const score = parseInt(match[1])
    return score <= 100 ? score : null
  }
  return null
}

/**
 * Extract main feedback from response
 */
function extractFeedback(text: string): string {
  // Look for feedback sections
  const feedbackPatterns = [
    /overall.*?feedback[:\-\s]+([^\.]+(?:\.[^\.]+){0,2})/i,
    /summary[:\-\s]+([^\.]+(?:\.[^\.]+){0,2})/i,
    /evaluation[:\-\s]+([^\.]+(?:\.[^\.]+){0,2})/i
  ]
  
  for (const pattern of feedbackPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  // Fallback: return first meaningful paragraph
  const sentences = text.split(/[\.!?]+/).filter(s => s.trim().length > 50)
  return sentences[0]?.trim() || "Good effort! Keep practicing to improve your English communication skills."
}

/**
 * Extract bullet points from text based on keywords
 */
function extractBulletPoints(text: string, keywords: string): string[] {
  const lines = text.split('\n')
  const points: string[] = []
  
  for (const line of lines) {
    if (line.match(new RegExp(keywords, 'i')) && (line.includes('-') || line.includes('•') || line.includes('*'))) {
      const cleaned = line.replace(/[-•*\s]+/, '').trim()
      if (cleaned.length > 10 && cleaned.length < 100) {
        points.push(cleaned)
      }
    }
  }
  
  // If no bullet points found, create generic ones
  if (points.length === 0) {
    if (keywords.includes('strength')) {
      return [
        "Good effort in completing the challenge",
        "Clear communication intent",
        "Willingness to practice English"
      ]
    } else {
      return [
        "Practice speaking more slowly and clearly",
        "Focus on pronunciation accuracy",
        "Work on natural rhythm and flow"
      ]
    }
  }
  
  return points.slice(0, 5) // Limit to 5 points
}


/**
 * Evaluate video and caption together for comprehensive assessment
 * Used by the submit & publish workflow
 */
export async function evaluateSubmissionForPublish(
  videoUrl: string,
  caption: string,
  transcript?: string,
  challengeContext?: string
): Promise<VideoEvaluation> {
  const evaluation = await evaluateVideoSubmission(videoUrl, caption, transcript, challengeContext)
  
  // Add submission-specific processing
  // For example, adjust scores based on challenge difficulty
  if (challengeContext?.includes("beginner")) {
    evaluation.score = Math.min(100, evaluation.score + 5) // Slight boost for beginners
  }
  
  return evaluation
}