/**
 * Video evaluation response parsing utilities
 */

import { VideoEvaluation } from "../types/video-evaluation.types"

/**
 * Extract numerical score from text using enhanced regex patterns
 */
export function extractScore(text: string, keyword: string): number | null {
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
export function extractFeedback(text: string): string {
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
export function extractCategoryFeedback(text: string, keywords: string): string | null {
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
export function extractBulletPoints(text: string, keywords: string): string[] {
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
 * Extract language detection from AI response with enhanced Vietnamese detection
 */
export function extractLanguageDetection(response: string): string | null {
  const patterns = [
    // Primary detection pattern with enhanced formatting
    /LANGUAGE\s+DETECTED[:\-\s]+([^,\n]+?)(?:\s*-\s*([^,\n]+?))?(?:\s*,|\s*$|\n)/i,
    /detected\s+language[:\-\s]+([^,\n.]+)/i,
    /language[:\-\s]+([^,\n.]+)/i,
    /speaking\s+in[:\-\s]+([^,\n.]+)/i,
    /primarily\s+in[:\-\s]+([^,\n.]+)/i,
    /video\s+is\s+in[:\-\s]+([^,\n.]+)/i,
    /content\s+is\s+in[:\-\s]+([^,\n.]+)/i
  ]
  
  for (const pattern of patterns) {
    const match = response.match(pattern)
    if (match && match[1]) {
      const language = match[1].trim().toLowerCase()
      console.log("🔍 Language detection match:", language)
      
      // Enhanced Vietnamese detection keywords
      const vietnameseKeywords = [
        'vietnamese', 'việt', 'tiếng việt', 'vietnam', 'viet',
        'không phải tiếng anh', 'tieng viet', 'tiếng việt nam'
      ]
      
      // Check if detected language is Vietnamese
      if (vietnameseKeywords.some(keyword => language.includes(keyword))) {
        console.log("🚨 VIETNAMESE CONTENT DETECTED:", match[1])
        return 'Vietnamese'
      }
      
      // Check for other non-English languages
      const nonEnglishKeywords = [
        'chinese', 'mandarin', 'cantonese', 'spanish', 'french', 'german', 
        'japanese', 'korean', 'italian', 'portuguese', 'russian', 'arabic',
        'hindi', 'thai', 'indonesian', 'malay', 'tagalog', 'tamil'
      ]
      
      if (nonEnglishKeywords.some(keyword => language.includes(keyword))) {
        console.log("🚨 NON-ENGLISH CONTENT DETECTED:", match[1])
        return match[1].trim()
      }
      
      // Check for mixed language indicators
      if (language.includes('mixed') || language.includes('combination') || language.includes('both')) {
        console.log("⚠️ MIXED LANGUAGE DETECTED:", match[1])
        return match[1].trim()
      }
      
      // Check for "no english" or "minimal english" indicators
      if (language.includes('no english') || language.includes('minimal english') || 
          language.includes('little english') || language.includes('barely english')) {
        console.log("🚨 NO/MINIMAL ENGLISH DETECTED:", match[1])
        return match[1].trim()
      }
      
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
  
  // Enhanced Vietnamese content detection in the full text
  const vietnameseContentIndicators = [
    'xin chào', 'hôm nay', 'tôi sẽ', 'các bạn', 'tiếng việt', 'em', 'anh', 'chị', 
    'bây giờ', 'và', 'của', 'một', 'này', 'khi', 'có', 'là', 'trong', 'với', 
    'được', 'sẽ', 'đã', 'nhưng', 'để', 'về', 'từ', 'theo', 'sau', 'trước', 
    'cũng', 'thì', 'như', 'nếu', 'mà', 'rồi', 'vì', 'nên', 'hay', 'chỉ', 
    'cả', 'đều', 'đang', 'chúng ta', 'chúng tôi', 'người', 'ngay', 'vẫn',
    'việc', 'làm', 'thế', 'gì', 'ai', 'đâu', 'bao giờ', 'bao lâu', 'bằng',
    'không', 'có thể', 'phải', 'nên', 'cần', 'muốn', 'thích', 'biết',
    'hiểu', 'nói', 'nghe', 'xem', 'đọc', 'viết', 'học', 'dạy', 'làm việc'
  ]
  
  const text = response.toLowerCase()
  
  // Check for Vietnamese words in the response
  const foundVietnameseWords = vietnameseContentIndicators.filter(word => text.includes(word))
  if (foundVietnameseWords.length > 0) {
    console.log("🚨 VIETNAMESE WORDS DETECTED IN RESPONSE:", foundVietnameseWords)
    return 'Vietnamese - detected by content analysis'
  }
  
  // Also check for common language mentions in the response
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
