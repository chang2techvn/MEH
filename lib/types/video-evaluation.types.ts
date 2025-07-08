/**
 * Video evaluation types and interfaces
 */

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
  keyPoints: string[]
  nextSteps: string[]
  
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
