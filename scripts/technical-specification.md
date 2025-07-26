# 🔧 Technical Specification: Multi-AI Chat System

## 📋 **TECHNICAL REQUIREMENTS**

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │    │   External APIs │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React 19      │    │ • Next.js 15    │    │ • Gemini AI     │
│ • TypeScript    │───▶│ • API Routes    │───▶│ • Supabase      │
│ • Tailwind CSS  │    │ • WebSocket     │    │ • Redis Cache   │
│ • Real-time UI  │    │ • Queue System  │    │ • Monitoring    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Performance Requirements
- **Response Time**: <2s for multi-AI responses
- **Concurrent Users**: Support 1000+ simultaneous users
- **Uptime**: 99.9% availability
- **Scalability**: Horizontal scaling capability

---

## 🗄️ **DATABASE SCHEMA DETAILS**

### Complete SQL Implementation

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AI Personalities Table
CREATE TABLE ai_personalities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(100) NOT NULL,
    field VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    personality_prompt TEXT NOT NULL,
    conversation_style JSONB DEFAULT '{
        "tone": "friendly",
        "formality": "medium", 
        "enthusiasm": "medium",
        "technical_level": "medium"
    }',
    response_probability DECIMAL(3,2) DEFAULT 0.7 CHECK (response_probability >= 0 AND response_probability <= 1),
    expertise_areas TEXT[] DEFAULT '{}',
    interaction_rules JSONB DEFAULT '{
        "max_response_length": 200,
        "vocabulary_focus": true,
        "can_initiate": false,
        "response_delay_ms": 1000
    }',
    priority_level INTEGER DEFAULT 5 CHECK (priority_level >= 1 AND priority_level <= 10),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ai_personalities_status ON ai_personalities(status);
CREATE INDEX idx_ai_personalities_field ON ai_personalities(field);
CREATE INDEX idx_ai_personalities_priority ON ai_personalities(priority_level DESC);

-- Chat Sessions Table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References auth.users(id) but flexible for different auth systems
    title VARCHAR(200) NOT NULL,
    ai_participants UUID[] NOT NULL DEFAULT '{}',
    context_summary TEXT DEFAULT '',
    conversation_mode VARCHAR(20) DEFAULT 'mixed' CHECK (conversation_mode IN ('user_only', 'ai_interactive', 'mixed')),
    session_settings JSONB DEFAULT '{
        "max_ai_responses": 3,
        "response_delay": 1500,
        "vocabulary_learning": true,
        "difficulty_level": "medium"
    }',
    vocabulary_learned INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    total_cost_usd DECIMAL(10,6) DEFAULT 0,
    engagement_score DECIMAL(3,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_active ON chat_sessions(is_active, updated_at DESC);
CREATE INDEX idx_chat_sessions_expires ON chat_sessions(expires_at) WHERE is_active = true;

-- Messages Table  
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL, -- 'user' or AI personality UUID
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'ai', 'system')),
    content TEXT NOT NULL,
    message_metadata JSONB DEFAULT '{}',
    vocabulary_extracted JSONB DEFAULT '[]',
    response_to UUID REFERENCES messages(id),
    ai_confidence_score DECIMAL(3,2) CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
    processing_time_ms INTEGER DEFAULT 0,
    api_cost_usd DECIMAL(8,6) DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_messages_session_id ON messages(session_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id, sender_type);
CREATE INDEX idx_messages_response_to ON messages(response_to) WHERE response_to IS NOT NULL;

-- Vocabulary Bank Table
CREATE TABLE vocabulary_bank (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    term VARCHAR(100) NOT NULL,
    pronunciation VARCHAR(200),
    meaning TEXT NOT NULL,
    example_sentence TEXT,
    category VARCHAR(50) DEFAULT 'general',
    difficulty_level VARCHAR(10) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    source_message_id UUID REFERENCES messages(id),
    usage_count INTEGER DEFAULT 1,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
    is_favorite BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, term)
);

