// API Response Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  input_tokens: number;
  output_tokens: number;
  created_at: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
  token_stats: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    message_count: number;
  };
}

export interface ChatResponse {
  message: Message;
  provider: string;
  model: string;
}

// API Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface MessageCreate {
  content: string;
}

export interface ConversationCreate {
  title?: string;
}

export interface CodeGenerateRequest {
  description: string;
  language?: string;
  context?: string;
}

export interface CodeReviewRequest {
  code: string;
  language?: string;
  focus?: string;
}

export interface CodeExplainRequest {
  code: string;
  language?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface CodeFixRequest {
  code: string;
  error: string;
  language?: string;
}

export interface ResearchRequest {
  query: string;
  urls?: string[];
  max_sources?: number;
}

export interface ScrapeRequest {
  url: string;
}

// API Response Types for Services
export interface CodeResponse {
  content: string;
  language: string;
  provider: string;
  model: string;
}

export interface ResearchResponse {
  query: string;
  synthesis: string;
  sources: Array<{
    url: string;
    title: string;
  }>;
  provider: string;
  model: string;
}

export interface ScrapeResponse {
  url: string;
  content: string;
  metadata: Record<string, any>;
}

// UI State Types
export interface ChatState {
  conversations: Conversation[];
  currentConversation: ConversationWithMessages | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}