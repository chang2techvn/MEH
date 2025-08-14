/**
 * Video evaluation response parsing utilities - Simplified
 */

/**
 * Clean markdown formatting from text
 */
function cleanMarkdown(text: string): string {
  if (!text) return text
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold** formatting
    .replace(/\*(.*?)\*/g, '$1')      // Remove *italic* formatting
    .replace(/_(.*?)_/g, '$1')        // Remove _italic_ formatting
    .replace(/`(.*?)`/g, '$1')        // Remove `code` formatting
    .trim()
}

/**
 * Extract numerical score from text - improved to handle various formats
 */
export function extractScore(text: string, keyword: string): number | null {
  console.log(`🔍 Searching for ${keyword} score in text...`)
  
  // Try multiple patterns to find scores, ordered by specificity
  const patterns = [
    // Handle "**OVERALL SCORE:** 90 - description" format with dash separator (matches our user's actual format)
    new RegExp(`\\*\\*${keyword}\\s+SCORE:\\*\\*\\s*([0-9]{1,3})\\s*-`, "i"), // "**OVERALL SCORE:** 90 - "
    // Handle "**OVERALL SCORE:** 90" format without dash
    new RegExp(`\\*\\*${keyword}\\s+SCORE:\\*\\*\\s*([0-9]{1,3})`, "i"), // "**OVERALL SCORE:** 90"
    // Handle "**PRONUNCIATION:** 92" format (current AI format) - CORRECTED!
    new RegExp(`\\*\\*${keyword}:\\*\\*\\s*([0-9]{1,3})`, "i"), // "**PRONUNCIATION:** 92"
    // Most specific first - exact keyword followed by colon and number
    new RegExp(`\\b${keyword}\\s*:\\s*([0-9]{1,3})\\b`, "i"), // "Pronunciation: 98"
    new RegExp(`${keyword}\\s+score\\s*:\\s*([0-9]{1,3})\\b`, "i"), // "Pronunciation score: 98"
    new RegExp(`${keyword}[^\\d]*\\(?([0-9]{1,3})/100\\)?`, "i"), // "Pronunciation (98/100)"
    new RegExp(`${keyword}[^\\d]*([0-9]{1,3})%`, "i"), // "Pronunciation 98%"
    new RegExp(`([0-9]{1,3})/100[^\\w]*${keyword}`, "i") // "98/100 Pronunciation"
  ]
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i]
    const match = text.match(pattern)
    if (match && match[1]) {
      const score = parseInt(match[1])
      if (score >= 0 && score <= 100) {
        console.log(`✅ Extracted ${keyword} score: ${score} (pattern ${i + 1})`)
        return score
      }
    }
  }
  
  console.log(`⚠️ Could not extract ${keyword} score from response`)
  return null
}

/**
 * Extract main feedback from response - improved to capture AI's detailed analysis
 */
export function extractFeedback(text: string): string {
  // Look for detailed feedback section first
  const detailedFeedbackMatch = text.match(/\*\*DETAILED FEEDBACK:\*\*([\s\S]*?)(?:\*\*|$)/i)
  if (detailedFeedbackMatch && detailedFeedbackMatch[1]) {
    return cleanMarkdown(detailedFeedbackMatch[1].trim())
  }
  
  // Look for video analysis section
  const videoAnalysisMatch = text.match(/\*\*VIDEO ANALYSIS:\*\*([\s\S]*?)(?:\*\*|$)/i)
  if (videoAnalysisMatch && videoAnalysisMatch[1]) {
    return cleanMarkdown(videoAnalysisMatch[1].trim())
  }
  
  // Fallback: extract meaningful content lines
  const lines = text.split('\n')
    .filter(line => {
      const trimmed = line.trim()
      return trimmed.length > 20 && 
             !trimmed.startsWith('**') && 
             !trimmed.match(/^[-•*]\s+/) &&
             !trimmed.match(/^\d+\.\s+/) &&
             !trimmed.includes('SCORE') &&
             !trimmed.includes('DETECTED')
    })
    .slice(0, 5)
    .join(' ')
    .trim()
  
  return cleanMarkdown(lines) || cleanMarkdown(text.substring(0, 300))
}

/**
 * Extract bullet points from text - improved to handle AI response formats
 */
export function extractBulletPoints(text: string, keyword: string): string[] {
  const lines = text.split('\n')
  const results: string[] = []
  let inSection = false
  
  // First, try to find the specific section
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Check if we're entering the relevant section (more flexible matching)
    if (new RegExp(`\\*\\*\\s*${keyword}\\s*:?\\*\\*`, 'i').test(trimmed)) {
      inSection = true
      continue
    }
    
    // If we're in the section, look for bullet points
    if (inSection) {
      // Stop if we hit another major section (marked with **)
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 5) {
        break
      }
      
      // Extract bullet points (support various formats)
      if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        const cleanLine = trimmed.replace(/^[-•*\d+\.\s]*/, '').trim()
        if (cleanLine.length > 3) {
          results.push(cleanMarkdown(cleanLine))
        }
      }
    }
  }
  
  // If no specific section found, try to extract any bullet points mentioning the keyword
  if (results.length === 0) {
    for (const line of lines) {
      const trimmed = line.trim()
      if ((trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) && 
          new RegExp(keyword, 'i').test(trimmed)) {
        const cleanLine = trimmed.replace(/^[-•*\d+\.\s]*/, '').trim()
        if (cleanLine.length > 5) {
          results.push(cleanMarkdown(cleanLine))
        }
      }
    }
  }
  
  console.log(`✅ Extracted ${results.length} ${keyword} items:`, results.slice(0, 3))
  return results.slice(0, 8) // Limit to 8 items for display
}

/**
 * Extract category feedback - simplified
 */
export function extractCategoryFeedback(text: string, category: string): string {
  const pattern = new RegExp(`${category}[^:]*:([^\\n]*(?:\\n[^\\n]*){0,2})`, "i")
  const match = text.match(pattern)
  
  if (match && match[1]) {
    return cleanMarkdown(match[1].trim())
  }
  
  return extractFeedback(text) // Fallback to general feedback
}