-- Create indexes
CREATE INDEX idx_vocabulary_user_id ON vocabulary_bank(user_id, created_at DESC);  
CREATE INDEX idx_vocabulary_category ON vocabulary_bank(category);
CREATE INDEX idx_vocabulary_difficulty ON vocabulary_bank(difficulty_level);
CREATE INDEX idx_vocabulary_mastery ON vocabulary_bank(mastery_level);
CREATE UNIQUE INDEX idx_vocabulary_user_term ON vocabulary_bank(user_id, LOWER(term));

-- Learning Progress Table
CREATE TABLE learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_id UUID REFERENCES chat_sessions(id),
    date DATE DEFAULT CURRENT_DATE,
    vocabulary_learned INTEGER DEFAULT 0,
    vocabulary_reviewed INTEGER DEFAULT 0,
    concepts_discussed TEXT[] DEFAULT '{}',
    engagement_score DECIMAL(3,2) DEFAULT 0,
    session_duration_minutes INTEGER DEFAULT 0,
    ai_interactions_count INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    learning_goals_met TEXT[] DEFAULT '{}',
    difficulty_progression JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, session_id, date)
);

-- Create indexes
CREATE INDEX idx_learning_progress_user_date ON learning_progress(user_id, date DESC);
CREATE INDEX idx_learning_progress_session ON learning_progress(session_id);

-- API Usage Tracking Table  
CREATE TABLE api_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id),
    ai_personality_id UUID REFERENCES ai_personalities(id),
    request_type VARCHAR(50) NOT NULL,
    tokens_used INTEGER NOT NULL,
    cost_usd DECIMAL(8,6) NOT NULL,
    response_time_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_api_usage_session ON api_usage_logs(session_id, created_at DESC);
CREATE INDEX idx_api_usage_ai ON api_usage_logs(ai_personality_id, created_at DESC);
CREATE INDEX idx_api_usage_cost ON api_usage_logs(created_at DESC, cost_usd);

-- System Health Metrics Table
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_system_metrics_type_time ON system_metrics(metric_type, created_at DESC);
```

### Sample Data Inserts

```sql
-- Insert sample AI personalities
INSERT INTO ai_personalities (name, role, field, personality_prompt, expertise_areas, response_probability) VALUES
(
    'Emma Thompson',
    'Business English Coach', 
    'Business',
    'Bạn là Emma Thompson, một huấn luyện viên tiếng Anh thương mại giàu kinh nghiệm. Tính cách thân thiện, chuyên nghiệp và luôn khuyến khích học viên. Bạn có 15 năm kinh nghiệm trong việc đào tạo giao tiếp kinh doanh và thuyết trình.',
    ARRAY['business_communication', 'presentations', 'meetings', 'negotiations', 'email_writing'],
    0.85
),
(
    'Alex Rodriguez',
    'AI Technology Instructor',
    'Technology', 
    'Bạn là Alex Rodriguez, một chuyên gia công nghệ AI trẻ tuổi và năng động. Phong cách giao tiếp hiện đại, thích sử dụng các thuật ngữ công nghệ và luôn cập nhật xu hướng mới. Bạn giỏi giải thích các khái niệm phức tạp một cách đơn giản.',
    ARRAY['artificial_intelligence', 'programming', 'software_development', 'data_science'],
    0.75
),
(
    'Sarah Johnson',
    'Daily Conversation Partner',
    'Daily Life',
    'Bạn là Sarah Johnson, một người bạn thân thiện và gần gũi. Phong cách trò chuyện tự nhiên, thích chia sẻ về cuộc sống hàng ngày, sở thích và trải nghiệm cá nhân. Bạn luôn tạo không khí thoải mái và vui vẻ.',
    ARRAY['daily_conversation', 'hobbies', 'travel', 'food', 'lifestyle'],
    0.70
);
```

---

## 🔧 **API IMPLEMENTATION**

### Core API Endpoints

#### 1. Multi-AI Chat Endpoint
```typescript
// app/api/chat/multi-ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AIOrchestrator } from '@/lib/ai-orchestrator';
import { VocabularyExtractor } from '@/lib/vocabulary-extractor';
import { ChatSessionManager } from '@/lib/chat-session-manager';
import { CostTracker } from '@/lib/cost-tracker';

