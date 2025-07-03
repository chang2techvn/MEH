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
   - Pronunciation: [score] - [brief comment]
   - Intonation: [score] - [brief comment] 
   - Stress: [score] - [brief comment]
   - Linking sounds: [score] - [brief comment]

3. LANGUAGE USAGE scores (0-100 each):
   - Grammar: [score] - [brief comment]
   - Tenses: [score] - [brief comment]
   - Vocabulary: [score] - [brief comment]
   - Collocations: [score] - [brief comment]

4. FLUENCY & DELIVERY scores (0-100 each):
   - Fluency: [score] - [brief comment]
   - Speaking speed: [score] - [brief comment]
   - Confidence: [score] - [brief comment]
   - Clarity: [score] - [brief comment]

5. VISUAL & PRESENTATION scores (0-100 each):
   - Facial expressions: [score] - [brief comment]
   - Body language: [score] - [brief comment]
   - Eye contact: [score] - [brief comment]
   - Audience interaction: [score] - [brief comment]

6. CAPTION QUALITY scores (0-100 each):
   - Spelling: [score] - [brief comment]
   - Grammar: [score] - [brief comment]
   - Vocabulary: [score] - [brief comment]
   - Clarity: [score] - [brief comment]
   - Call-to-action: [score] - [brief comment]
   - Hashtags: [score] - [brief comment]
   - SEO: [score] - [brief comment]
   - Creativity: [score] - [brief comment]
   - Emotions: [score] - [brief comment]
   - Personal branding: [score] - [brief comment]

${originalContent ? `7. CONTENT ACCURACY & COMPREHENSION scores (0-100 each):
   - Understanding: [score] - [brief comment]
   - Accuracy: [score] - [brief comment]
   - Use of details: [score] - [brief comment]
   - Own words: [score] - [brief comment]
   - Terminology: [score] - [brief comment]

` : ""}7. DETAILED FEEDBACK:
   - Overall assessment: [2-3 sentences describing overall performance]
   - Speaking feedback: [specific feedback on pronunciation and speaking]
   - Language feedback: [specific feedback on grammar and vocabulary]
   - Delivery feedback: [specific feedback on fluency and confidence]
   - Visual feedback: [specific feedback on presentation and body language]
   - Caption feedback: [specific feedback on written content]
   
8. STRENGTHS:
   - [List 3-5 specific strengths observed]
   
9. AREAS TO IMPROVE:
   - [List 3-5 specific areas needing improvement]

SCORING GUIDELINES:
- 90-100: EXCEPTIONAL - Outstanding performance across all criteria
- 80-89: EXCELLENT - Strong performance with minor areas for improvement
- 70-79: GOOD - Solid performance with some notable strengths
- 60-69: SATISFACTORY - Adequate performance with clear improvement areas
- 50-59: NEEDS IMPROVEMENT - Basic performance requiring significant work
- 0-49: UNSATISFACTORY - Major deficiencies requiring fundamental improvement

