'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/contexts/chat-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/metric-card';
import { apiClient } from '@/lib/api';
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Bot,
  User,
  Zap,
  Activity
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

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

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
    setMessage('');
    setIsStreaming(useStreaming);

    try {
      if (useStreaming) {
        // Streaming implementation
        const reader = await apiClient.streamMessage(selectedConversationId, messageContent);
        if (!reader) {
          throw new Error('Failed to start streaming');
        }
        const decoder = new TextDecoder();

        let fullMessage = '';
        try {
          while (true) {
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
        await loadConversations(); // Refresh conversations
      } else {
        // Regular non-streaming response
        await sendMessage(selectedConversationId, messageContent);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsStreaming(false);
      setStreamingMessage('');
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
    <div className="flex h-full gap-4 p-4">
      {/* Conversations Panel - Algo Trading Style */}
      <div className="w-80 space-y-4">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                Conversations
              </CardTitle>
              <Button
                onClick={handleCreateConversation}
                size="sm"
                variant="futuristic"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                  selectedConversationId === conversation.id
                    ? 'bg-primary/20 border-primary/50 glow'
                    : 'bg-card/50 border-border/50 hover:bg-accent/50 glass'
                }`}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {conversation.title || 'Untitled Chat'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(conversation.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conversation.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No conversations yet</p>
                <p className="text-sm text-muted-foreground/70">Create your first chat</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Total Chats"
            value={conversations.length}
            icon={MessageSquare}
            className="p-3"
          />
          <MetricCard
            title="Active"
            value={selectedConversationId ? 1 : 0}
            icon={Activity}
            className="p-3"
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId && currentConversation ? (
          <Card className="flex-1 flex flex-col glass-card">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-primary" />
                  {currentConversation.title || 'Chat Session'}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="glow" className="status-online">
                    AI Online
                  </Badge>
                  <Badge variant="secondary">
                    {currentConversation.token_stats?.message_count || 0} messages
                  </Badge>
                </div>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full overflow-y-auto p-4 space-y-4">
                {currentConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    } animate-fade-in`}
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
                      <div className={`p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted glass'
                      }`}>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.content}
                        </p>
                        {msg.role === 'assistant' && (
                          <div className="flex items-center mt-2 text-xs opacity-70 space-x-2">
                            <Zap className="h-3 w-3" />
                            <span>{msg.input_tokens} in, {msg.output_tokens} out</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isStreaming && streamingMessage && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex items-start space-x-3 max-w-[80%]">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted p-3 rounded-lg glass">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {streamingMessage}
                        </p>
                        <div className="flex items-center mt-2 text-xs opacity-70 space-x-2">
                          <Zap className="h-3 w-3" />
                          <span>Streaming...</span>
                          <div className="flex space-x-1">
                            <div className="animate-pulse-glow w-1 h-1 bg-primary rounded-full"></div>
                            <div className="animate-pulse-glow w-1 h-1 bg-primary rounded-full animation-delay-100"></div>
                            <div className="animate-pulse-glow w-1 h-1 bg-primary rounded-full animation-delay-200"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isLoading && !streamingMessage && (
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

            {/* Input Area */}
            <div className="border-t border-border/50 p-4">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message to AI..."
                    className="pr-24 glass"
                    disabled={isLoading || isStreaming}
                  />
                  <div className="absolute right-1 top-1 flex space-x-1">
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!message.trim() || isLoading || isStreaming}
                      size="sm"
                      className="h-8 px-2 text-xs"
                      variant="cyber"
                    >
                      Send
                    </Button>
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!message.trim() || isLoading || isStreaming}
                      size="sm"
                      className="h-8 w-8 p-0"
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
          <Card className="flex-1 flex items-center justify-center glass-card">
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