export async function POST(request: NextRequest) {
    try {
        const { 
            message, 
            sessionId, 
            selectedAIs, 
            userId 
        } = await request.json();

        // Validate input
        if (!message || !sessionId || !selectedAIs?.length) {
            return NextResponse.json(
                { error: 'Missing required fields' }, 
                { status: 400 }
            );
        }

        // Initialize services
        const orchestrator = new AIOrchestrator();
        const vocabularyExtractor = new VocabularyExtractor();
        const sessionManager = new ChatSessionManager();
        const costTracker = new CostTracker();

        // Get session context
        const session = await sessionManager.getSession(sessionId);
        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' }, 
                { status: 404 }
            );
        }

        // Build conversation context
        const context = await sessionManager.buildContext(sessionId, 10); // Last 10 messages

        // Process with AI Orchestrator
        const startTime = Date.now();
        const aiResponses = await orchestrator.processMessage({
            userMessage: message,
            sessionId,
            selectedAIs,
            conversationHistory: context.messages,
            currentTopic: context.summary
        });

        const processingTime = Date.now() - startTime;

        // Extract vocabulary from all responses
        const allVocabulary = [];
        for (const response of aiResponses) {
            const vocabulary = await vocabularyExtractor.extract(
                response.content, 
                context.summary
            );
            allVocabulary.push(...vocabulary);
        }

        // Save everything to database
        await Promise.all([
            // Save user message
            sessionManager.saveMessage({
                sessionId,
                senderId: 'user',
                senderType: 'user',
                content: message
            }),
            
            // Save AI responses
            ...aiResponses.map(response => 
                sessionManager.saveMessage({
                    sessionId,
                    senderId: response.aiId,
                    senderType: 'ai',
                    content: response.content,
                    vocabularyExtracted: response.vocabulary,
                    aiConfidenceScore: response.confidence,
                    processingTimeMs: response.processingTime,
                    apiCostUsd: response.cost,
                    tokensUsed: response.tokens
                })
            ),
            
            // Save vocabulary
            vocabularyExtractor.saveVocabulary(userId, allVocabulary, sessionId),
            
            // Update learning progress
            sessionManager.updateProgress(userId, sessionId, {
                vocabularyLearned: allVocabulary.length,
                aiInteractions: aiResponses.length,
                messagesSent: 1
            }),
            
            // Track costs
            costTracker.trackUsage(sessionId, aiResponses)
        ]);

        // Return response
        return NextResponse.json({
            success: true,
            responses: aiResponses.map(r => ({
                id: r.id,
                aiId: r.aiId,
                aiName: r.aiName,
                content: r.content,
                vocabulary: r.vocabulary,
                confidence: r.confidence,
                timestamp: new Date().toISOString()
            })),
            vocabulary: allVocabulary,
            processingTime,
            totalCost: aiResponses.reduce((sum, r) => sum + r.cost, 0)
        });

    } catch (error) {
        console.error('Multi-AI chat error:', error);
        return NextResponse.json(
            { 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            }, 
            { status: 500 }
        );
    }
}
```

#### 2. AI Orchestrator Implementation
```typescript
// lib/ai-orchestrator.ts
import { GeminiAPI } from './gemini-api';
import { AIPersonality, ConversationContext, AIResponse } from './types';

export class AIOrchestrator {
    private geminiAPI: GeminiAPI;
    
    constructor() {
        this.geminiAPI = new GeminiAPI();
    }

    async processMessage(context: ProcessingContext): Promise<AIResponse[]> {
        const responses: AIResponse[] = [];
        
        // 1. Select primary AI (highest priority or most relevant)
        const primaryAI = await this.selectPrimaryAI(context);
        const primaryResponse = await this.generateResponse(primaryAI, context);
        responses.push(primaryResponse);

        // 2. Determine if other AIs should respond
        const secondaryAIs = await this.selectSecondaryAIs(context, primaryAI);
        
        for (const ai of secondaryAIs) {
            if (await this.shouldAIRespond(ai, context, primaryResponse)) {
                const response = await this.generateResponse(ai, {
                    ...context,
                    previousResponse: primaryResponse
                });
                responses.push(response);
            }
        }

        // 3. Optimize response order and content
        return this.optimizeResponses(responses);
    }