Format your response clearly with headers and specific scores as requested above.`

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
    // Extract scores using regex patterns - NO fallback values
    const overallScore = extractScore(response, "overall|total|final")
    const pronunciationScore = extractScore(response, "pronunciation")
    const intonationScore = extractScore(response, "intonation")
    const stressScore = extractScore(response, "stress")
    const linkingSoundsScore = extractScore(response, "linking")
    const grammarScore = extractScore(response, "grammar")
    const tensesScore = extractScore(response, "tense")
    const vocabularyScore = extractScore(response, "vocabulary")
    const collocationScore = extractScore(response, "collocation")
    const fluencyScore = extractScore(response, "fluency")
    const speakingSpeedScore = extractScore(response, "speed")
    const confidenceScore = extractScore(response, "confidence")
    const facialExpressionsScore = extractScore(response, "facial|expression")
    const bodyLanguageScore = extractScore(response, "body|gesture")
    const eyeContactScore = extractScore(response, "eye")
    const audienceInteractionScore = extractScore(response, "interaction|engagement")
    const captionSpellingScore = extractScore(response, "spelling")
    const captionGrammarScore = extractScore(response, "caption.*grammar|written.*grammar")
    const appropriateVocabularyScore = extractScore(response, "appropriate|suitable")
    const clarityScore = extractScore(response, "clarity|clear")
    const callToActionScore = extractScore(response, "call.*action|cta")
    const hashtagsScore = extractScore(response, "hashtag")
    const seoScore = extractScore(response, "seo")
    const creativityScore = extractScore(response, "creativity|creative")
    const emotionsScore = extractScore(response, "emotion|emotional")
    const personalBrandingScore = extractScore(response, "brand|branding|personal")

    // Validate that we got essential scores from AI
    if (!overallScore) {
      console.error("❌ Failed to parse overall score from AI response")
      console.error("AI Response:", response)
      throw new Error("Unable to parse overall score from AI response. Please ensure the AI provides a numerical overall score.")
    }

    console.log("✅ Successfully parsed AI evaluation scores:", {
      overall: overallScore,
      pronunciation: pronunciationScore || 0,
      grammar: grammarScore || 0,
      fluency: fluencyScore || 0
    })

    // Extract feedback sections from AI response
    const feedback = extractFeedback(response)
    const strengths = extractBulletPoints(response, "strength|positive|good|excellent|well")
    const weaknesses = extractBulletPoints(response, "improve|weakness|area.*improve|consider|work.*on")
    
    if (!feedback || feedback.trim().length === 0) {
      console.error("❌ Failed to extract feedback from AI response")
      throw new Error("Unable to extract feedback from AI response")
    }

    console.log("✅ Successfully extracted AI feedback:", feedback.substring(0, 100) + "...")
    console.log("✅ Extracted strengths:", strengths)
    console.log("✅ Extracted weaknesses:", weaknesses)
    
    return {
      score: overallScore,
      feedback,
      overallFeedback: feedback,
      
      // Individual component scores for backward compatibility
      pronunciation: pronunciationScore || 0,
      intonation: intonationScore || 0,
      stress: stressScore || 0,
      linkingSounds: linkingSoundsScore || 0,
      grammar: grammarScore || 0,
      tenses: tensesScore || 0,
      vocabulary: vocabularyScore || 0,
      collocations: collocationScore || 0,
      fluency: fluencyScore || 0,
      speakingSpeed: speakingSpeedScore || 0,
      confidence: confidenceScore || 0,
      facialExpressions: facialExpressionsScore || 0,
      bodyLanguage: bodyLanguageScore || 0,
      eyeContact: eyeContactScore || 0,
      audienceInteraction: audienceInteractionScore || 0,
      captionSpelling: captionSpellingScore || 0,
      captionGrammar: captionGrammarScore || 0,
      appropriateVocabulary: appropriateVocabularyScore || 0,
      clarity: clarityScore || 0,
      callToAction: callToActionScore || 0,
      hashtags: hashtagsScore || 0,
      seoCaption: seoScore || 0,
      creativity: creativityScore || 0,
      emotions: emotionsScore || 0,
      personalBranding: personalBrandingScore || 0,
      
      pronunciationScore: pronunciationScore || 0,
      intonationScore: intonationScore || 0,
      stressScore: stressScore || 0,
      linkingSoundsScore: linkingSoundsScore || 0,
      grammarScore: grammarScore || 0,
      tensesScore: tensesScore || 0,
      vocabularyScore: vocabularyScore || 0,
      collocationScore: collocationScore || 0,
      fluencyScore: fluencyScore || 0,
      speakingSpeedScore: speakingSpeedScore || 0,
      confidenceScore: confidenceScore || 0,
      facialExpressionsScore: facialExpressionsScore || 0,
      bodyLanguageScore: bodyLanguageScore || 0,
      eyeContactScore: eyeContactScore || 0,
      audienceInteractionScore: audienceInteractionScore || 0,
      captionSpellingScore: captionSpellingScore || 0,
      captionGrammarScore: captionGrammarScore || 0,
      appropriateVocabularyScore: appropriateVocabularyScore || 0,
      clarityScore: clarityScore || 0,
      callToActionScore: callToActionScore || 0,
      hashtagsScore: hashtagsScore || 0,
      seoScore: seoScore || 0,
      creativityScore: creativityScore || 0,
      emotionsScore: emotionsScore || 0,
      personalBrandingScore: personalBrandingScore || 0,
      strengths: strengths.length > 0 ? strengths : [],
      weaknesses: weaknesses.length > 0 ? weaknesses : [],
      improvements: weaknesses.length > 0 ? weaknesses : [], // Use AI-extracted weaknesses as improvements
      recommendations: strengths.length > 0 ? strengths : [], // Use AI-extracted strengths as recommendations
      
      // Category-specific feedback extracted from AI response
      speakingFeedback: extractCategoryFeedback(response, "speaking|pronunciation") || "",
      languageFeedback: extractCategoryFeedback(response, "language|grammar|vocabulary") || "",
      deliveryFeedback: extractCategoryFeedback(response, "delivery|fluency|confidence") || "",
      visualFeedback: extractCategoryFeedback(response, "visual|presentation|body") || "",
      captionFeedback: extractCategoryFeedback(response, "caption|written") || "",
      
      speakingCategory: {
        score: Math.round(((pronunciationScore || 0) + (intonationScore || 0) + (stressScore || 0) + (linkingSoundsScore || 0)) / 4),
        overallScore: Math.round(((pronunciationScore || 0) + (intonationScore || 0) + (stressScore || 0) + (linkingSoundsScore || 0)) / 4),
        feedback: extractCategoryFeedback(response, "speaking|pronunciation") || "AI feedback not available",
        strengths: strengths.filter(s => s.toLowerCase().includes("pronunciation") || s.toLowerCase().includes("speaking")),
        areas_to_improve: weaknesses.filter(w => w.toLowerCase().includes("pronunciation") || w.toLowerCase().includes("speaking")),
        pronunciation: pronunciationScore || 0,
        intonation: intonationScore || 0,
        stress: stressScore || 0,
        linkingSounds: linkingSoundsScore || 0
      },
      languageCategory: {
        score: Math.round(((grammarScore || 0) + (tensesScore || 0) + (vocabularyScore || 0) + (collocationScore || 0)) / 4),
        overallScore: Math.round(((grammarScore || 0) + (tensesScore || 0) + (vocabularyScore || 0) + (collocationScore || 0)) / 4),
        feedback: extractCategoryFeedback(response, "language|grammar|vocabulary") || "AI feedback not available",
        strengths: strengths.filter(s => s.toLowerCase().includes("grammar") || s.toLowerCase().includes("vocabulary")),
        areas_to_improve: weaknesses.filter(w => w.toLowerCase().includes("grammar") || w.toLowerCase().includes("vocabulary")),
        grammar: grammarScore || 0,
        tenses: tensesScore || 0,
        vocabulary: vocabularyScore || 0,
        collocations: collocationScore || 0
      },
      deliveryCategory: {
        score: Math.round(((fluencyScore || 0) + (speakingSpeedScore || 0) + (confidenceScore || 0)) / 3),
        overallScore: Math.round(((fluencyScore || 0) + (speakingSpeedScore || 0) + (confidenceScore || 0)) / 3),
        feedback: extractCategoryFeedback(response, "delivery|fluency|confidence") || "AI feedback not available",
        strengths: strengths.filter(s => s.toLowerCase().includes("fluency") || s.toLowerCase().includes("delivery") || s.toLowerCase().includes("confidence")),
        areas_to_improve: weaknesses.filter(w => w.toLowerCase().includes("fluency") || w.toLowerCase().includes("delivery") || w.toLowerCase().includes("confidence")),
        fluency: fluencyScore || 0,
        speakingSpeed: speakingSpeedScore || 0,
        confidence: confidenceScore || 0
      },
      visualCategory: {
        score: Math.round(((facialExpressionsScore || 0) + (bodyLanguageScore || 0) + (eyeContactScore || 0) + (audienceInteractionScore || 0)) / 4),
        overallScore: Math.round(((facialExpressionsScore || 0) + (bodyLanguageScore || 0) + (eyeContactScore || 0) + (audienceInteractionScore || 0)) / 4),
        feedback: extractCategoryFeedback(response, "visual|presentation|body") || "AI feedback not available",
        strengths: strengths.filter(s => s.toLowerCase().includes("visual") || s.toLowerCase().includes("eye") || s.toLowerCase().includes("expression") || s.toLowerCase().includes("body")),
        areas_to_improve: weaknesses.filter(w => w.toLowerCase().includes("visual") || w.toLowerCase().includes("eye") || w.toLowerCase().includes("expression") || w.toLowerCase().includes("body")),
        facialExpressions: facialExpressionsScore || 0,
        bodyLanguage: bodyLanguageScore || 0,
        eyeContact: eyeContactScore || 0,
        audienceInteraction: audienceInteractionScore || 0
      },
      captionCategory: {
        score: Math.round(((captionSpellingScore || 0) + (captionGrammarScore || 0) + (appropriateVocabularyScore || 0) + (clarityScore || 0) + (callToActionScore || 0) + (hashtagsScore || 0) + (seoScore || 0) + (creativityScore || 0) + (emotionsScore || 0) + (personalBrandingScore || 0)) / 10),
        overallScore: Math.round(((captionSpellingScore || 0) + (captionGrammarScore || 0) + (appropriateVocabularyScore || 0) + (clarityScore || 0) + (callToActionScore || 0) + (hashtagsScore || 0) + (seoScore || 0) + (creativityScore || 0) + (emotionsScore || 0) + (personalBrandingScore || 0)) / 10),
        feedback: extractCategoryFeedback(response, "caption|written") || "AI feedback not available",
        strengths: strengths.filter(s => s.toLowerCase().includes("caption") || s.toLowerCase().includes("writing") || s.toLowerCase().includes("spelling") || s.toLowerCase().includes("hashtag")),
        areas_to_improve: weaknesses.filter(w => w.toLowerCase().includes("caption") || w.toLowerCase().includes("writing") || w.toLowerCase().includes("spelling") || w.toLowerCase().includes("hashtag")),
        captionSpelling: captionSpellingScore || 0,
        captionGrammar: captionGrammarScore || 0,
        appropriateVocabulary: appropriateVocabularyScore || 0,
        clarity: clarityScore || 0,
        callToAction: callToActionScore || 0,
        hashtags: hashtagsScore || 0,
        seoCaption: seoScore || 0,
        creativity: creativityScore || 0,
        emotions: emotionsScore || 0,
        personalBranding: personalBrandingScore || 0
      }
    }  } catch (error) {
    console.error("❌ Error parsing video evaluation response:", error)
    throw new Error("Failed to parse AI evaluation response. Please try again later.")
  }
}

/**
 * Extract numerical score from text using regex patterns
 */
function extractScore(text: string, keyword: string): number | null {
  // More specific patterns for extracting scores
  const patterns = [
    // Pattern: "Keyword: 85 - comment"
    new RegExp(`${keyword}[^\\d]*:?\\s*([0-9]{1,3})\\s*[-\\s]`, "i"),
    // Pattern: "Keyword score: 85"
    new RegExp(`${keyword}[^\\d]*score[^\\d]*([0-9]{1,3})`, "i"),
    // Pattern: "Keyword (85/100)"
    new RegExp(`${keyword}[^\\d]*\\(?([0-9]{1,3})\\s*[/\\)]`, "i"),
    // Pattern: "Keyword: 85/100"
    new RegExp(`${keyword}[^\\d]*:?\\s*([0-9]{1,3})\\s*/\\s*100`, "i"),
    // Pattern: "85 for keyword"
    new RegExp(`([0-9]{1,3})[^\\d]*${keyword}`, "i"),
    // General pattern: "keyword...85"
    new RegExp(`${keyword}[^\\d]*([0-9]{1,3})`, "i")
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const score = parseInt(match[1])
      if (score >= 0 && score <= 100) {
        return score
      }
    }
  }
  
  return null
}

/**
 * Extract main feedback from response
 */
function extractFeedback(text: string): string {
  // Look for feedback sections with more specific patterns
  const feedbackPatterns = [
    /overall.*?assessment[:\-\s]+([^\.]+(?:\.[^\.]+){0,3})/i,
    /overall.*?feedback[:\-\s]+([^\.]+(?:\.[^\.]+){0,3})/i,
    /general.*?feedback[:\-\s]+([^\.]+(?:\.[^\.]+){0,3})/i,
    /summary[:\-\s]+([^\.]+(?:\.[^\.]+){0,3})/i,
    /evaluation[:\-\s]+([^\.]+(?:\.[^\.]+){0,3})/i,
    /conclusion[:\-\s]+([^\.]+(?:\.[^\.]+){0,3})/i
  ]
  
  for (const pattern of feedbackPatterns) {
    const match = text.match(pattern)
    if (match && match[1] && match[1].trim().length > 30) {
      return match[1].trim()
    }
  }
  
  // Look for paragraph that seems like overall feedback
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50)
  for (const paragraph of paragraphs) {
    if (paragraph.toLowerCase().includes('overall') || 
        paragraph.toLowerCase().includes('performance') ||
        paragraph.toLowerCase().includes('evaluation')) {
      return paragraph.trim()
    }
  }
  
  // Fallback: return first meaningful paragraph that's not a header
  const sentences = text.split(/[\.!?]+/).filter(s => s.trim().length > 30 && !s.includes(':'))
  if (sentences.length > 0) {
    return sentences[0].trim() + '.'
  }
  
  throw new Error("No feedback found in AI response")
}

/**
 * Extract category-specific feedback from AI response
 */
function extractCategoryFeedback(text: string, keywords: string): string | null {
  const lines = text.split('\n')
  
  // Look for sections that match the keywords
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    if (line.match(new RegExp(keywords, 'i'))) {
      // Found a matching section, look for feedback in the next few lines
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const feedbackLine = lines[j].trim()
        if (feedbackLine.length > 30 && 
            !feedbackLine.includes(':') && 
            !feedbackLine.match(/^\d+\./) && 
            !feedbackLine.includes('score') &&
            !feedbackLine.includes('0-100')) {
          return feedbackLine
        }
      }
    }
  }
  
  // Look for paragraph-style feedback that contains keywords
  const paragraphs = text.split(/\n\s*\n/)
  for (const paragraph of paragraphs) {
    if (paragraph.match(new RegExp(keywords, 'i')) && paragraph.trim().length > 30) {
      // Clean up the paragraph
      const cleaned = paragraph.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
      if (cleaned.length > 30) {
        return cleaned
      }
    }
  }
  
  return null
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
  
  // Also look for numbered lists (1., 2., etc.)
  for (const line of lines) {
    if (line.match(new RegExp(keywords, 'i')) && line.match(/^\s*\d+\./)) {
      const cleaned = line.replace(/^\s*\d+\.\s*/, '').trim()
      if (cleaned.length > 10 && cleaned.length < 100) {
        points.push(cleaned)
      }
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