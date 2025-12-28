'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/contexts/chat-context';
import { Message } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/metric-card';
import { ConversationSkeleton, MessageSkeleton } from '@/components/ui/skeleton';
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
  Activity,
  Search,
  ChevronDown,
  Copy,
  Edit,
  RotateCcw
} from 'lucide-react';

export default function ChatPage() {
  const {
    conversations,
    currentConversation,
    isLoading,
    loadConversations,
    createConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
  } = useChatStore();

  const [message, setMessage] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (currentConversation?.messages) {
      const messageContainer = document.querySelector('[data-messages-container]');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
        setIsScrolledUp(false);
      }
    }
  }, [currentConversation?.messages, streamingMessage]);

  // Detect if user scrolled up
  useEffect(() => {
    const messageContainer = document.querySelector('[data-messages-container]');
    if (messageContainer) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = messageContainer;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
        setIsScrolledUp(!isNearBottom);
      };

      messageContainer.addEventListener('scroll', handleScroll);
      return () => messageContainer.removeEventListener('scroll', handleScroll);
    }
  }, [currentConversation]);

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

  const handleSendMessage = async (useStreaming: boolean = true) => {
    if (!selectedConversationId || !message.trim()) return;

    const messageContent = message.trim();

    // Optimistically add user message to UI immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      conversation_id: selectedConversationId,
      role: 'user',
      content: messageContent,
      input_tokens: messageContent.length,
      output_tokens: 0,
      created_at: new Date().toISOString()
    };

    // Update UI immediately with user message
    const { currentConversation } = useChatStore.getState();
    if (currentConversation) {
      const updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, userMessage],
        token_stats: {
          ...currentConversation.token_stats,
          input_tokens: currentConversation.token_stats.input_tokens + userMessage.input_tokens,
          total_tokens: currentConversation.token_stats.total_tokens + userMessage.input_tokens,
          message_count: currentConversation.token_stats.message_count + 1
        }
      };
      useChatStore.setState({ currentConversation: updatedConversation });
      console.log('User message added to UI:', userMessage);
    }

    setMessage('');
    setIsStreaming(useStreaming);

    // Create abort controller for stopping generation
    const controller = new AbortController();
    setAbortController(controller);

    try {
      if (useStreaming) {
        // Start streaming - this saves user message and streams AI response
        const reader = await apiClient.streamMessage(selectedConversationId, messageContent);
        if (!reader) {
          throw new Error('Failed to start streaming');
        }
        const decoder = new TextDecoder();

        let fullMessage = '';
        let aiMessageId = `ai-${Date.now()}`;

        // Add initial AI message placeholder
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

        try {
          while (true) {
            // Check if generation was stopped
            if (controller.signal.aborted) {
              break;
            }

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

                    // Update the AI message in real-time
                    const { currentConversation } = useChatStore.getState();
                    if (currentConversation) {
                      const updatedMessages = currentConversation.messages.map(msg =>
                        msg.id === aiMessageId
                          ? { ...msg, content: fullMessage, output_tokens: fullMessage.length }
                          : msg
                      );

                      const updatedConversation = {
                        ...currentConversation,
                        messages: updatedMessages,
                        token_stats: {
                          ...currentConversation.token_stats,
                          output_tokens: fullMessage.length,
                          total_tokens: currentConversation.token_stats.input_tokens + fullMessage.length
                        }
                      };
                      useChatStore.setState({ currentConversation: updatedConversation });
                      console.log('AI message updated in UI:', fullMessage.length, 'characters');
                    }
                  }
                } catch (e) {
                  console.error('Failed to parse streaming data:', e);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        setStreamingMessage('');
        setIsStreaming(false);
        setAbortController(null);
        await loadConversations(); // Refresh to get final state
      } else {
        // Regular non-streaming response
        await sendMessage(selectedConversationId, messageContent);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsStreaming(false);
      setStreamingMessage('');
      setAbortController(null);

      // Remove the optimistic user message on error
      const { currentConversation } = useChatStore.getState();
      if (currentConversation) {
        const cleanedMessages = currentConversation.messages.filter(m => m.id !== userMessage.id);
        useChatStore.setState({
          currentConversation: {
            ...currentConversation,
            messages: cleanedMessages
          }
        });
      }
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

  const scrollToBottom = () => {
    const messageContainer = document.querySelector('[data-messages-container]');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
      setIsScrolledUp(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation(conversationId);
        if (selectedConversationId === conversationId) {
          setSelectedConversationId(null);
        }
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full gap-6 p-6">
      {/* Conversations Panel - Compact Dashboard Style */}
      <div className="w-80 space-y-6">
        <Card className="liquid-glass">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                Conversations
              </CardTitle>
              <Button
                onClick={handleCreateConversation}
                size="sm"
                variant="futuristic"
                className="hover-3d"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-slate-900/50 border-slate-700/50 focus:border-blue-500/50"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && conversations.length === 0 ? (
              <ConversationSkeleton />
            ) : (
              conversations
                .filter(conversation =>
                  searchQuery === '' ||
                  conversation.title?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group relative p-4 rounded-lg border transition-all duration-300 cursor-pointer hover-3d ${
                    selectedConversationId === conversation.id
                      ? 'bg-primary/20 border-primary/50 glow shadow-lg shadow-primary/20'
                      : 'bg-slate-900/50 border-slate-800/50 hover:bg-slate-800/70 hover:border-slate-700/50'
                  }`}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {conversation.title || 'Untitled Chat'}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(conversation.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
            {conversations.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-400/50" />
                <p className="text-slate-400">No conversations yet</p>
                <p className="text-sm text-slate-500/70">Create your first chat</p>
              </div>
            )}
          </CardContent>
        </Card>


      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col space-y-6">
        {selectedConversationId && currentConversation ? (
          <Card className="flex-1 flex flex-col liquid-glass">
            <CardHeader className="border-b border-slate-800/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl">
                  <Bot className="h-6 w-6 mr-3 text-primary" />
                  {currentConversation.title || 'Chat Session'}
                </CardTitle>
                <div className="flex items-center space-x-3">
                  <Badge variant="glow" className="status-online px-3 py-1">
                    AI Online
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    {currentConversation.token_stats?.message_count || 0} messages
                  </Badge>
                </div>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 overflow-hidden p-0">
              <div data-messages-container className="h-full overflow-y-auto p-6 space-y-4">
                {isLoading && currentConversation?.messages.length === 0 ? (
                  <MessageSkeleton />
                ) : (
                  currentConversation.messages
                    .filter(msg => !msg.id.startsWith('temp-') || msg.role === 'user' || msg.id.startsWith('streaming-ai-') || msg.id.startsWith('ai-') || msg.id.startsWith('user-')) // Show all messages including optimistic ones
                   .map((msg) => (
                  <div
                    key={msg.id}
                    className={`group flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    } ${msg.role === 'user' ? 'user-message-enter' : 'animate-fade-in'}`}
                  >
                    <div className="flex items-start space-x-3 max-w-[80%]">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {msg.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className={`relative p-3 rounded-lg group-hover:shadow-lg transition-shadow ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted glass'
                      }`}>
                        {/* Message Actions */}
                        <div className={`absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                          msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-slate-700/50"
                            onClick={() => navigator.clipboard.writeText(msg.content)}
                            title="Copy message"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {msg.role === 'user' && currentConversation?.messages[currentConversation.messages.length - 2]?.id === msg.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-slate-700/50"
                              title="Edit message"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                          {msg.role === 'assistant' && currentConversation?.messages[currentConversation.messages.length - 1]?.id === msg.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-slate-700/50"
                              title="Regenerate response"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        <div className="text-sm leading-relaxed pr-16">
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-sm prose-invert max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                                components={{
                                  code: ({ className, children, ...props }: any) => {
                                    const isInline = !className?.includes('language-');
                                    return isInline ? (
                                      <code className="bg-slate-800/50 rounded px-1 py-0.5 text-xs" {...props}>
                                        {children}
                                      </code>
                                    ) : (
                                      <code className={`${className} bg-slate-800/50 rounded px-1 py-0.5 text-xs`} {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                  pre: ({ children }) => (
                                    <pre className="bg-slate-900/50 rounded-lg p-3 overflow-x-auto my-2">
                                      {children}
                                    </pre>
                                  ),
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-50">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.role === 'assistant' && !msg.id.startsWith('temp-') && (
                            <div className="flex items-center text-xs opacity-70 space-x-2">
                              <Zap className="h-3 w-3" />
                              <span>{msg.input_tokens} in, {msg.output_tokens} out</span>
                            </div>
                          )}
                          {msg.role === 'assistant' && msg.id.startsWith('temp-') && (
                            <div className="flex items-center text-xs opacity-70 space-x-2">
                              <Zap className="h-3 w-3" />
                              <span>Streaming...</span>
                              <div className="flex space-x-1">
                                <div className="animate-pulse-glow w-1 h-1 bg-primary rounded-full"></div>
                                <div className="animate-pulse-glow w-1 h-1 bg-primary rounded-full animation-delay-100"></div>
                                <div className="animate-pulse-glow w-1 h-1 bg-primary rounded-full animation-delay-200"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  ))
                )}
                {isLoading && !isStreaming && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted p-3 rounded-lg glass">
                        <div className="flex items-center space-x-2">
                          <div className="animate-pulse-glow w-2 h-2 bg-primary rounded-full"></div>
                          <div className="animate-pulse-glow w-2 h-2 bg-primary rounded-full animation-delay-100"></div>
                          <div className="animate-pulse-glow w-2 h-2 bg-primary rounded-full animation-delay-200"></div>
                          <span className="text-sm ml-2">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            {/* Scroll to Bottom Button */}
            {isScrolledUp && (
              <div className="absolute bottom-24 right-6">
                <Button
                  onClick={scrollToBottom}
                  size="sm"
                  className="rounded-full shadow-lg hover-3d bg-blue-600 hover:bg-blue-700"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-slate-800/50 p-6">
              {isStreaming && (
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="animate-pulse-glow w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">AI is generating response...</span>
                  </div>
                  <Button
                    onClick={handleStopGeneration}
                    size="sm"
                    variant="outline"
                    className="text-red-400 border-red-400/50 hover:bg-red-400/10"
                  >
                    Stop Generating
                  </Button>
                </div>
              )}
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Input
                    ref={(input) => {
                      if (input && !isStreaming) {
                        input.focus();
                      }
                    }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message to AI..."
                    className="pr-28 h-12 text-base bg-slate-900/50 border-slate-700/50 focus:border-blue-500/50"
                    disabled={isLoading || isStreaming}
                  />
                  <div className="absolute right-2 top-2 flex space-x-2">
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!message.trim() || isLoading || isStreaming}
                      size="sm"
                      className="h-8 px-3 text-sm hover-3d"
                      variant="cyber"
                    >
                      Send
                    </Button>
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!message.trim() || isLoading || isStreaming}
                      size="sm"
                      className="h-8 w-8 p-0 hover-3d"
                      variant="futuristic"
                      title="Stream response"
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Conversation Stats */}
              {currentConversation && (
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span>Messages: {currentConversation.token_stats?.message_count || 0}</span>
                    <span>Total Tokens: {currentConversation.token_stats?.total_tokens || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-3 w-3" />
                    <span>Real-time AI responses</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="flex-1 flex items-center justify-center liquid-glass">
            <div className="text-center max-w-md">
              <Bot className="h-20 w-20 mx-auto mb-6 text-primary glow" />
              <h3 className="text-2xl font-bold mb-3">Welcome to APE Chat</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Start intelligent conversations with AI. Ask questions, get help with tasks,
                or explore ideas in a conversational interface.
              </p>
              <Button
                onClick={handleCreateConversation}
                size="lg"
                variant="futuristic"
                className="px-8"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Start New Conversation
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