    private async selectPrimaryAI(context: ProcessingContext): Promise<AIPersonality> {
        const { selectedAIs, userMessage, conversationHistory } = context;
        
        // Calculate relevance scores
        const scores = await Promise.all(
            selectedAIs.map(async ai => ({
                ai,
                score: await this.calculateRelevanceScore(ai, userMessage, conversationHistory)
            }))
        );

        // Return AI with highest score
        return scores.sort((a, b) => b.score - a.score)[0].ai;
    }

    private async shouldAIRespond(
        ai: AIPersonality, 
        context: ProcessingContext, 
        primaryResponse: AIResponse
    ): Promise<boolean> {
        // Factors for AI response decision
        const factors = {
            relevance: await this.calculateMessageRelevance(ai, context.userMessage),
            personalityMatch: this.calculatePersonalityCompatibility(ai, primaryResponse),
            conversationFlow: this.analyzeConversationFlow(context.conversationHistory),
            timeSinceLastResponse: this.getTimeSinceLastResponse(ai, context.conversationHistory),
            randomFactor: Math.random()
        };

        // Weighted probability calculation
        const probability = (
            factors.relevance * 0.3 +
            factors.personalityMatch * 0.25 +
            factors.conversationFlow * 0.2 +
            factors.timeSinceLastResponse * 0.15 +
            factors.randomFactor * 0.1
        );

        return probability > ai.response_probability;
    }

    private async generateResponse(
        ai: AIPersonality, 
        context: ProcessingContext
    ): Promise<AIResponse> {
        const prompt = this.buildPrompt(ai, context);
        const startTime = Date.now();
        
        try {
            const response = await this.geminiAPI.generateResponse(prompt, {
                maxTokens: ai.interaction_rules.max_response_length || 200,
                temperature: 0.7,
                model: 'gemini-pro'
            });

            const processingTime = Date.now() - startTime;

            return {
                id: crypto.randomUUID(),
                aiId: ai.id,
                aiName: ai.name,
                content: response.content,
                vocabulary: this.extractVocabularyTags(response.content),
                confidence: response.confidence || 0.8,
                processingTime,
                cost: response.cost || 0.002,
                tokens: response.tokens || 100,
                timestamp: new Date()
            };

        } catch (error) {
            console.error(`AI response generation failed for ${ai.name}:`, error);
            throw error;
        }
    }

    private buildPrompt(ai: AIPersonality, context: ProcessingContext): string {
        const recentMessages = context.conversationHistory
            .slice(-5)
            .map(m => `${m.sender_type === 'user' ? 'User' : m.sender_id}: ${m.content}`)
            .join('\n');

        return `
## AI Identity
Name: ${ai.name}
Role: ${ai.role}
Field: ${ai.field}
Personality: ${ai.personality_prompt}

## Conversation Style
${JSON.stringify(ai.conversation_style, null, 2)}

## Current Context
Recent conversation:
${recentMessages}

Current user message: "${context.userMessage}"

## Response Guidelines
1. Respond in character as ${ai.name}
2. Keep response under ${ai.interaction_rules.max_response_length || 200} characters
3. Use vocabulary appropriate for ${ai.field}
4. Include new vocabulary using format: [VOCAB:term|pronunciation|meaning|example]
5. Be helpful and engaging
6. ${context.previousResponse ? `Acknowledge the previous AI response naturally` : ''}

Generate your response:`;
    }

    private optimizeResponses(responses: AIResponse[]): AIResponse[] {
        // Remove duplicate content
        const unique = this.removeDuplicateContent(responses);
        
        // Sort by relevance and timing
        const sorted = unique.sort((a, b) => {
            // Primary AI response first
            if (a.confidence > b.confidence) return -1;
            if (a.confidence < b.confidence) return 1;
            return 0;
        });

        return sorted;
    }

    private removeDuplicateContent(responses: AIResponse[]): AIResponse[] {
        const seen = new Set<string>();
        return responses.filter(response => {
            const contentHash = this.hashContent(response.content);
            if (seen.has(contentHash)) return false;
            seen.add(contentHash);
            return true;
        });
    }

