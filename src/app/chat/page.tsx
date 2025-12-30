'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/contexts/auth-context';
import { useChatStore } from '@/contexts/chat-context';
import { Message } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Bot,
  User,
  Zap,
  Search,
  Copy,
  Loader2,
  ArrowLeft
} from 'lucide-react';

export default function ChatPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const {
    conversations,
    currentConversation,
    isLoading,
    loadConversations,
    createConversation,
    selectConversation,
    deleteConversation,
  } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const [message, setMessage] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (currentConversation?.messages) {
      const container = document.querySelector('[data-messages-container]');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [currentConversation?.messages, streamingMessage]);

  const handleCreateConversation = async () => {
    try {
      const conversation = await createConversation('New Chat');
      setSelectedConversationId(conversation.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    await selectConversation(conversationId);
  };

  const handleSendMessage = async () => {
    if (!selectedConversationId || !message.trim()) return;

    const messageContent = message.trim();
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      conversation_id: selectedConversationId,
      role: 'user',
      content: messageContent,
      input_tokens: messageContent.length,
      output_tokens: 0,
      created_at: new Date().toISOString()
    };

    const { currentConversation } = useChatStore.getState();
    if (currentConversation) {
      const updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, userMessage],
      };
      useChatStore.setState({ currentConversation: updatedConversation });
    }

    setMessage('');
    setIsStreaming(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const reader = await apiClient.streamMessage(selectedConversationId, messageContent);
      if (!reader) throw new Error('Failed to start streaming');

      const decoder = new TextDecoder();
      let fullMessage = '';
      let aiMessageId = `ai-${Date.now()}`;

      const initialAiMessage: Message = {
        id: aiMessageId,
        conversation_id: selectedConversationId,
        role: 'assistant',
        content: '',
        input_tokens: messageContent.length,
        output_tokens: 0,
        created_at: new Date().toISOString()
      };

      const { currentConversation: convAfterUser } = useChatStore.getState();
      if (convAfterUser) {
        const updatedConversation = {
          ...convAfterUser,
          messages: [...convAfterUser.messages, initialAiMessage]
        };
        useChatStore.setState({ currentConversation: updatedConversation });
      }

      while (true) {
        if (controller.signal.aborted) break;

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullMessage += parsed.content;
                setStreamingMessage(fullMessage);

                const { currentConversation } = useChatStore.getState();
                if (currentConversation) {
                  const updatedMessages = currentConversation.messages.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, content: fullMessage, output_tokens: fullMessage.length }
                      : msg
                  );

                  useChatStore.setState({
                    currentConversation: {
                      ...currentConversation,
                      messages: updatedMessages,
                    }
                  });
                }
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }

      setStreamingMessage('');
      setIsStreaming(false);
      setAbortController(null);
      await loadConversations();
    } catch (error) {
      console.error('Send failed:', error);
      setIsStreaming(false);
      setStreamingMessage('');
      setAbortController(null);
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (confirm('Delete this conversation?')) {
      try {
        await deleteConversation(conversationId);
        if (selectedConversationId === conversationId) {
          setSelectedConversationId(null);
        }
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(c =>
    searchQuery === '' ||
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full gap-4 p-4">
      {/* CONTROL PANEL */}
      <div className="w-80 space-y-4 flex-shrink-0">
        {/* Tool Header */}
        <Card className="liquid-glass bg-slate-900/80 p-4">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back
          </Link>
          <h2 className="text-lg font-semibold text-white mt-2 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            Chat
          </h2>
          <p className="text-sm text-slate-400 mt-1">AI conversations & assistance</p>
        </Card>

        {/* Conversations List */}
        <Card className="liquid-glass bg-slate-900/80 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Conversations</h3>
              <Button
                onClick={handleCreateConversation}
                size="sm"
                variant="futuristic"
                className="h-7 px-2"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                New
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm bg-slate-900/50 border-slate-700/50"
              />
            </div>
          </div>
        </Card>

        {/* Conversation Cards */}
        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`liquid-glass p-2.5 cursor-pointer transition-all hover:scale-[1.02] group ${
                selectedConversationId === conversation.id
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : 'border-slate-800/50'
              }`}
              onClick={() => handleSelectConversation(conversation.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {conversation.title || 'Untitled'}
                  </p>
                   <p className="text-xs text-slate-400 truncate mt-0.5">
                     {conversation.updated_at ? 'Last updated ' + new Date(conversation.updated_at).toLocaleDateString() : 'No activity'}
                   </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(conversation.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conversation.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}

          {filteredConversations.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 text-slate-400/50" />
              <p className="text-sm text-slate-400">No chats yet</p>
            </div>
          )}
        </div>

        {/* Context */}
        <Card className="liquid-glass bg-slate-900/80 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Features</h3>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-blue-400" />
              <span>Real-time streaming</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="h-3.5 w-3.5 text-purple-400" />
              <span>Context-aware AI</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-green-400" />
              <span>Markdown support</span>
            </div>
          </div>
        </Card>
      </div>

      {/* WORK AREA */}
      <div className="flex-1 min-w-0">
        <Card className="h-full liquid-glass bg-slate-900/70 flex flex-col overflow-hidden">
          {selectedConversationId && currentConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-800/50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-400" />
                    {currentConversation.title || 'Chat'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="glow" className="text-xs px-2 py-0.5">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse" />
                      Online
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {currentConversation.token_stats?.message_count || 0} msgs
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                data-messages-container
                className="flex-1 overflow-y-auto p-4 space-y-2.5"
              >
                {currentConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`group flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-start gap-2 max-w-[80%]">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-300'
                      }`}>
                        {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                      </div>
                      <div className={`relative p-2.5 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-500/20 border border-blue-500/30'
                          : 'bg-slate-800/50 border border-slate-700/50'
                      }`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>

                        <div className="text-sm text-white pr-6">
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-sm prose-invert max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-1.5 text-xs text-slate-400">
                          <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {msg.role === 'assistant' && (
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {msg.output_tokens}t
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && !isStreaming && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 p-2.5 bg-slate-800/50 rounded-lg">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
                      <span className="text-sm text-slate-300">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer (Input) */}
              <div className="p-4 border-t border-slate-800/50 flex-shrink-0">
                {isStreaming && (
                  <div className="flex items-center justify-between mb-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-xs text-slate-300">Generating...</span>
                    </div>
                    <Button
                      onClick={handleStopGeneration}
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs border-red-400/50 hover:bg-red-400/10"
                    >
                      Stop
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message AI..."
                    className="flex-1 h-9 text-sm bg-slate-900/50 border-slate-700/50"
                    disabled={isLoading || isStreaming}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading || isStreaming}
                    size="sm"
                    className="h-9 px-3"
                    variant="futuristic"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>
                    {currentConversation.token_stats?.total_tokens || 0} tokens
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Streaming enabled
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-1">Start a Conversation</h3>
                  <p className="text-sm text-slate-400">Choose a prompt or create a new chat</p>
                </div>

                {/* Suggested Prompts Grid */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Suggested Prompts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { emoji: '💡', title: 'Explain a concept', prompt: 'Explain quantum computing in simple terms' },
                      { emoji: '📊', title: 'Analyze data', prompt: 'Help me analyze sales trends from this data' },
                      { emoji: '✍️', title: 'Write content', prompt: 'Write a professional email about project updates' },
                      { emoji: '🔍', title: 'Research topic', prompt: 'Research the latest developments in AI' },
                      { emoji: '🐛', title: 'Debug code', prompt: 'Help me debug this Python error' },
                      { emoji: '🧠', title: 'Brainstorm ideas', prompt: 'Brainstorm creative marketing campaign ideas' }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMessage(item.prompt)}
                        className="p-4 bg-slate-800/60 hover:scale-[1.02] border border-slate-700/50 hover:border-blue-500/50 rounded-lg text-left transition-all group"
                      >
                        <div className="text-2xl mb-2">{item.emoji}</div>
                        <div className="text-sm font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-2">{item.prompt}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Chats */}
                {conversations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Chats</h4>
                    <div className="space-y-2">
                      {conversations.slice(0, 3).map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv.id)}
                          className="w-full p-3 bg-slate-800/60 hover:scale-[1.02] border border-slate-700/50 hover:border-blue-500/50 rounded-lg text-left transition-all flex items-center gap-3 group"
                        >
                          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-4 w-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                              {conv.title || 'Untitled Chat'}
                            </div>
                            <div className="text-xs text-slate-400">
                              {new Date(conv.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-slate-400 group-hover:text-blue-400 transition-colors">→</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Chats Message */}
                {conversations.length === 0 && (
                  <div className="text-center py-8 px-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-400 mb-3">No recent chats yet</p>
                    <Button
                      onClick={handleCreateConversation}
                      variant="futuristic"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Chat
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}