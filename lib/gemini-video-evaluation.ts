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
    }    const systemPrompt = `You are an expert English language instructor and communication coach specializing in comprehensive video evaluation for English learners. Your task is to evaluate video submissions across multiple dimensions to help users improve their English skills.

CRITICAL EVALUATION RULES - FOLLOW THESE EXACTLY, NO EXCEPTIONS:

1. MANDATORY LANGUAGE DETECTION (FIRST PRIORITY):
   - ALWAYS analyze the video content for language detection BEFORE scoring anything
   - If video contains ZERO English speech or is entirely in Vietnamese/Chinese/Spanish/etc.: 
     * ALL speaking scores MUST be 0-10
     * Overall score MUST be 0-10
     * State "LANGUAGE DETECTED: [non-English language]"
   
   - If video is mostly non-English (>70% non-English content):
     * Maximum overall score: 15
     * All speaking scores maximum: 15
     * State "LANGUAGE DETECTED: mostly [non-English language]"
   
   - If video is mixed (40-60% non-English):
     * Maximum overall score: 35
     * All speaking scores maximum: 35
     * State "LANGUAGE DETECTED: mixed [languages]"
   
   - Only primarily English videos (>70% English) should receive scores above 50

2. VIETNAMESE CONTENT DETECTION:
   - If you hear ANY Vietnamese words like: "xin chào", "hôm nay", "tôi sẽ", "các bạn", "tiếng việt"
   - If caption contains Vietnamese: "Xin chào", "hôm nay", "tôi", "và", "của", "một"
   - IMMEDIATELY classify as Vietnamese content and apply score limits above

3. TECHNICAL ISSUES:
   - No audio/corrupted video: 0 points ALL categories
   - Under 30 seconds English content: Maximum 25 points overall

MANDATORY RESPONSE FORMAT:
- FIRST LINE MUST BE: "LANGUAGE DETECTED: [language]"
- If non-English detected, ALL scores must reflect the limitations above
- NO EXCEPTIONS to these rules


SCORING CRITERIA - BE EXTREMELY STRICT:

SPEAKING & PRONUNCIATION (25% weight):
- Pronunciation accuracy of individual words and sounds (0-100)
- Intonation patterns and melody of speech (0-100)
- Word and sentence stress placement (0-100)
- Linking sounds between words (0-100)
SCORING: 90-100=Native-like, 80-89=Advanced, 70-79=Upper-Intermediate, 60-69=Intermediate, 50-59=Pre-Intermediate, 30-49=Elementary, 0-29=Beginner/No English

LANGUAGE USAGE (25% weight):
- Grammar accuracy and sentence structure (0-100)
- Proper use of verb tenses (0-100)
- Vocabulary appropriateness and variety (0-100)
- Natural word collocations and phrases (0-100)
SCORING: 90-100=Excellent grammar, 80-89=Good with minor errors, 70-79=Adequate with some errors, 60-69=Frequent errors but understandable, 50-59=Many errors affecting meaning, 0-49=Poor grammar/No English

FLUENCY & DELIVERY (25% weight):
- Overall fluency and natural flow (0-100)
- Speaking speed and rhythm (0-100)
- Confidence in delivery (0-100)
- Clarity of expression (0-100)
SCORING: 90-100=Very fluent, 80-89=Generally fluent, 70-79=Some hesitation, 60-69=Frequent pauses, 50-59=Choppy delivery, 0-49=Very broken/No English

VISUAL & PRESENTATION (12.5% weight):
- Facial expressions and emotional engagement (0-100)
- Body language and gestures (0-100)
- Eye contact with camera/audience (0-100)
- Audience interaction and engagement (0-100)

CAPTION QUALITY (12.5% weight):
- Spelling accuracy (0-100)
- Grammar in written form (0-100)
- Appropriate vocabulary for social media (0-100)
- Clarity of message (0-100)
- Clear call-to-action (0-100)
- Effective hashtag usage (0-100)
- SEO optimization (0-100)
- Creativity and engagement (0-100)
- Emotional appeal (0-100)
- Personal branding consistency (0-100)

CONTENT COMPREHENSION (when applicable):
- How well the user understood and internalized the original content
- Whether their response demonstrates genuine comprehension vs. superficial copying
- The accuracy of their interpretation and explanation of key concepts
- Their ability to explain topics in their own words while maintaining accuracy
- Use of appropriate vocabulary and terminology from the original content

STRICT EVALUATION GUIDELINES:
- ALWAYS detect the language first before scoring
- Give 0 points if criteria cannot be assessed due to language barriers
- Be brutally honest about English proficiency level - do not inflate scores
- Penalize heavily for non-English content in an English learning context
- Only reward genuine English communication attempts
- Focus on constructive feedback that helps learners progress

You MUST provide numerical scores (0-100) for each criterion and clearly state the detected language.`

    const evaluationPrompt = `Please evaluate this English learning video submission comprehensively and strictly:

VIDEO DETAILS:
- Video URL: ${videoUrl}
- User Caption: "${caption}"
${transcript ? `- Video Transcript: "${transcript}"` : ""}
${originalContent ? `