    private hashContent(content: string): string {
        // Simple content similarity hash
        return content
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(' ')
            .sort()
            .join('');
    }
}

interface ProcessingContext {
    userMessage: string;
    sessionId: string;
    selectedAIs: AIPersonality[];
    conversationHistory: Message[];
    currentTopic?: string;
    previousResponse?: AIResponse;
}
```

#### 3. Vocabulary Extractor
```typescript
// lib/vocabulary-extractor.ts
export class VocabularyExtractor {
    private geminiAPI: GeminiAPI;
    
    constructor() {
        this.geminiAPI = new GeminiAPI();
    }

    async extract(content: string, context: string): Promise<VocabularyItem[]> {
        // 1. Extract explicit vocabulary tags
        const explicitVocab = this.parseVocabularyTags(content);
        
        // 2. Extract implicit vocabulary using AI
        const implicitVocab = await this.extractImplicitVocabulary(content, context);
        
        // 3. Merge and validate
        return this.validateAndMerge(explicitVocab, implicitVocab);
    }

    private parseVocabularyTags(text: string): VocabularyItem[] {
        const vocabRegex = /\[VOCAB:([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;
        const matches = Array.from(text.matchAll(vocabRegex));
        
        return matches.map(match => ({
            term: match[1].trim(),
            pronunciation: match[2].trim(), 
            meaning: match[3].trim(),
            example: match[4].trim(),
            difficulty: this.assessDifficulty(match[1]),
            category: this.categorizeWord(match[1]),
            confidence: 1.0 // Explicit tags have high confidence
        }));
    }

    private async extractImplicitVocabulary(
        content: string, 
        context: string
    ): Promise<VocabularyItem[]> {
        const prompt = `
Analyze the following text and extract 1-3 key vocabulary words that would be useful for English learners.

Context: ${context}
Text to analyze: "${content}"

For each vocabulary word, provide:
1. The word/phrase
2. Pronunciation (IPA format)
3. Meaning in Vietnamese
4. A simple example sentence
5. Difficulty level (easy/medium/hard)
6. Category (business/daily/technology/etc)

Format as JSON array:
[{"term": "word", "pronunciation": "pronunciation", "meaning": "meaning", "example": "example", "difficulty": "level", "category": "category"}]

Only extract words that are:
- Not too basic (avoid words like "the", "and", "is")
- Actually present in the original text
- Useful for language learning
- Not proper nouns unless they're commonly used

Return only the JSON array, no other text.`;

        try {
            const response = await this.geminiAPI.generateResponse(prompt, {
                maxTokens: 300,
                temperature: 0.3
            });

            const parsed = JSON.parse(response.content);
            return Array.isArray(parsed) ? parsed.map(item => ({
                ...item,
                confidence: 0.8 // AI-extracted has lower confidence
            })) : [];

        } catch (error) {
            console.error('Implicit vocabulary extraction failed:', error);
            return [];
        }
    }

    private validateAndMerge(
        explicit: VocabularyItem[], 
        implicit: VocabularyItem[]
    ): VocabularyItem[] {
        const merged = [...explicit];
        const existingTerms = new Set(explicit.map(v => v.term.toLowerCase()));

        // Add implicit vocabulary that doesn't already exist
        for (const item of implicit) {
            if (!existingTerms.has(item.term.toLowerCase())) {
                merged.push(item);
                existingTerms.add(item.term.toLowerCase());
            }
        }

        // Sort by confidence and relevance
        return merged
            .filter(item => this.isValidVocabulary(item))
            .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
            .slice(0, 5); // Limit to top 5 items
    }

    private isValidVocabulary(item: VocabularyItem): boolean {
        return (
            item.term &&
            item.term.length > 1 &&
            item.term.length < 50 &&
            item.meaning &&
            !this.isStopWord(item.term)
        );
    }

    private isStopWord(word: string): boolean {
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
        ]);
        return stopWords.has(word.toLowerCase());
    }

    async saveVocabulary(
        userId: string, 
        vocabulary: VocabularyItem[], 
        sessionId: string
    ): Promise<void> {
        if (!vocabulary.length) return;

        const { data, error } = await supabase
            .from('vocabulary_bank')
            .upsert(
                vocabulary.map(item => ({
                    user_id: userId,
                    term: item.term,
                    pronunciation: item.pronunciation,
                    meaning: item.meaning,
                    example_sentence: item.example,
                    category: item.category,
                    difficulty_level: item.difficulty,
                    source_session_id: sessionId,
                    usage_count: 1
                })),
                { 
                    onConflict: 'user_id,term',
                    ignoreDuplicates: false
                }
            );

        if (error) {
            console.error('Failed to save vocabulary:', error);
            throw error;
        }
    }

    private assessDifficulty(term: string): 'easy' | 'medium' | 'hard' {
        const length = term.length;
        const commonWords = ['good', 'make', 'time', 'work', 'day', 'way', 'new', 'use'];
        
        if (commonWords.includes(term.toLowerCase()) || length <= 4) {
            return 'easy';
        } else if (length <= 8) {
            return 'medium';
        } else {
            return 'hard';
        }
    }

    private categorizeWord(term: string): string {
        const businessWords = ['meeting', 'presentation', 'project', 'deadline', 'client'];
        const techWords = ['software', 'algorithm', 'data', 'system', 'network'];
        const dailyWords = ['breakfast', 'weather', 'family', 'friend', 'hobby'];

        const lowerTerm = term.toLowerCase();
        
        if (businessWords.some(word => lowerTerm.includes(word))) return 'business';
        if (techWords.some(word => lowerTerm.includes(word))) return 'technology';
        if (dailyWords.some(word => lowerTerm.includes(word))) return 'daily';
        
        return 'general';
    }
}
```

---

## 🔄 **REAL-TIME SYSTEM**

### WebSocket Implementation
```typescript
// lib/websocket-manager.ts
import { Server } from 'socket.io';
import { createServer } from 'http';

export class ChatWebSocketManager {
    private io: Server;
    private sessionConnections = new Map<string, Set<string>>();

