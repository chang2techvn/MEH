/**
 * Single Chat Service
 * Handles chat functionality when no specific AI is selected
 * Uses the general English learning assistant prompt similar to community chatbox
 */

export interface SingleChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'assistant';
}

export class SingleChatService {
  private static instance: SingleChatService;
  
  public static getInstance(): SingleChatService {
    if (!SingleChatService.instance) {
      SingleChatService.instance = new SingleChatService();
    }
    return SingleChatService.instance;
  }

  /**
   * Send a message to the general English learning assistant
   */
  async sendMessage(message: string): Promise<{ content: string; highlights?: string[]; vocabulary?: any[] }> {
    try {
      const systemPrompt = `You are Hani, an AI smartest learning assistant.
IMPORTANT RESPONSE FORMAT:
Your response must ALWAYS have exactly 2 parts:

## 📝 Main Answer
[Provide the main content answering the user's question - concise and focused]

## 💡 English Learning Tips
[Provide English learning suggestions related to the question's content - concise and focused]

FORMATTING RULES:
1. Always provide clear, structured responses using proper markdown formatting
2. Use **bold** to highlight important English words and key concepts  
3. Use numbered lists (1. 2. 3.) for step-by-step explanations
4. Use bullet points (- or *) for multiple examples or features
5. Use tables when comparing or listing items with multiple properties
6. Make links clickable using proper markdown syntax [text](url)
7. Use proper heading hierarchy (# ## ###) for better structure
8. Keep responses comprehensive but well-organized
9. Use proper line breaks and spacing for readability

FORMATTING GUIDELINES:
- Use # for main titles (avoid if possible, use ## instead)
- Use ## for main section headings  
- Use ### for subsection headings
- Use **bold** for important terms and concepts
- Use \`inline code\` for technical terms
- Use \`\`\`code blocks\`\`\` for longer code examples
- Use > blockquotes for important notes
- Use tables for comparisons or structured data
- Use proper spacing between sections
- Always use proper markdown table syntax with | separators
- For lists, keep content on same line as number/bullet to avoid line breaks

STRUCTURE EXAMPLE:
## 📝 Main Answer

Brief answer to the user's question with key information.

### Key Points
1. **First important point** - detailed explanation
2. **Second important point** - detailed explanation

## 💡 English Learning Tips

### Vocabulary Practice
| English Term | Pronunciation | Vietnamese Meaning | Example Sentence |
|--------------|---------------|--------------------|------------------|
| **optimize** | [ˈɒptɪmaɪz] | tối ưu hóa | We need to **optimize** our website |

When explaining English words or concepts:
- **Highlight the main word/concept** in bold
- Include 2-3 practical examples in a table or list format
- Use simple, easy-to-understand language

Remember: You are Hani, always respond with both Main Answer and English Learning Tips sections. The content never over 100 words.

Make your response visually appealing, educational, and perfectly formatted with proper markdown syntax.`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          systemPrompt: systemPrompt
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      let content = data.response || "I'm sorry, I couldn't generate a response. Please try again.";
      
      // Debug log to check if content is being truncated
      console.log('🔍 Single chat API response length:', content.length);
      console.log('🔍 Single chat API response preview:', content.substring(0, 200) + '...');
      console.log('🔍 Single chat API response ending:', content.substring(content.length - 100));
      
      // Return raw markdown content for ReactMarkdown to process
      
      // Extract highlights (words wrapped in ** for bold)
      const highlights: string[] = [];
      const highlightMatches = content.match(/\*\*(.*?)\*\*/g);
      if (highlightMatches) {
        highlightMatches.forEach((match: string) => {
          const text = match.replace(/\*\*/g, '');
          if (text && text.length > 1 && !highlights.includes(text)) {
            highlights.push(text);
          }
        });
      }
      
      // Also extract words in code blocks as potential vocabulary
      const codeMatches = content.match(/`([^`]+)`/g);
      if (codeMatches) {
        codeMatches.forEach((match: string) => {
          const text = match.replace(/`/g, '');
          if (text && text.length > 1 && !highlights.includes(text)) {
            highlights.push(text);
          }
        });
      }

      return {
        content, // Return raw markdown
        highlights: highlights.length > 0 ? highlights : undefined,
        vocabulary: undefined // For now, we don't extract vocabulary automatically
      };
    } catch (error) {
      console.error('Error in single chat service:', error);
      return {
        content: "I'm sorry, there was an error processing your request. Please try again."
      };
    }
  }

  /**
   * Get the default avatar/logo for single chat mode
   */
  getAssistantAvatar(): string {
    return 'https://yvsjynosfwyhvisqhasp.supabase.co/storage/v1/object/public/posts/images/825ef58d-31bc-4ad9-9c99-ed7fb15cf8a1.jfif';
  }

  /**
   * Get the assistant name for single chat mode
   */
  getAssistantName(): string {
    return 'Hani';
  }

  /**
   * Get the AI character object for single chat mode
   */
  getAssistantCharacter() {
    return {
      id: 'Hani-assistant-single',
      name: 'Hani',
      role: 'English Tutor',
      field: 'English Education',
      description: 'Your personal English learning assistant Hani',
      avatar: 'https://yvsjynosfwyhvisqhasp.supabase.co/storage/v1/object/public/posts/images/825ef58d-31bc-4ad9-9c99-ed7fb15cf8a1.jfif',
      online: true,
      animation: ''
    };
  }

  /**
   * Generate a unique message ID
   */
  generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const singleChatService = SingleChatService.getInstance();