ORIGINAL CONTENT CONTEXT:
${originalContent}

CRITICAL: This user's video is responding to the original content above. Evaluate how well they:
- Understood and internalized the original material (30% of evaluation weight)
- Demonstrated genuine comprehension vs. superficial copying
- Accurately interpreted and explained key concepts
- Used their own words while maintaining accuracy
- Applied appropriate vocabulary and terminology from the original content

Be EXTREMELY STRICT: Content showing genuine understanding and good English skills should score well, while generic, inaccurate responses, or non-English content should receive very low scores.` : ""}

MANDATORY EVALUATION REQUIREMENTS:

1. LANGUAGE DETECTION (CRITICAL - DO THIS FIRST):
   - Analyze the video content and detect the primary language
   - State clearly: "LANGUAGE DETECTED: [language name]"
   - If video contains NO English speech or is entirely in Vietnamese/Chinese/Spanish/etc.: Give 0 for ALL speaking scores, overall score 0-10
   - If video is mostly non-English: Maximum overall score 20
   - If video is 50% non-English: Maximum overall score 40
   - Only primarily English videos should score above 50

2. PROVIDE EXACT NUMERICAL SCORES (0-100) for each criterion:

SPEAKING & PRONUNCIATION (25% weight):
   - Pronunciation: [exact score 0-100] - [brief comment]
   - Intonation: [exact score 0-100] - [brief comment] 
   - Stress: [exact score 0-100] - [brief comment]
   - Linking sounds: [exact score 0-100] - [brief comment]

LANGUAGE USAGE (25% weight):
   - Grammar: [exact score 0-100] - [brief comment]
   - Tenses: [exact score 0-100] - [brief comment]
   - Vocabulary: [exact score 0-100] - [brief comment]
   - Collocations: [exact score 0-100] - [brief comment]

FLUENCY & DELIVERY (25% weight):
   - Fluency: [exact score 0-100] - [brief comment]
   - Speaking speed: [exact score 0-100] - [brief comment]
   - Confidence: [exact score 0-100] - [brief comment]
   - Clarity: [exact score 0-100] - [brief comment]

VISUAL & PRESENTATION (12.5% weight):
   - Facial expressions: [exact score 0-100] - [brief comment]
   - Body language: [exact score 0-100] - [brief comment]
   - Eye contact: [exact score 0-100] - [brief comment]
   - Audience interaction: [exact score 0-100] - [brief comment]

CAPTION QUALITY (12.5% weight):
   - Spelling: [exact score 0-100] - [brief comment]
   - Grammar: [exact score 0-100] - [brief comment]
   - Vocabulary: [exact score 0-100] - [brief comment]
   - Clarity: [exact score 0-100] - [brief comment]
   - Call-to-action: [exact score 0-100] - [brief comment]
   - Hashtags: [exact score 0-100] - [brief comment]
   - SEO: [exact score 0-100] - [brief comment]
   - Creativity: [exact score 0-100] - [brief comment]
   - Emotions: [exact score 0-100] - [brief comment]
   - Personal branding: [exact score 0-100] - [brief comment]

${originalContent ? `CONTENT COMPREHENSION (when applicable):
   - Understanding: [exact score 0-100] - [brief comment]
   - Accuracy: [exact score 0-100] - [brief comment]
   - Use of details: [exact score 0-100] - [brief comment]
   - Own words: [exact score 0-100] - [brief comment]
   - Terminology: [exact score 0-100] - [brief comment]