    constructor(server: any) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.NEXT_PUBLIC_APP_URL,
                methods: ['GET', 'POST']
            }
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('join_session', (sessionId: string) => {
                socket.join(sessionId);
                
                if (!this.sessionConnections.has(sessionId)) {
                    this.sessionConnections.set(sessionId, new Set());
                }
                this.sessionConnections.get(sessionId)!.add(socket.id);
                
                console.log(`Client ${socket.id} joined session ${sessionId}`);
            });

            socket.on('leave_session', (sessionId: string) => {
                socket.leave(sessionId);
                this.sessionConnections.get(sessionId)?.delete(socket.id);
                
                console.log(`Client ${socket.id} left session ${sessionId}`);
            });

            socket.on('disconnect', () => {
                // Clean up connections
                for (const [sessionId, connections] of this.sessionConnections.entries()) {
                    connections.delete(socket.id);
                    if (connections.size === 0) {
                        this.sessionConnections.delete(sessionId);
                    }
                }
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    async broadcastMultiAIResponses(sessionId: string, responses: AIResponse[]) {
        // Show typing indicators first
        this.io.to(sessionId).emit('ai_typing', {
            aiIds: responses.map(r => r.aiId),
            timestamp: Date.now()
        });

        // Send responses with staggered timing
        for (let i = 0; i < responses.length; i++) {
            const response = responses[i];
            const delay = i * 1500; // 1.5s between responses

            setTimeout(() => {
                this.io.to(sessionId).emit('ai_response', {
                    ...response,
                    order: i,
                    total: responses.length,
                    timestamp: Date.now()
                });

                // Clear typing indicator for this AI
                this.io.to(sessionId).emit('ai_stop_typing', {
                    aiId: response.aiId,
                    timestamp: Date.now()
                });

            }, delay);
        }

        // Clear all typing indicators after all responses
        setTimeout(() => {
            this.io.to(sessionId).emit('clear_all_typing', {
                timestamp: Date.now()
            });
        }, responses.length * 1500 + 500);
    }

    broadcastVocabularyUpdate(sessionId: string, vocabulary: VocabularyItem[]) {
        this.io.to(sessionId).emit('vocabulary_learned', {
            vocabulary,
            count: vocabulary.length,
            timestamp: Date.now()
        });
    }

    broadcastLearningProgress(sessionId: string, progress: LearningProgress) {
        this.io.to(sessionId).emit('learning_progress', {
            ...progress,
            timestamp: Date.now()
        });
    }

    getActiveConnections(sessionId: string): number {
        return this.sessionConnections.get(sessionId)?.size || 0;
    }
}
```

---

## 📊 **MONITORING & ANALYTICS**

### Performance Monitoring
```typescript
// lib/performance-monitor.ts
export class PerformanceMonitor {
    private metrics = new Map<string, number[]>();

    recordMetric(name: string, value: number) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        
        const values = this.metrics.get(name)!;
        values.push(value);
        
        // Keep only last 1000 values
        if (values.length > 1000) {
            values.shift();
        }
    }

    getMetricStats(name: string) {
        const values = this.metrics.get(name) || [];
        if (values.length === 0) return null;

        const sorted = [...values].sort((a, b) => a - b);
        return {
            count: values.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            avg: values.reduce((sum, v) => sum + v, 0) / values.length,
            p50: sorted[Math.floor(sorted.length * 0.5)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)]
        };
    }

