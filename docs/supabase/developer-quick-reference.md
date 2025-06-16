# English Learning Platform - Developer Quick Reference

## 🔧 **Quick Setup Guide**

### **Environment Setup**
```bash
# 1. Clone & install dependencies
git clone <repository>
cd english-learning-platform
pnpm install

# 2. Environment configuration  
cp .env.example .env.local
# Edit .env.local với your Supabase credentials

# 3. Database setup
npx supabase start                    # Start local Supabase
npx supabase db reset                 # Reset database
node scripts/populate-sample-data.js  # Load sample data

# 4. Start development server
pnpm dev
```

### **Database Quick Commands**
```bash
# Supabase commands
npx supabase status              # Check services status
npx supabase db diff             # Generate migration
npx supabase db push             # Push changes to remote
npx supabase gen types typescript # Generate TypeScript types

# Sample data
node scripts/populate-sample-data.js    # Full sample data (31 tables)
node scripts/check-posts.js             # Verify posts data
```

---

## 📁 **Project Structure**

```
english-learning-platform/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── ai/                   # AI services
│   │   ├── cron/                 # Cron jobs
│   │   ├── learning/             # Learning system
│   │   └── community/            # Social features
│   ├── actions/                  # Server actions
│   │   ├── user-actions.ts       # User CRUD
│   │   ├── youtube-video.ts      # Video management
│   │   └── ai-evaluation.ts      # AI evaluations
│   ├── admin/                    # Admin dashboard
│   ├── auth/                     # Authentication pages
│   ├── challenges/               # Learning challenges
│   ├── community/                # Social features
│   └── profile/                  # User profiles
├── components/                   # Reusable components
│   ├── ui/                       # Shadcn/ui components
│   ├── auth/                     # Auth components
│   ├── challenge/                # Learning components
│   ├── feed/                     # Social feed
│   ├── ai-helper/                # AI assistants
│   └── youtube/                  # Video components
├── lib/                          # Utilities
│   ├── database.types.ts         # Generated types
│   ├── supabase.ts               # Supabase client
│   └── gemini-api.ts             # AI integration
├── hooks/                        # Custom React hooks
├── contexts/                     # React contexts
├── supabase/                     # Database migrations
└── docs/                         # Documentation
```

---

## 🗃️ **Database Tables Reference**

### **Core Tables (31 total)**
```sql
-- Users & Auth
users, profiles

-- Learning System  
learning_paths, challenges, resources, user_progress, challenge_submissions
achievements, user_achievements

-- Community & Social
posts, comments, likes, follows

-- Communication
messages, conversations, conversation_participants, conversation_messages
notifications, notification_templates, scheduled_messages, notification_deliveries

-- AI System
ai_assistants, ai_models, ai_safety_rules, evaluation_logs, scoring_templates

-- Daily Content
daily_videos, daily_challenges

-- Admin & Security
admin_logs, api_keys, banned_terms
```

### **Key Relationships**
```typescript
// User → Profile (1:1)
users.id → profiles.user_id

// Learning Path → Challenges (1:N)  
learning_paths.id → challenges.learning_path_id

// User Progress (M:N with unique constraint)
user_progress: (user_id, learning_path_id) UNIQUE

// Social Relationships
posts.user_id → users.id
comments.post_id → posts.id
likes: (post_id OR comment_id) + user_id

// AI Assistants
ai_assistants.created_by → users.id
evaluation_logs.user_id → users.id
```

---

## 🎯 **Common Development Patterns**

### **Database Queries với Supabase**
```typescript
// Basic CRUD operations
const { data: users } = await supabase
  .from('users')
  .select('*, profiles(*)')
  .eq('is_active', true);

// Complex joins
const { data: posts } = await supabase
  .from('posts')
  .select(`
    *,
    users!inner(name, avatar),
    comments(count),
    likes(count)
  `)
  .eq('is_public', true)
  .order('created_at', { ascending: false });

// Real-time subscriptions
supabase
  .channel('posts')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'posts' },
    handleNewPost
  )
  .subscribe();
```

### **Server Actions Pattern**
```typescript
// app/actions/post-actions.ts
'use server'

export async function createPost(formData: FormData) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: (await getUser()).id,
      content: formData.get('content'),
      post_type: 'text'
    });
    
  if (error) throw error;
  revalidatePath('/community');
  return data;
}
```

### **React Hook Pattern**
```typescript
// hooks/use-posts.ts
export function usePosts() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      setPosts(data);
    };
    
    fetchPosts();
    
    // Real-time subscription
    const subscription = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, 
        () => fetchPosts()
      )
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, []);
  
  return { posts, setPosts };
}
```

---

## 🤖 **AI Integration Patterns**

### **Gemini AI Service**
```typescript
// lib/gemini-api.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function evaluateSubmission(userAnswer: string, correctAnswer: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const prompt = `
    Evaluate this English learning submission:
    User Answer: ${userAnswer}
    Expected Answer: ${correctAnswer}
    
    Provide JSON response với:
    - score (0-100)
    - feedback (string)
    - suggestions (string[])
  `;
  
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
```