` : ""}3. OVERALL ASSESSMENT:
   - Overall score: [exact score 0-100 calculated from weighted averages]
   - LANGUAGE DETECTED: [state the primary language clearly]
${originalContent ? `   - Content comprehension weight: 30%
   - English language skills weight: 40%  
   - Video presentation quality weight: 30%` : `   - Speaking & Pronunciation: 25%
   - Language Usage: 25%
   - Fluency & Delivery: 25%
   - Visual & Presentation: 12.5%
   - Caption Quality: 12.5%`}

4. DETAILED FEEDBACK (Required):
   - Overall assessment: [2-3 specific sentences about performance and language used]
   - Speaking feedback: [specific feedback on pronunciation and speaking]
   - Language feedback: [specific feedback on grammar and vocabulary]
   - Delivery feedback: [specific feedback on fluency and confidence]
   - Visual feedback: [specific feedback on presentation and body language]
   - Caption feedback: [specific feedback on written content]
${originalContent ? `   - Content accuracy feedback: [specific feedback on understanding and accuracy]` : ""}
   
5. STRENGTHS (3-5 specific items):
   - [List specific strengths with examples, if any English is present]
   
6. AREAS TO IMPROVE (3-5 specific items):
   - [List specific improvement areas with actionable advice]

SCORING GUIDELINES (BE EXTREMELY STRICT):
- 90-100: EXCEPTIONAL - Near-native English proficiency
- 80-89: EXCELLENT - Advanced English with minor improvements needed
- 70-79: GOOD - Upper-intermediate with notable strengths
- 60-69: SATISFACTORY - Intermediate level with clear improvement areas
- 50-59: NEEDS IMPROVEMENT - Pre-intermediate requiring significant work
- 30-49: ELEMENTARY - Basic level with fundamental gaps
- 20-29: BEGINNER - Mostly non-English with some English attempts
- 0-19: NO ENGLISH - Video contains no or minimal English content

CRITICAL INSTRUCTIONS:
- ALWAYS state "LANGUAGE DETECTED: [language]" in your response
- If language is NOT English, scores must reflect this according to the strict guidelines above
- Do not give high scores to non-English content regardless of quality
- Be honest and help learners understand they need to use English for this assessment

Format your response with clear section headers and exact numerical scores for every criterion listed above.`

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
    return parseVideoEvaluationResponse(response, videoUrl, caption)
      } catch (error) {
    console.error("❌ Error evaluating video with Gemini AI:", error)
    
    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("authentication")) {
        throw new Error("Video evaluation service is unavailable. Please contact support.")
      } else if (error.message.includes("parse") || error.message.includes("extract") || error.message.includes("Unable to parse")) {
        throw new Error("Failed to process AI evaluation response. The AI may be experiencing issues. Please try again in a few minutes.")
      } else if (error.message.includes("quota") || error.message.includes("limit") || error.message.includes("rate")) {
        throw new Error("Video evaluation service is temporarily unavailable due to high demand. Please try again in 10-15 minutes.")
      } else if (error.message.includes("network") || error.message.includes("timeout") || error.message.includes("connection")) {
        throw new Error("Network connection issue. Please check your internet connection and try again.")
      } else if (error.message.includes("video") || error.message.includes("URL") || error.message.includes("file")) {
        throw new Error("Unable to access the video file. Please ensure the video was uploaded correctly and try again.")
      } else if (error.message.includes("language") || error.message.includes("English")) {
        throw new Error("Video evaluation failed. Please ensure your video contains clear English speech and try again.")
      } else {
        throw new Error(`Video evaluation failed: ${error.message}`)
      }
    }
    
    throw new Error("Video evaluation failed due to an unexpected error. Please try again later.")
  }
}