    async saveMetrics() {
        const allMetrics = [];
        
        for (const [name, values] of this.metrics.entries()) {
            const stats = this.getMetricStats(name);
            if (stats) {
                allMetrics.push({
                    metric_type: name,
                    metric_value: stats.avg,
                    metadata: {
                        count: stats.count,
                        min: stats.min,
                        max: stats.max,
                        p95: stats.p95
                    }
                });
            }
        }

        if (allMetrics.length > 0) {
            const { error } = await supabase
                .from('system_metrics')
                .insert(allMetrics);

            if (error) {
                console.error('Failed to save metrics:', error);
            }
        }
    }
}

// Usage in API endpoints
const monitor = new PerformanceMonitor();

// Record API response time
const startTime = Date.now();
// ... API processing ...
monitor.recordMetric('api_response_time', Date.now() - startTime);

// Record AI response time  
monitor.recordMetric('ai_response_time', aiProcessingTime);

// Record vocabulary extraction time
monitor.recordMetric('vocabulary_extraction_time', vocabTime);
```

---

## 🧪 **TESTING STRATEGY**

### Unit Tests
```typescript
// __tests__/ai-orchestrator.test.ts
import { AIOrchestrator } from '@/lib/ai-orchestrator';
import { mockAIPersonalities, mockConversationContext } from './mocks';

describe('AIOrchestrator', () => {
    let orchestrator: AIOrchestrator;

    beforeEach(() => {
        orchestrator = new AIOrchestrator();
    });

    describe('processMessage', () => {
        it('should generate primary AI response', async () => {
            const context = {
                userMessage: 'Hello, how are you?',
                sessionId: 'test-session',
                selectedAIs: [mockAIPersonalities.emma],
                conversationHistory: [],
                currentTopic: 'greeting'
            };

            const responses = await orchestrator.processMessage(context);
            
            expect(responses).toHaveLength(1);
            expect(responses[0].aiId).toBe(mockAIPersonalities.emma.id);
            expect(responses[0].content).toBeTruthy();
        });

        it('should generate multiple AI responses when appropriate', async () => {
            const context = {
                userMessage: 'Can you help me with a business presentation?',
                sessionId: 'test-session',
                selectedAIs: [
                    mockAIPersonalities.emma, // Business expert
                    mockAIPersonalities.alex,  // Tech expert  
                    mockAIPersonalities.sarah  // Daily conversation
                ],
                conversationHistory: [],
                currentTopic: 'business'
            };

            const responses = await orchestrator.processMessage(context);
            
            expect(responses.length).toBeGreaterThan(1);
            expect(responses.some(r => r.aiId === mockAIPersonalities.emma.id)).toBe(true);
        });
    });

    describe('selectPrimaryAI', () => {
        it('should select most relevant AI based on message content', async () => {
            const businessMessage = 'I need help with quarterly reports';
            const techMessage = 'How do I implement machine learning?';
            
            // Test business relevance
            const businessContext = createTestContext(businessMessage);
            const businessAI = await orchestrator['selectPrimaryAI'](businessContext);
            expect(businessAI.field).toBe('Business');
            
            // Test tech relevance  
            const techContext = createTestContext(techMessage);
            const techAI = await orchestrator['selectPrimaryAI'](techContext);
            expect(techAI.field).toBe('Technology');
        });
    });
});
```

### Integration Tests
```typescript
// __tests__/integration/multi-ai-chat.test.ts
import { POST } from '@/app/api/chat/multi-ai/route';
import { createMockRequest } from './test-utils';

