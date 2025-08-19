/**
 * Single Chat Service
 * Handles chat functionality when no specific AI is selected
 * Uses the general English learning assistant prompt similar to community chatbox
 */

import { generateUUID } from '@/lib/uuid-utils';
import { systemConfigService } from './system-config'
import type { DefaultAssistantConfig } from '@/types/system-config.types'

export interface SingleChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'assistant';
}

export class SingleChatService {
  private static instance: SingleChatService;
  private defaultAssistantConfig: DefaultAssistantConfig | null = null;
  private configCacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  public static getInstance(): SingleChatService {
    if (!SingleChatService.instance) {
      SingleChatService.instance = new SingleChatService();
      // Initialize config when creating instance
      SingleChatService.instance.initializeConfig().catch(console.error);
    }
    return SingleChatService.instance;
  }

  /**
   * Get cached default assistant config or fetch from database
   */
  private async getDefaultAssistantConfig(): Promise<DefaultAssistantConfig> {
    // Check cache first
    if (this.defaultAssistantConfig && Date.now() < this.configCacheExpiry) {
      return this.defaultAssistantConfig;
    }

    try {
      // Fetch from database
      const config = await systemConfigService.getDefaultAssistant();
      
      // Cache the result
      this.defaultAssistantConfig = config;
      this.configCacheExpiry = Date.now() + this.CACHE_DURATION;
      
      return config;
    } catch (error) {
      console.error('Error fetching default assistant config:', error);
      
      // Return fallback config
      const fallbackConfig: DefaultAssistantConfig = {
        id: 'hani-default',
        name: 'Hani',
        avatar: 'https://yvsjynosfwyhvisqhasp.supabase.co/storage/v1/object/public/posts/images/825ef58d-31bc-4ad9-9c99-ed7fb15cf8a1.jfif',
        role: 'Assistant',
        field: 'Assistant',
        prompt: 'You are Hani, a friendly AI assistant specialized in English learning. You help students improve their English skills through conversation, grammar correction, vocabulary building, and providing helpful explanations. Always be encouraging, patient, and provide clear examples.',
        model: 'gemini-2.5-flash'
      };
      
      this.defaultAssistantConfig = fallbackConfig;
      this.configCacheExpiry = Date.now() + this.CACHE_DURATION;
      
      return fallbackConfig;
    }
  }

  /**
   * Clear the config cache (useful when config is updated)
   */
  public clearConfigCache(): void {
    this.defaultAssistantConfig = null;
    this.configCacheExpiry = 0;
  }

  /**
   * Initialize the assistant config (can be called publicly)
   */
  public async initializeConfig(): Promise<void> {
    await this.getDefaultAssistantConfig();
  }

  /**
   * Send a message to the general English learning assistant
   */
  async sendMessage(message: string): Promise<{ content: string; highlights?: string[]; vocabulary?: any[] }> {
    try {
      // Get dynamic assistant config
      const assistantConfig = await this.getDefaultAssistantConfig();
      
      const systemPrompt = `${assistantConfig.prompt}

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

Remember: You are ${assistantConfig.name}, always respond with both Main Answer and English Learning Tips sections. The content never over 100 words.

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
   * Synchronous getters for immediate use (uses cached config)
   */
  getAssistantAvatar(): string {
    const avatar = this.defaultAssistantConfig?.avatar || 'https://yvsjynosfwyhvisqhasp.supabase.co/storage/v1/object/public/posts/images/825ef58d-31bc-4ad9-9c99-ed7fb15cf8a1.jfif';

    return avatar;
  }

  getAssistantName(): string {
    return this.defaultAssistantConfig?.name || 'Hani';
  }

  getAssistantCharacter() {
    const config = this.defaultAssistantConfig;
    if (config) {
      return {
        id: config.id,
        name: config.name,
        role: config.role,
        field: config.field,
        description: `Your personal English learning assistant ${config.name}`,
        avatar: config.avatar,
        online: true,
        animation: ''
      };
    }

    // Fallback
    return {
      id: 'hani-default',
      name: 'Hani',
      role: 'Assistant',
      field: 'Assistant',
      description: 'Your personal English learning assistant Hani',
      avatar: 'https://yvsjynosfwyhvisqhasp.supabase.co/storage/v1/object/public/posts/images/825ef58d-31bc-4ad9-9c99-ed7fb15cf8a1.jfif',
      online: true,
      animation: ''
    };
  }

  /**
   * Async getters for when you need fresh data from database
   */
  async getAssistantAvatarAsync(): Promise<string> {
    try {
      const config = await this.getDefaultAssistantConfig();
      return config.avatar;
    } catch (error) {
      console.error('Error getting assistant avatar:', error);
      return 'https://yvsjynosfwyhvisqhasp.supabase.co/storage/v1/object/public/posts/images/825ef58d-31bc-4ad9-9c99-ed7fb15cf8a1.jfif';
    }
  }

  async getAssistantNameAsync(): Promise<string> {
    try {
      const config = await this.getDefaultAssistantConfig();
      return config.name;
    } catch (error) {
      console.error('Error getting assistant name:', error);
      return 'Hani';
    }
  }

  async getAssistantCharacterAsync() {
    try {
      const config = await this.getDefaultAssistantConfig();
      return {
        id: config.id,
        name: config.name,
        role: config.role,
        field: config.field,
        description: `Your personal English learning assistant ${config.name}`,
        avatar: config.avatar,
        online: true,
        animation: ''
      };
    } catch (error) {
      console.error('Error getting assistant character:', error);
      return {
        id: 'hani-default',
        name: 'Hani',
        role: 'Assistant',
        field: 'Assistant',
        description: 'Your personal English learning assistant Hani',
        avatar: 'https://yvsjynosfwyhvisqhasp.supabase.co/storage/v1/object/public/posts/images/825ef58d-31bc-4ad9-9c99-ed7fb15cf8a1.jfif',
        online: true,
        animation: ''
      };
    }
  }

  /**
   * Initialize the service by loading config from database
   */
  async initialize(): Promise<void> {
    try {
      await this.getDefaultAssistantConfig();
    } catch (error) {
      console.error('Error initializing single chat service:', error);
    }
  }

  /**
   * Generate a unique message ID
   */
  generateMessageId(): string {
    return generateUUID();
  }
}

export const singleChatService = SingleChatService.getInstance();
