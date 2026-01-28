import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MessageCircle, Send, Plus, Sparkles, Bot, User } from "lucide-react";
import { Streamdown } from "streamdown";

export default function Coach() {
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: conversations, isLoading: loadingConversations } = trpc.chat.listConversations.useQuery();
  const { data: messages, isLoading: loadingMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: activeConversationId! },
    { enabled: !!activeConversationId }
  );

  const utils = trpc.useUtils();
  
  const createConversation = trpc.chat.createConversation.useMutation({
    onSuccess: (data) => {
      if (data) {
        setActiveConversationId(data.id);
        utils.chat.listConversations.invalidate();
      }
    }
  });

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setInputMessage("");
      utils.chat.getMessages.invalidate({ conversationId: activeConversationId! });
    },
    onError: () => {
      toast.error("Failed to send message. Please try again.");
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  const handleSend = () => {
    if (!inputMessage.trim() || !activeConversationId) return;
    sendMessage.mutate({
      conversationId: activeConversationId,
      content: inputMessage.trim()
    });
  };

  const handleNewConversation = () => {
    createConversation.mutate({ title: "New Conversation" });
  };

  const quickPrompts = [
    "I'm having a craving right now",
    "Help me understand my triggers",
    "I need a quick breathing exercise",
    "I ate emotionally and feel guilty",
    "How can I practice mindful eating?"
  ];

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
        {/* Sidebar - Conversations */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Conversations</CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleNewConversation}
                  disabled={createConversation.isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[200px] lg:h-[calc(100vh-16rem)]">
                {loadingConversations ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : conversations && conversations.length > 0 ? (
                  <div className="space-y-1">
                    {conversations.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => setActiveConversationId(conv.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeConversationId === conv.id
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{conv.title || "New Chat"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <p>No conversations yet</p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={handleNewConversation}
                      className="mt-2"
                    >
                      Start your first chat
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">MindfulBite Coach</CardTitle>
                <p className="text-sm text-muted-foreground">Your compassionate AI support companion</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {!activeConversationId ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <Bot className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Welcome to Your AI Coach
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    I'm here to support you on your mindful eating journey. 
                    Start a conversation whenever you need guidance, support, or just someone to talk to.
                  </p>
                  <Button onClick={handleNewConversation}>
                    Start a Conversation
                  </Button>
                </div>
              ) : loadingMessages ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                      <div className={`h-16 w-2/3 bg-muted animate-pulse rounded-xl`} />
                    </div>
                  ))}
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div 
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 ${
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`p-3 rounded-xl ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}>
                          {msg.role === 'assistant' ? (
                            <Streamdown>{msg.content}</Streamdown>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {sendMessage.isPending && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <div className="p-2 rounded-full h-8 w-8 flex items-center justify-center bg-muted">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="p-3 rounded-xl bg-muted">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8">
                  <p className="text-muted-foreground mb-4">Start the conversation with a message or try a quick prompt:</p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                    {quickPrompts.map((prompt, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInputMessage(prompt);
                        }}
                        className="text-xs"
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            {activeConversationId && (
              <div className="p-4 border-t">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={sendMessage.isPending}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={!inputMessage.trim() || sendMessage.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