describe('/api/chat/multi-ai', () => {
    it('should handle multi-AI chat request', async () => {
        const request = createMockRequest({
            message: 'Help me prepare for a job interview',
            sessionId: 'test-session-123',
            selectedAIs: ['emma-id', 'alex-id'],
            userId: 'test-user'
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.responses).toHaveLength(2);
        expect(data.vocabulary).toBeDefined();
        expect(data.processingTime).toBeGreaterThan(0);
    });

    it('should handle vocabulary extraction', async () => {
        const request = createMockRequest({
            message: 'Explain machine learning algorithms',
            sessionId: 'test-session-456', 
            selectedAIs: ['alex-id'],
            userId: 'test-user'
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data.vocabulary.length).toBeGreaterThan(0);
        expect(data.vocabulary[0]).toHaveProperty('term');
        expect(data.vocabulary[0]).toHaveProperty('meaning');
        expect(data.vocabulary[0]).toHaveProperty('pronunciation');
    });
});
```

### Load Testing
```typescript
// scripts/load-test.ts
import { performance } from 'perf_hooks';

async function loadTest() {
    const concurrentUsers = 100;
    const messagesPerUser = 10;
    const totalRequests = concurrentUsers * messagesPerUser;
    
    console.log(`Starting load test: ${concurrentUsers} users, ${messagesPerUser} messages each`);
    
    const startTime = performance.now();
    const promises: Promise<any>[] = [];
    
    for (let user = 0; user < concurrentUsers; user++) {
        for (let msg = 0; msg < messagesPerUser; msg++) {
            promises.push(
                sendTestMessage(`user-${user}`, `Message ${msg} from user ${user}`)
            );
        }
    }
    
    const results = await Promise.allSettled(promises);
    const endTime = performance.now();
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    const duration = endTime - startTime;
    
    console.log(`Load Test Results:`);
    console.log(`Total requests: ${totalRequests}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);
    console.log(`Duration: ${duration.toFixed(2)}ms`);
    console.log(`Average response time: ${(duration / totalRequests).toFixed(2)}ms`);
    console.log(`Requests per second: ${(totalRequests / (duration / 1000)).toFixed(2)}`);
}

async function sendTestMessage(userId: string, message: string) {
    const response = await fetch('/api/chat/multi-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message,
            sessionId: `load-test-${userId}`,
            selectedAIs: ['emma-id', 'alex-id'],
            userId
        })
    });
    
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
    
    return response.json();
}

// Run load test
loadTest().catch(console.error);
```

---

## 🚀 **DEPLOYMENT CONFIGURATION**

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Environment Variables
```bash
# .env.production
# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI API Keys
GEMINI_API_KEY_1=your-primary-key
GEMINI_API_KEY_2=your-secondary-key
GEMINI_API_KEY_3=your-tertiary-key

# Application
NEXT_PUBLIC_APP_URL=https://your-app.com
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-app.com

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=your-sentry-dsn
ANALYTICS_API_KEY=your-analytics-key

# Cost Management
MAX_DAILY_COST_USD=100
COST_ALERT_THRESHOLD=80
```

### Vercel Deployment
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json", 
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "app/api/chat/multi-ai/route.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "GEMINI_API_KEY_1": "@gemini-api-key-1",
    "GEMINI_API_KEY_2": "@gemini-api-key-2", 
    "GEMINI_API_KEY_3": "@gemini-api-key-3",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key"
  }
}
```

---

*Document Version: 2.0*
*Last Updated: {{ current_date }}*
*Status: Ready for Implementation*