/**
 * Parse Gemini AI response and convert to structured VideoEvaluation format
 */
function parseVideoEvaluationResponse(response: string, videoUrl?: string, caption?: string): VideoEvaluation {
  // For now, we'll use a more sophisticated parsing approach
  // In a production environment, you'd want to use structured output from Gemini
  
  try {
    // Check for language detection in AI response
    const languageDetected = extractLanguageDetection(response)
    console.log("🌐 Language detected by AI:", languageDetected)
    
    // STRICT LANGUAGE-BASED SCORE ENFORCEMENT - Early detection
    const detectedLanguage = languageDetected?.toLowerCase() || 'unknown'
    
    // Vietnamese content - immediate override
    if (detectedLanguage.includes('vietnamese') || detectedLanguage.includes('việt')) {
      console.log("🚨 ENFORCING Vietnamese content limits - overriding AI scores")
      return createNonEnglishEvaluation('vietnamese', response, caption || "")
    }
    
    // Additional Vietnamese detection from caption
    const hasVietnameseInCaption = caption && (
      caption.toLowerCase().includes('xin chào') ||
      caption.toLowerCase().includes('hôm nay') ||
      caption.toLowerCase().includes('tôi sẽ') ||
      caption.toLowerCase().includes('các bạn') ||
      caption.toLowerCase().includes('tiếng việt')
    )
    
    if (hasVietnameseInCaption) {
      console.log("🚨 OVERRIDE: Vietnamese detected in caption - enforcing strict limits")
      return createNonEnglishEvaluation('vietnamese', response, caption || "")
    }
    
    // Extract scores using enhanced regex patterns - STRICT validation
    // Look for "Overall score: 72" format specifically
    const overallScore = extractScore(response, "overall score") || extractScore(response, "overall.*?score|total.*?score|final.*?score")
    
    // Core speaking scores - these are mandatory
    const pronunciationScore = extractScore(response, "pronunciation")
    const intonationScore = extractScore(response, "intonation")
    const stressScore = extractScore(response, "stress")
    const linkingSoundsScore = extractScore(response, "linking.*?sounds?|linking")
    
    // Core language scores - these are mandatory
    const grammarScore = extractScore(response, "grammar")
    const tensesScore = extractScore(response, "tenses?|verb.*?tenses?")
    const vocabularyScore = extractScore(response, "vocabulary")
    const collocationScore = extractScore(response, "collocations?")
    
    // Core fluency scores - these are mandatory
    const fluencyScore = extractScore(response, "fluency")
    const speakingSpeedScore = extractScore(response, "speaking.*?speed|speed")
    const confidenceScore = extractScore(response, "confidence")
    const clarityScore = extractScore(response, "clarity")
    
    // Visual presentation scores
    const facialExpressionsScore = extractScore(response, "facial.*?expressions?|expressions?")
    const bodyLanguageScore = extractScore(response, "body.*?language|gestures?")
    const eyeContactScore = extractScore(response, "eye.*?contact")
    const audienceInteractionScore = extractScore(response, "audience.*?interaction|interaction")
    
    // Caption quality scores
    const captionSpellingScore = extractScore(response, "spelling")
    const captionGrammarScore = extractScore(response, "caption.*?grammar|written.*?grammar")
    const appropriateVocabularyScore = extractScore(response, "appropriate.*?vocabulary|suitable.*?vocabulary")
    const callToActionScore = extractScore(response, "call.*?to.*?action|call.*?action|cta")
    const hashtagsScore = extractScore(response, "hashtags?")
    const seoScore = extractScore(response, "seo")
    const creativityScore = extractScore(response, "creativity|creative")
    const emotionsScore = extractScore(response, "emotions?|emotional.*?appeal")
    const personalBrandingScore = extractScore(response, "personal.*?branding|branding")

    // STRICT VALIDATION: Check that we got essential scores from AI
    const missingScores = []
    if (overallScore === null || overallScore === undefined) missingScores.push("overall score")
    if (pronunciationScore === null || pronunciationScore === undefined) missingScores.push("pronunciation")
    if (grammarScore === null || grammarScore === undefined) missingScores.push("grammar")
    if (fluencyScore === null || fluencyScore === undefined) missingScores.push("fluency")
    if (vocabularyScore === null || vocabularyScore === undefined) missingScores.push("vocabulary")
    
    if (missingScores.length > 0) {
      console.error("❌ Failed to parse essential scores from AI response:")
      console.error("Missing scores:", missingScores)
      console.error("AI Response preview:", response.substring(0, 500) + "...")
      throw new Error(`Unable to parse essential evaluation scores from AI response. Missing: ${missingScores.join(", ")}`)
    }

    // Convert null scores to numbers (we've validated essential ones above)
    const finalOverallScore = overallScore ?? 0
    const finalPronunciationScore = pronunciationScore ?? 0
    const finalGrammarScore = grammarScore ?? 0
    const finalFluencyScore = fluencyScore ?? 0
    const finalVocabularyScore = vocabularyScore ?? 0

    // Additional validation: ensure scores are reasonable
    const coreScores = [finalOverallScore, finalPronunciationScore, finalGrammarScore, finalFluencyScore, finalVocabularyScore]
    const invalidScores = coreScores.filter(score => score < 0 || score > 100)
    if (invalidScores.length > 0) {
      console.error("❌ Invalid scores detected:", invalidScores)
      throw new Error("AI returned invalid scores outside the 0-100 range")
    }

    console.log("✅ Successfully parsed and validated AI evaluation scores:", {
      overall: finalOverallScore,
      pronunciation: finalPronunciationScore,
      grammar: finalGrammarScore,
      fluency: finalFluencyScore,
      vocabulary: finalVocabularyScore
    })
    
    // Log the final evaluation result that will be returned
    console.log("🎯 Final evaluation result that will be returned:", {
      overallScore: finalOverallScore,
      detectedLanguage: languageDetected || 'english',
      isEnglishContent: !languageDetected || languageDetected.toLowerCase() === 'english'
    })

    // Additional check: If overall score is suspiciously high but we detected non-English indicators
    const suspiciouslyHighScore = finalOverallScore > 50
    const hasNonEnglishIndicators = response.toLowerCase().includes('vietnamese') || 
                                   response.toLowerCase().includes('tiếng việt') ||
                                   response.toLowerCase().includes('không phải tiếng anh') ||
                                   caption?.includes('tiếng việt') ||
                                   caption?.includes('vietnamese') ||
                                   // Additional checks for content that might be non-English
                                   (caption && !caption.match(/[a-zA-Z]{3,}/)) || // Caption has no English words
                                   (finalOverallScore > 50 && finalPronunciationScore < 30) // High overall but very low pronunciation suggests non-English
    
    // Enhanced detection: Check if user uploaded video in Vietnamese based on URL pattern or other indicators
    const urlMightBeVietnamese = videoUrl?.includes('vietnamese') || videoUrl?.includes('tieng-viet')
    
    if (suspiciouslyHighScore && (hasNonEnglishIndicators || urlMightBeVietnamese)) {
      console.log("⚠️ Detected high score for potentially non-English content, enforcing strict rules")
      console.log("Indicators found:", {
        hasNonEnglishIndicators,
        urlMightBeVietnamese,
        overallScore: finalOverallScore,
        pronunciationScore: finalPronunciationScore
      })
      return createNonEnglishEvaluation('vietnamese', response, caption || "")
    }
    
    // Additional validation: If video is claimed to be English but has very poor English scores across the board
    const coreEnglishScores = [finalPronunciationScore, finalGrammarScore, finalFluencyScore, finalVocabularyScore]
    const averageCoreScore = coreEnglishScores.reduce((sum, score) => sum + score, 0) / coreEnglishScores.length
    
    if (finalOverallScore > 60 && averageCoreScore < 40) {
      console.log("⚠️ Inconsistent scoring detected - high overall score but very low English skills")
      console.log("Overall:", finalOverallScore, "Average core English:", averageCoreScore)
      // Adjust overall score to be more consistent with English skills
      const adjustedOverallScore = Math.max(10, Math.min(averageCoreScore + 10, finalOverallScore))
      console.log("Adjusted overall score to:", adjustedOverallScore)
      return {
        ...createNonEnglishEvaluation('potentially non-english', response, caption || ""),
        score: adjustedOverallScore,
        overallFeedback: `Inconsistent evaluation detected. While some presentation skills are good, English language proficiency appears limited. Overall score adjusted to ${adjustedOverallScore} to reflect actual English skills demonstrated.`
      }
    }

    // Require at least some scores for a valid evaluation
    const scoreCount = [pronunciationScore, grammarScore, fluencyScore, vocabularyScore].filter(s => s !== null).length
    if (scoreCount < 2) {
      console.error("❌ Insufficient scores extracted from AI response")
      console.error("Extracted scores:", {
        pronunciation: pronunciationScore,
        grammar: grammarScore,
        fluency: fluencyScore,
        vocabulary: vocabularyScore
      })
      throw new Error("AI response does not contain enough evaluation scores. Please try again.")
    }

    console.log("✅ Successfully parsed AI evaluation scores:", {
      overall: overallScore,
      pronunciation: pronunciationScore || 0,
      grammar: grammarScore || 0,
      fluency: fluencyScore || 0,
      totalScoresFound: scoreCount
    })

    // Extract feedback sections from AI response
    const feedback = extractFeedback(response)
    const strengths = extractBulletPoints(response, "strength|positive|good|excellent|well")
    const weaknesses = extractBulletPoints(response, "improve|weakness|area.*improve|consider|work.*on")
    
    if (!feedback || feedback.trim().length < 20) {
      console.error("❌ Failed to extract meaningful feedback from AI response")
      console.error("Extracted feedback:", feedback)
      throw new Error("AI response does not contain meaningful feedback. Please try again.")
    }

    console.log("✅ Successfully extracted AI feedback:", feedback.substring(0, 100) + "...")
    console.log("✅ Extracted strengths:", strengths.length, "items")
    console.log("✅ Extracted weaknesses:", weaknesses.length, "items")
    
    return {
      score: finalOverallScore,
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
    console.error("❌ Raw AI response that failed to parse:", response)
    
    if (error instanceof Error && error.message.includes("extract")) {
      throw error // Re-throw our custom extraction errors
    }
    
    throw new Error("Failed to parse AI evaluation response. The AI response format may be invalid. Please try submitting your video again.")
  }
}

/**
 * Extract numerical score from text using enhanced regex patterns
 */
function extractScore(text: string, keyword: string): number | null {
  // Enhanced patterns to catch various score formats
  const patterns = [
    // Pattern: "Overall score: 72" (most specific)
    new RegExp(`${keyword}:\\s*([0-9]{1,3})(?:\\s|$|\\n)`, "i"),
    // Pattern: "- Overall score: 72"
    new RegExp(`-\\s*${keyword}:\\s*([0-9]{1,3})(?:\\s|$|\\n)`, "i"),
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
        console.log(`✅ Extracted score for '${keyword}': ${score} using pattern: ${pattern}`)
        return score
      }
    }
  }
  
  console.log(`❌ Could not extract score for '${keyword}'`)
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
  
  // Last attempt: return first meaningful paragraph that's not a header
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
 * Extract language detection from AI response
 */
