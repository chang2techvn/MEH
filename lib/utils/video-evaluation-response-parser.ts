/**
 * Video evaluation response parsing - Simplified to trust AI output
 */

import { VideoEvaluation } from "../types/video-evaluation.types"
import { extractScore, extractFeedback, extractBulletPoints, extractCategoryFeedback } from "./video-evaluation-parsing"

/**
 * Parse Gemini AI response and convert to structured VideoEvaluation format
 * Trust the AI's analysis and simply extract the structured data
 */
export function parseVideoEvaluationResponse(response: string, videoUrl?: string, caption?: string): VideoEvaluation {
  try {
    
    // Extract scores directly from AI response - trust the AI's judgment
    const overallScore = extractScore(response, "overall") || extractScore(response, "total") || 0
    const scores = {
      overall: overallScore,
      pronunciation: extractScore(response, "pronunciation") || 0,
      grammar: extractScore(response, "grammar") || 0,
      vocabulary: extractScore(response, "vocabulary") || 0,
      fluency: extractScore(response, "fluency") || 0,
      coherence: extractScore(response, "coherence") || 0,
      content: extractScore(response, "content") || 0
    }
    
    // Extract key sections directly from AI response
    const keyPoints = extractBulletPoints(response, "key.*points") || []
    const nextSteps = extractBulletPoints(response, "next.*steps") || []
    const strengths = extractBulletPoints(response, "strengths") || []
    const weaknesses = extractBulletPoints(response, "weaknesses") || []
    const detailedFeedback = extractFeedback(response) || response
    
    // Extract language detected info for transparency
    const languageDetected = response.match(/\*\*LANGUAGE DETECTED:\*\*\s*([^-\n]+)/i)?.[1]?.trim()
    
    return {
      score: scores.overall,
      feedback: detailedFeedback,
      overallFeedback: detailedFeedback,
      
      // Core English skills - use AI's scores directly
      pronunciation: scores.pronunciation, 
      intonation: scores.pronunciation, 
      stress: scores.pronunciation, 
      linkingSounds: scores.pronunciation,
      grammar: scores.grammar, 
      tenses: scores.grammar, 
      vocabulary: scores.vocabulary, 
      collocations: scores.vocabulary,
      fluency: scores.fluency, 
      speakingSpeed: scores.fluency, 
      confidence: scores.fluency, 
      coherence: scores.coherence,
      content: scores.content,
      
      // Additional aspects - derive from core scores
      facialExpressions: scores.overall, 
      bodyLanguage: scores.overall, 
      eyeContact: scores.overall, 
      audienceInteraction: scores.overall,
      captionSpelling: scores.grammar, 
      captionGrammar: scores.grammar, 
      appropriateVocabulary: scores.vocabulary,
      callToAction: scores.overall, 
      hashtags: scores.overall, 
      seoCaption: scores.overall, 
      creativity: scores.overall,
      emotions: scores.overall, 
      personalBranding: scores.overall,
      
      // Score versions (for backward compatibility)
      pronunciationScore: scores.pronunciation, 
      intonationScore: scores.pronunciation, 
      stressScore: scores.pronunciation, 
      linkingSoundsScore: scores.pronunciation,
      grammarScore: scores.grammar, 
      tensesScore: scores.grammar, 
      vocabularyScore: scores.vocabulary, 
      collocationScore: scores.vocabulary,
      fluencyScore: scores.fluency, 
      speakingSpeedScore: scores.fluency, 
      confidenceScore: scores.fluency,
      facialExpressionsScore: scores.overall, 
      bodyLanguageScore: scores.overall, 
      eyeContactScore: scores.overall,
      audienceInteractionScore: scores.overall, 
      captionSpellingScore: scores.grammar, 
      captionGrammarScore: scores.grammar,
      appropriateVocabularyScore: scores.vocabulary, 
      clarityScore: scores.overall, // Derive from overall since clarity is removed
      coherenceScore: scores.coherence,
      contentScore: scores.content,
      callToActionScore: scores.overall,
      hashtagsScore: scores.overall, 
      seoScore: scores.overall, 
      creativityScore: scores.overall, 
      emotionsScore: scores.overall, 
      personalBrandingScore: scores.overall,
      
      // AI feedback sections - trust the AI's analysis
      strengths: strengths,
      weaknesses: weaknesses,
      improvements: nextSteps,
      recommendations: keyPoints,
      keyPoints,
      nextSteps,
      
      // Category feedback
      speakingFeedback: extractCategoryFeedback(response, "pronunciation|speaking") || "",
      languageFeedback: extractCategoryFeedback(response, "grammar|vocabulary|language") || "",
      deliveryFeedback: extractCategoryFeedback(response, "fluency|delivery") || "",
      visualFeedback: extractCategoryFeedback(response, "visual|presentation") || "",
      captionFeedback: extractCategoryFeedback(response, "caption|written") || "",
      
      // Category objects
      speakingCategory: { 
        score: scores.pronunciation, 
        overallScore: scores.pronunciation, 
        feedback: extractCategoryFeedback(response, "pronunciation|speaking") || detailedFeedback, 
        strengths: [], 
        areas_to_improve: [] 
      },
      languageCategory: { 
        score: scores.grammar, 
        overallScore: scores.grammar, 
        feedback: extractCategoryFeedback(response, "grammar|vocabulary|language") || detailedFeedback, 
        strengths: [], 
        areas_to_improve: [] 
      },
      deliveryCategory: { 
        score: scores.fluency, 
        overallScore: scores.fluency, 
        feedback: extractCategoryFeedback(response, "fluency|delivery") || detailedFeedback, 
        strengths: [], 
        areas_to_improve: [] 
      },
      visualCategory: { 
        score: scores.overall, 
        overallScore: scores.overall, 
        feedback: extractCategoryFeedback(response, "visual|presentation") || detailedFeedback, 
        strengths: [], 
        areas_to_improve: [] 
      },
      captionCategory: { 
        score: scores.grammar, 
        overallScore: scores.grammar, 
        feedback: extractCategoryFeedback(response, "caption|written") || detailedFeedback, 
        strengths: [], 
        areas_to_improve: [] 
      }
    }
    
  } catch (error) {
    console.error("❌ Error parsing video evaluation response:", error)
    console.error("❌ Raw AI response that failed to parse:", response)
    
    throw new Error("Failed to parse AI evaluation response. Please try again.")
  }
}