### **AI Assistant Chat**
```typescript
// components/ai-helper/ChatInterface.tsx
export function ChatInterface({ assistantId }: { assistantId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  
  const sendMessage = async (content: string) => {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ assistantId, content, messages })
    });
    
    const aiResponse = await response.json();
    setMessages(prev => [...prev, 
      { role: 'user', content },
      { role: 'assistant', content: aiResponse.content }
    ]);
  };
  
  return (
    <div className="chat-interface">
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

---

## 🔐 **Authentication Patterns**

### **Auth Context Usage**
```typescript
// contexts/auth-context.tsx
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// In components
function Profile() {
  const { user, profile, updateProfile } = useAuth();
  
  if (!user) return <LoginForm />;
  
  return <ProfileCard user={user} profile={profile} />;
}
```

### **Route Protection**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() });
  const { data: { session } } = await supabase.auth.getSession();
  
  const protectedRoutes = ['/profile', '/admin', '/challenges'];
  const isProtected = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}
```

---

## 📱 **Component Patterns**

### **UI Components với Shadcn**
```typescript
// components/ui/button.tsx (auto-generated)
import { cn } from "@/lib/utils"

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

### **Feature Components**
```typescript
// components/challenge/ChallengeCard.tsx
interface ChallengeCardProps {
  challenge: Challenge;
  onSubmit: (answer: any) => void;
  isCompleted?: boolean;
}

export function ChallengeCard({ challenge, onSubmit, isCompleted }: ChallengeCardProps) {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>{challenge.title}</CardTitle>
        <CardDescription>{challenge.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChallengeContent content={challenge.content} />
      </CardContent>
      <CardFooter>
        <SubmissionForm onSubmit={onSubmit} disabled={isCompleted} />
      </CardFooter>
    </Card>
  );
}
```

---

## 🔧 **Development Commands**

### **Daily Development**
```bash
# Start development
pnpm dev                    # Next.js dev server
npx supabase start         # Local Supabase

# Database operations  
npx supabase db reset      # Reset local DB
node scripts/populate-sample-data.js  # Load test data

# Type generation
npx supabase gen types typescript --local > lib/database.types.ts

# Testing
pnpm test                  # Run tests
node test-new-transcript-logic.js  # Test AI integration
```

### **Deployment Commands**
```bash
# Build & deploy
pnpm build                 # Production build
npx supabase db push       # Deploy migrations
pnpm start                 # Production server

# Video refresh system
npm run setup:video-windows     # Windows Task Scheduler
./scripts/setup-video-refresh-cron.sh  # Linux/Mac cron
```

---

## 🐛 **Common Issues & Solutions**

### **Database Issues**
```bash
# Connection issues
npx supabase status        # Check service status
npx supabase stop && npx supabase start  # Restart services

# Migration conflicts
npx supabase db reset      # Nuclear option
npx supabase db diff       # Check differences
```

### **TypeScript Issues**
```bash
# Regenerate types
npx supabase gen types typescript --local > lib/database.types.ts

# Clear Next.js cache
rm -rf .next
pnpm build
```

### **AI Service Issues**
```typescript
// Check API key
console.log('GEMINI_API_KEY:', !!process.env.GEMINI_API_KEY);

// Rate limiting handling
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
await delay(2000); // Wait 2 seconds between requests
```

---

## 📚 **Key Resources**

### **Documentation Links**
- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Google Gemini AI](https://ai.google.dev/docs)
- [React Hook Form](https://react-hook-form.com/)

### **Project-specific Docs**
- `docs/supabase/database-schema-analysis.md` - Database structure
- `docs/supabase/implementation-guide.md` - Implementation details  
- `docs/supabase/features-roadmap.md` - Future features
- `DAILY_VIDEO_REFRESH.md` - Daily video system
- `VIDEO_REFRESH_COMPLETED.md` - Implementation status

---

## 🚀 **Quick Start Checklist**

### **New Developer Onboarding**
- [ ] Clone repository & install dependencies
- [ ] Set up .env.local với Supabase credentials
- [ ] Start local Supabase: `npx supabase start`
- [ ] Load sample data: `node scripts/populate-sample-data.js`
- [ ] Start dev server: `pnpm dev`
- [ ] Access admin panel: http://localhost:3000/admin
- [ ] Test AI features với sample challenges
- [ ] Review database structure in Supabase Studio

### **Feature Development**
- [ ] Create feature branch
- [ ] Add database migrations if needed  
- [ ] Implement server actions
- [ ] Create/update UI components
- [ ] Add TypeScript types
- [ ] Test with sample data
- [ ] Update documentation
- [ ] Submit pull request

---

**🎯 Quick Reference Summary**: Complete development guide với setup instructions, patterns, commands, và troubleshooting cho efficient development workflow.