function extractLanguageDetection(response: string): string | null {
  const patterns = [
    /LANGUAGE DETECTED:\s*([^,\n.]+)/i,
    /detected language:\s*([^,\n.]+)/i,
    /language:\s*([^,\n.]+)/i,
    /speaking in:\s*([^,\n.]+)/i,
    /primarily in:\s*([^,\n.]+)/i,
    /video is in:\s*([^,\n.]+)/i,
    /content is in:\s*([^,\n.]+)/i
  ]
  
  for (const pattern of patterns) {
    const match = response.match(pattern)
    if (match && match[1]) {
      const language = match[1].trim().toLowerCase()
      console.log("🔍 Language detection match:", language)
      
      // If AI detects English but we suspect otherwise, do additional checks
      if (language === 'english') {
        // Check if the response mentions non-English characteristics
        const responseText = response.toLowerCase()
        if (responseText.includes('no english') || 
            responseText.includes('not english') ||
            responseText.includes('vietnamese') ||
            responseText.includes('chinese') ||
            responseText.includes('non-english') ||
            responseText.includes('another language')) {
          console.log("⚠️ AI claimed English but response suggests otherwise")
          return 'non-english'
        }
      }
      
      return language
    }
  }
  
  // Also check for common language mentions in the response
  const text = response.toLowerCase()
  if (text.includes('no english speech') || text.includes('not english')) return 'non-english'
  if (text.includes('vietnamese') || text.includes('tiếng việt')) return 'vietnamese'
  if (text.includes('chinese') || text.includes('mandarin') || text.includes('cantonese')) return 'chinese'
  if (text.includes('spanish') || text.includes('español')) return 'spanish'
  if (text.includes('french') || text.includes('français')) return 'french'
  if (text.includes('japanese') || text.includes('日本語')) return 'japanese'
  if (text.includes('korean') || text.includes('한국어')) return 'korean'
  
  // Check for phrases that suggest the video is not in English
  if (text.includes('cannot assess english') || 
      text.includes('no english content') ||
      text.includes('minimal english') ||
      text.includes('primarily non-english')) {
    return 'non-english'
  }
  
  return null
}

