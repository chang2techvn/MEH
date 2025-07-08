/**
 * Non-English video evaluation handling
 */

import { VideoEvaluation } from "../types/video-evaluation.types"

/**
 * Create evaluation for non-English content
 */
export function createNonEnglishEvaluation(detectedLanguage: string, aiResponse: string, caption: string): VideoEvaluation {
  const languageName = detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1)
  
  // STRICT: All scores should be 0 for non-English content
  const baseScore = 0
  const overallScore = 0 // ABSOLUTELY ZERO for non-English content
  
  const feedback = `🚨 CRITICAL FAILURE: This video contains ${languageName} content, NOT English. 

This is an ENGLISH learning platform with ZERO TOLERANCE for non-English submissions. Your evaluation receives 0 points across ALL categories because English-only content is MANDATORY.

⚠️ SUBMISSION REJECTED: You must submit a video where you speak ONLY in English. No exceptions, no partial credit, no mixed languages allowed.

📌 REQUIREMENT: Record a NEW video speaking EXCLUSIVELY in English to receive any evaluation points.`
  
  const strengths = [
    "❌ NONE - English language is REQUIRED for any assessment",
    "❌ ZERO strengths can be identified from non-English content",
    "❌ Must speak English to demonstrate any language skills"
  ]
  
  const improvements = [
    "🚨 CRITICAL: Record a new video speaking ONLY in English",
    "🚨 MANDATORY: Use ZERO non-English words in your submission", 
    "🚨 REQUIRED: Practice English pronunciation and vocabulary daily",
    "🚨 ESSENTIAL: Focus on English grammar and sentence structure",
    "🚨 COMPULSORY: Build English fluency through regular practice",
    "🚨 OBLIGATORY: Use English-only content for all submissions",
    "🚨 NECESSARY: Complete English conversation practice before recording"
  ]
  
  const keyPoints = [
    `🚨 SUBMISSION FAILED: Video contains ${languageName}, not English`,
    "❌ ZERO POINTS awarded - English-only content is MANDATORY",
    "🚫 NO English language proficiency can be assessed",
    "⚠️ COMPLETE RE-SUBMISSION required with English-only content",
    "📌 This platform has ABSOLUTE ZERO TOLERANCE for non-English videos"
  ]
  
  const nextSteps = [
    "🚨 IMMEDIATE ACTION: Record a new video speaking ONLY in English",
    "📚 DAILY PRACTICE: Study English pronunciation and vocabulary",
    "🎯 FOCUS AREAS: English grammar and sentence structure mastery",
    "💪 BUILD SKILLS: English fluency through consistent conversation practice",
    "✅ SUBMISSION RULE: Use ONLY English in all future video submissions"
  ]
  
  return {
    score: overallScore,
    feedback,
    overallFeedback: feedback,
    
    // ALL scores are 0 for non-English content - no exceptions
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
    confidence: baseScore, // Changed from 30 to 0 - no credit for non-English
    facialExpressions: baseScore, // Changed from 40 to 0 - no partial credit
    bodyLanguage: baseScore, // Changed from 40 to 0
    eyeContact: baseScore, // Changed from 40 to 0
    audienceInteraction: baseScore, // Changed from 30 to 0
    captionSpelling: baseScore, // Changed from 20 to 0 - no credit for non-English
    captionGrammar: baseScore,
    appropriateVocabulary: baseScore,
    clarity: baseScore,
    callToAction: baseScore,
    hashtags: baseScore,
    seoCaption: baseScore,
    creativity: baseScore, // Changed from 20 to 0
    emotions: baseScore, // Changed from 30 to 0
    personalBranding: baseScore, // Changed from 20 to 0
    
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
    confidenceScore: baseScore, // Changed from 30 to 0
    facialExpressionsScore: baseScore, // Changed from 40 to 0
    bodyLanguageScore: baseScore, // Changed from 40 to 0
    eyeContactScore: baseScore, // Changed from 40 to 0
    audienceInteractionScore: baseScore, // Changed from 30 to 0
    captionSpellingScore: baseScore, // Changed from 20 to 0
    captionGrammarScore: baseScore,
    appropriateVocabularyScore: baseScore,
    clarityScore: baseScore,
    callToActionScore: baseScore,
    hashtagsScore: baseScore,
    seoScore: baseScore,
    creativityScore: baseScore, // Changed from 20 to 0
    emotionsScore: baseScore, // Changed from 30 to 0
    personalBrandingScore: baseScore, // Changed from 20 to 0
    
    strengths,
    weaknesses: improvements,
    improvements,
    keyPoints,
    nextSteps,
    recommendations: [
      "🚨 MANDATORY: Record a new video speaking ONLY in English",
      "🚫 PROHIBITION: Never mix languages in English learning submissions",
      "📚 REQUIREMENT: Complete daily English pronunciation practice", 
      "🎯 OBLIGATION: Master English grammar exercises before recording",
      "💻 NECESSITY: Use English learning resources and apps daily",
      "🗣️ COMPULSORY: Engage in English conversation practice sessions"
    ],
    
    speakingFeedback: `🚨 EVALUATION IMPOSSIBLE: Video contains ${languageName}, not English. English speaking skills cannot and will not be assessed from non-English content. COMPLETE FAILURE.`,
    languageFeedback: `❌ ZERO English language usage detected. SUBMISSION REJECTED. Only English content will be evaluated on this platform.`,
    deliveryFeedback: `🚫 While delivery confidence may exist, this is irrelevant as the language is not English. TOTAL FAILURE to meet basic requirements.`,
    visualFeedback: "❌ Visual presentation is irrelevant when language requirement is not met. ZERO CREDIT given.",
    captionFeedback: caption.length > 0 ? "❌ Caption irrelevant - English content evaluation impossible due to wrong language." : "❌ No caption provided AND wrong language used - COMPLETE FAILURE.",
    
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
      score: baseScore,
      overallScore: baseScore,
      feedback: `🚫 Delivery assessment IMPOSSIBLE due to wrong language. English required.`,
      strengths: [],
      areas_to_improve: ["🚨 PRIORITY: Record in English only", "❌ REQUIREMENT: English fluency practice", "⚠️ MANDATORY: English conversation skills"],
      fluency: baseScore,
      speakingSpeed: baseScore,
      confidence: baseScore,
      clarity: baseScore
    },
    visualCategory: {
      score: baseScore,
      overallScore: baseScore,
      feedback: `❌ Visual assessment IRRELEVANT when language requirement not met.`,
      strengths: [],
      areas_to_improve: ["🚨 FIRST PRIORITY: Use English language", "❌ FIX LANGUAGE: Before focusing on visuals", "⚠️ REQUIREMENT: English-only submissions"],
      facialExpressions: baseScore,
      bodyLanguage: baseScore,
      eyeContact: baseScore,
      audienceInteraction: baseScore
    },
    captionCategory: {
      score: baseScore,
      overallScore: baseScore,
      feedback: `🚫 Caption evaluation IMPOSSIBLE with wrong language content.`,
      strengths: [],
      areas_to_improve: ["🚨 CRITICAL: Write captions in English only", "❌ PROHIBITED: Non-English captions", "📝 REQUIRED: English writing practice"],
      captionSpelling: baseScore,
      captionGrammar: baseScore,
      appropriateVocabulary: baseScore,
      clarity: baseScore,
      callToAction: baseScore,
      hashtags: baseScore,
      seoCaption: baseScore,
      creativity: baseScore,
      emotions: baseScore,
      personalBranding: baseScore
    }
  }
}
