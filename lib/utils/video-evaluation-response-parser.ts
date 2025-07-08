/**
 * Video evaluation response parsing and structuring
 */

import { VideoEvaluation } from "../types/video-evaluation.types"
import { 
  extractScore, 
  extractFeedback, 
  extractCategoryFeedback, 
  extractBulletPoints, 
  extractLanguageDetection 
} from "./video-evaluation-parsing"
import { createNonEnglishEvaluation } from "./non-english-evaluation"

/**
 * Parse Gemini AI response and convert to structured VideoEvaluation format
 */
export function parseVideoEvaluationResponse(response: string, videoUrl?: string, caption?: string): VideoEvaluation {
  // For now, we'll use a more sophisticated parsing approach
  // In a production environment, you'd want to use structured output from Gemini
  
  try {
    // Check for language detection in AI response
    const languageDetected = extractLanguageDetection(response)
    console.log("🌐 Language detected by AI:", languageDetected)
    
    // EXTREMELY STRICT LANGUAGE-BASED SCORE ENFORCEMENT - Zero tolerance
    const detectedLanguage = languageDetected?.toLowerCase() || 'unknown'
    
    // Vietnamese content - immediate override with 0 points
    if (detectedLanguage.includes('vietnamese') || detectedLanguage.includes('việt') || detectedLanguage.includes('vietnam')) {
      console.log("🚨 ENFORCING Vietnamese content - overriding ALL scores to 0")
      return createNonEnglishEvaluation('vietnamese', response, caption || "")
    }
    
    // Other non-English languages - immediate override with 0 points
    if (detectedLanguage.includes('chinese') || detectedLanguage.includes('mandarin') || detectedLanguage.includes('cantonese') ||
        detectedLanguage.includes('spanish') || detectedLanguage.includes('korean') || detectedLanguage.includes('japanese') ||
        detectedLanguage.includes('french') || detectedLanguage.includes('german') || detectedLanguage.includes('thai') ||
        detectedLanguage.includes('hindi') || detectedLanguage.includes('arabic') || detectedLanguage.includes('russian') ||
        detectedLanguage.includes('portuguese') || detectedLanguage.includes('italian') || detectedLanguage.includes('dutch') ||
        detectedLanguage.includes('polish') || detectedLanguage.includes('swedish') || detectedLanguage.includes('norwegian') ||
        detectedLanguage.includes('danish') || detectedLanguage.includes('finnish') || detectedLanguage.includes('turkish') ||
        detectedLanguage.includes('hebrew') || detectedLanguage.includes('persian') || detectedLanguage.includes('urdu') ||
        detectedLanguage.includes('bengali') || detectedLanguage.includes('tamil') || detectedLanguage.includes('telugu') ||
        detectedLanguage.includes('gujarati') || detectedLanguage.includes('marathi') || detectedLanguage.includes('punjabi') ||
        detectedLanguage.includes('malay') || detectedLanguage.includes('indonesian') || detectedLanguage.includes('tagalog') ||
        detectedLanguage.includes('filipino') || detectedLanguage.includes('burmese') || detectedLanguage.includes('cambodian') ||
        detectedLanguage.includes('lao') || detectedLanguage.includes('nepali') || detectedLanguage.includes('sinhala') ||
        detectedLanguage.includes('mongolian') || detectedLanguage.includes('tibetan') || detectedLanguage.includes('kazakh') ||
        detectedLanguage.includes('uzbek') || detectedLanguage.includes('kyrgyz') || detectedLanguage.includes('tajik') ||
        detectedLanguage.includes('turkmen') || detectedLanguage.includes('armenian') || detectedLanguage.includes('georgian') ||
        detectedLanguage.includes('azerbaijani') || detectedLanguage.includes('albanian') || detectedLanguage.includes('bosnian') ||
        detectedLanguage.includes('croatian') || detectedLanguage.includes('serbian') || detectedLanguage.includes('slovenian') ||
        detectedLanguage.includes('macedonian') || detectedLanguage.includes('bulgarian') || detectedLanguage.includes('romanian') ||
        detectedLanguage.includes('hungarian') || detectedLanguage.includes('czech') || detectedLanguage.includes('slovak') ||
        detectedLanguage.includes('ukrainian') || detectedLanguage.includes('belarusian') || detectedLanguage.includes('lithuanian') ||
        detectedLanguage.includes('latvian') || detectedLanguage.includes('estonian') || detectedLanguage.includes('maltese') ||
        detectedLanguage.includes('irish') || detectedLanguage.includes('welsh') || detectedLanguage.includes('scottish') ||
        detectedLanguage.includes('catalan') || detectedLanguage.includes('basque') || detectedLanguage.includes('galician') ||
        detectedLanguage.includes('swahili') || detectedLanguage.includes('amharic') || detectedLanguage.includes('somali') ||
        detectedLanguage.includes('yoruba') || detectedLanguage.includes('igbo') || detectedLanguage.includes('hausa') ||
        detectedLanguage.includes('zulu') || detectedLanguage.includes('xhosa') || detectedLanguage.includes('afrikaans')) {
      console.log("🚨 ENFORCING Non-English content detected - overriding ALL scores to 0")
      return createNonEnglishEvaluation(detectedLanguage, response, caption || "")
    }
    
    // Check for mixed language indicators
    if (detectedLanguage.includes('mixed') || detectedLanguage.includes('partially') || 
        detectedLanguage.includes('some english') || detectedLanguage.includes('mostly') ||
        detectedLanguage.includes('primarily') || detectedLanguage.includes('code-switching') ||
        detectedLanguage.includes('bilingual') || detectedLanguage.includes('multilingual')) {
      console.log("🚨 ENFORCING Mixed language detected - overriding ALL scores to 0")
      return createNonEnglishEvaluation('mixed-language', response, caption || "")
    }
    
    // Additional Vietnamese detection from caption
    const hasVietnameseInCaption = caption && (
      caption.toLowerCase().includes('xin chào') ||
      caption.toLowerCase().includes('hôm nay') ||
      caption.toLowerCase().includes('tôi sẽ') ||
      caption.toLowerCase().includes('các bạn') ||
      caption.toLowerCase().includes('tiếng việt') ||
      caption.toLowerCase().includes('cảm ơn') ||
      caption.toLowerCase().includes('chúng ta') ||
      caption.toLowerCase().includes('việt nam') ||
      caption.toLowerCase().includes('sài gòn') ||
      caption.toLowerCase().includes('hà nội') ||
      caption.toLowerCase().includes('rất') ||
      caption.toLowerCase().includes('này') ||
      caption.toLowerCase().includes('thì') ||
      caption.toLowerCase().includes('để') ||
      caption.toLowerCase().includes('có') ||
      caption.toLowerCase().includes('là') ||
      caption.toLowerCase().includes('một') ||
      caption.toLowerCase().includes('với') ||
      caption.toLowerCase().includes('đây') ||
      caption.toLowerCase().includes('khi') ||
      caption.toLowerCase().includes('sẽ') ||
      caption.toLowerCase().includes('được') ||
      caption.toLowerCase().includes('nhiều') ||
      caption.toLowerCase().includes('như') ||
      caption.toLowerCase().includes('về') ||
      caption.toLowerCase().includes('từ') ||
      caption.toLowerCase().includes('theo') ||
      caption.toLowerCase().includes('đã') ||
      caption.toLowerCase().includes('hay') ||
      caption.toLowerCase().includes('không') ||
      caption.toLowerCase().includes('của') ||
      caption.toLowerCase().includes('trong') ||
      caption.toLowerCase().includes('cho') ||
      caption.toLowerCase().includes('đến') ||
      caption.toLowerCase().includes('hơn') ||
      caption.toLowerCase().includes('bây giờ') ||
      caption.toLowerCase().includes('thế') ||
      caption.toLowerCase().includes('nữa') ||
      caption.toLowerCase().includes('rồi') ||
      caption.toLowerCase().includes('chưa') ||
      caption.toLowerCase().includes('vậy') ||
      caption.toLowerCase().includes('mà') ||
      caption.toLowerCase().includes('gì') ||
      caption.toLowerCase().includes('ai') ||
      caption.toLowerCase().includes('đâu') ||
      caption.toLowerCase().includes('và') ||
      caption.toLowerCase().includes('hoặc') ||
      caption.toLowerCase().includes('nhưng') ||
      caption.toLowerCase().includes('nên') ||
      caption.toLowerCase().includes('vì') ||
      caption.toLowerCase().includes('do') ||
      caption.toLowerCase().includes('bởi') ||
      caption.toLowerCase().includes('nếu') ||
      caption.toLowerCase().includes('dù') ||
      caption.toLowerCase().includes('mặc dù') ||
      caption.toLowerCase().includes('em') ||
      caption.toLowerCase().includes('anh') ||
      caption.toLowerCase().includes('chị') ||
      caption.toLowerCase().includes('con') ||
      caption.toLowerCase().includes('mẹ') ||
      caption.toLowerCase().includes('bố') ||
      caption.toLowerCase().includes('gia đình') ||
      caption.toLowerCase().includes('bạn bè')
    )
    
    if (hasVietnameseInCaption) {
      console.log("🚨 OVERRIDE: Vietnamese detected in caption - enforcing strict 0 point limits")
      return createNonEnglishEvaluation('vietnamese', response, caption || "")
    }
    
    // Extract scores using enhanced regex patterns - STRICT validation
    // Look for "Overall score: 72" format specifically
    const extractedOverallScore = extractScore(response, "overall score") || extractScore(response, "overall.*?score|total.*?score|final.*?score")
    
    // CRITICAL: Even if AI gave scores, check if they should be overridden to 0
    // This is a safety net in case AI didn't follow the strict language rules
    
    // Check if AI response indicates non-English content but still gave scores
    const responseContent = response.toLowerCase()
    
    // Vietnamese language indicators in AI response
    const vietnameseIndicators = [
      'vietnamese', 'việt', 'vietnam', 'tiếng việt', 'xin chào', 'hôm nay', 'tôi sẽ', 
      'các bạn', 'cảm ơn', 'chúng ta', 'bây giờ', 'việt nam', 'sài gòn', 'hà nội',
      'not english', 'non-english', 'non english', 'zero english', 'no english',
      'entirely vietnamese', 'completely vietnamese', 'only vietnamese', 'vietnamese only'
    ]
    
    const hasVietnameseInResponse = vietnameseIndicators.some(indicator => responseContent.includes(indicator))
    
    // Other non-English language indicators in AI response
    const nonEnglishIndicators = [
      'chinese', 'mandarin', 'cantonese', 'spanish', 'korean', 'japanese', 'french',
      'german', 'thai', 'hindi', 'arabic', 'russian', 'portuguese', 'italian', 'dutch',
      'mixed language', 'code-switching', 'bilingual', 'multilingual', 'non-english',
      'not in english', 'no english detected', 'zero english content', 'entirely non-english',
      'completely non-english', 'only non-english', 'non-english only', 'foreign language',
      'unknown language', 'unidentified language', 'language other than english'
    ]
    
    const hasOtherNonEnglishIndicators = nonEnglishIndicators.some(indicator => responseContent.includes(indicator))
    
    // Check if URL suggests Vietnamese content (additional safety check)
    const urlSuggestsVietnamese = videoUrl && (
      videoUrl.includes('vietnam') || videoUrl.includes('vietnamese') || 
      videoUrl.includes('viet') || videoUrl.includes('saigon') || videoUrl.includes('hanoi')
    )
    
    // ENFORCE ABSOLUTE ZERO TOLERANCE - Override any scores if non-English detected
    if (hasVietnameseInResponse || hasOtherNonEnglishIndicators || urlSuggestsVietnamese) {
      console.log("🚨 CRITICAL OVERRIDE: Non-English content detected - enforcing 0 points for everything")
      console.log("Indicators found:", {
        hasVietnameseInResponse,
        hasOtherNonEnglishIndicators,
        urlSuggestsVietnamese,
        overallScore: extractedOverallScore || 0
      })
      return createNonEnglishEvaluation('non-english-detected', response, caption || "")
    }
    
    // Additional safety: Check for inconsistent AI responses
    // If AI claims English but gives very low scores, it might be non-English
    if (extractedOverallScore !== null && extractedOverallScore > 0 && extractedOverallScore < 40) {
      console.log("⚠️ Low scores detected - checking for potential non-English content")
      
      // Look for phrases that suggest non-English content
      const suspiciousPhases = [
        'difficult to understand', 'unclear language', 'language barrier',
        'pronunciation issues', 'accent problems', 'not clear english',
        'hard to follow', 'confusing language', 'language confusion',
        'mixed with other language', 'foreign accent', 'native language interference',
        'unintelligible', 'incomprehensible', 'cannot understand',
        'inaudible english', 'poor english quality', 'broken english',
        'very limited english', 'minimal english', 'barely english',
        'struggling with english', 'english proficiency issues'
      ]
      
      const hasSuspiciousContent = suspiciousPhases.some(phrase => responseContent.includes(phrase))
      
      if (hasSuspiciousContent && extractedOverallScore < 30) {
        console.log("🚨 SUSPICIOUS CONTENT: Converting low scores to 0 for potential non-English")
        return createNonEnglishEvaluation('suspicious-low-scores', response, caption || "")
      }
    }
    
    // If AI gave a score but we suspect it should be 0, force it to 0
    if (extractedOverallScore !== null && extractedOverallScore > 0 && extractedOverallScore < 15) {
      console.log("🚨 FORCING very low scores to 0 - likely non-English content")
      return createNonEnglishEvaluation('very-low-scores-forced-to-zero', response, caption || "")
    }
    const overallScore = extractedOverallScore
    
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
    const keyPoints = extractBulletPoints(response, "key.*points?|main.*points?|summary|findings")
    const nextSteps = extractBulletPoints(response, "next.*steps?|recommendations?|action.*items?|improvement.*plan")
    
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
      keyPoints: keyPoints.length > 0 ? keyPoints : [],
      nextSteps: nextSteps.length > 0 ? nextSteps : [],
      
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
    }
  } catch (error) {
    console.error("❌ Error parsing video evaluation response:", error)
    console.error("❌ Raw AI response that failed to parse:", response)
    
    if (error instanceof Error && error.message.includes("extract")) {
      throw error // Re-throw our custom extraction errors
    }
    
    throw new Error("Failed to parse AI evaluation response. The AI response format may be invalid. Please try submitting your video again.")
  }
}