/**
 * Create evaluation for non-English content
 */
function createNonEnglishEvaluation(detectedLanguage: string, aiResponse: string, caption: string): VideoEvaluation {
  const languageName = detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1)
  
  // Very low scores for non-English content
  const baseScore = 0
  const overallScore = detectedLanguage.toLowerCase() === 'vietnamese' ? 5 : 10 // Even lower for Vietnamese
  
  const feedback = `This video is primarily in ${languageName}, not English. For English learning evaluation, please submit a video where you speak primarily in English. While your presentation skills may be good, this assessment is specifically for English language proficiency.`
  
  const strengths = [
    "Video quality and presentation",
    "Confidence in speaking",
    "Clear audio and visual quality"
  ]
  
  const improvements = [
    "Speak primarily in English for English assessment",
    "Practice English pronunciation and vocabulary",
    "Focus on English grammar and sentence structure",
    "Build English fluency through regular practice",
    "Record a new video speaking only in English"
  ]
  
  return {
    score: overallScore,
    feedback,
    overallFeedback: feedback,
    
    // All English-related scores are 0 or very low
    pronunciation: baseScore,
    intonation: baseScore,
    stress: baseScore,
    linkingSounds: baseScore,
    grammar: baseScore,
    tenses: baseScore,
    vocabulary: baseScore,
    collocations: baseScore,
    fluency: baseScore,
    speakingSpeed: baseScore,
    confidence: 30, // Can give some credit for confidence
    facialExpressions: 40, // Visual elements can get some points
    bodyLanguage: 40,
    eyeContact: 40,
    audienceInteraction: 30,
    captionSpelling: caption.length > 0 ? 20 : 0, // Some credit if there's a caption
    captionGrammar: 0,
    appropriateVocabulary: 0,
    clarity: baseScore,
    callToAction: 0,
    hashtags: 0,
    seoCaption: 0,
    creativity: 20,
    emotions: 30,
    personalBranding: 20,
    
    pronunciationScore: baseScore,
    intonationScore: baseScore,
    stressScore: baseScore,
    linkingSoundsScore: baseScore,
    grammarScore: baseScore,
    tensesScore: baseScore,
    vocabularyScore: baseScore,
    collocationScore: baseScore,
    fluencyScore: baseScore,
    speakingSpeedScore: baseScore,
    confidenceScore: 30,
    facialExpressionsScore: 40,
    bodyLanguageScore: 40,
    eyeContactScore: 40,
    audienceInteractionScore: 30,
    captionSpellingScore: caption.length > 0 ? 20 : 0,
    captionGrammarScore: 0,
    appropriateVocabularyScore: 0,
    clarityScore: baseScore,
    callToActionScore: 0,
    hashtagsScore: 0,
    seoScore: 0,
    creativityScore: 20,
    emotionsScore: 30,
    personalBrandingScore: 20,
    
    strengths,
    weaknesses: improvements,
    improvements,
    recommendations: [
      "Record a new video speaking only in English",
      "Practice English daily before recording",
      "Focus on English pronunciation exercises",
      "Use English learning resources and apps"
    ],
    
    speakingFeedback: `Video is in ${languageName}, not English. English speaking skills cannot be assessed.`,
    languageFeedback: `No English language usage detected. Please use English for language assessment.`,
    deliveryFeedback: `While delivery confidence is good, English fluency cannot be evaluated from ${languageName} speech.`,
    visualFeedback: "Good visual presentation and camera presence.",
    captionFeedback: caption.length > 0 ? "Caption provided but English content evaluation needed." : "No caption provided.",
    
    speakingCategory: {
      score: baseScore,
      overallScore: baseScore,
      feedback: `Cannot assess English speaking skills from ${languageName} content`,
      strengths: [],
      areas_to_improve: ["Speak in English", "Practice English pronunciation", "Focus on English grammar"],
      pronunciation: baseScore,
      intonation: baseScore,
      stress: baseScore,
      linkingSounds: baseScore
    },
    languageCategory: {
      score: baseScore,
      overallScore: baseScore,
      feedback: `No English language usage detected in this ${languageName} video`,
      strengths: [],
      areas_to_improve: ["Use English vocabulary", "Practice English grammar", "Build English sentence structure"],
      grammar: baseScore,
      tenses: baseScore,
      vocabulary: baseScore,
      collocations: baseScore
    },
    deliveryCategory: {
      score: 20,
      overallScore: 20,
      feedback: "Good general delivery confidence, but English fluency cannot be assessed",
      strengths: ["Speaking confidence"],
      areas_to_improve: ["English fluency", "English speaking practice"],
      fluency: baseScore,
      speakingSpeed: baseScore,
      confidence: 30
    },
    visualCategory: {
      score: 38,
      overallScore: 38,
      feedback: "Good visual presentation and camera work",
      strengths: ["Camera presence", "Visual quality"],
      areas_to_improve: ["English content focus"],
      facialExpressions: 40,
      bodyLanguage: 40,
      eyeContact: 40,
      audienceInteraction: 30
    },
    captionCategory: {
      score: caption.length > 0 ? 8 : 0,
      overallScore: caption.length > 0 ? 8 : 0,
      feedback: caption.length > 0 ? "Caption provided but needs English content focus" : "No caption provided",
      strengths: caption.length > 0 ? ["Caption attempt"] : [],
      areas_to_improve: ["English caption writing", "English grammar in captions"],
      captionSpelling: caption.length > 0 ? 20 : 0,
      captionGrammar: 0,
      appropriateVocabulary: 0,
      clarity: 0,
      callToAction: 0,
      hashtags: 0,
      seoCaption: 0,
      creativity: 20,
      emotions: 30,
      personalBranding: 20
    }
  }
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