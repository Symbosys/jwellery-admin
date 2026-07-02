import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAllSessionsQuery, useSendAgentReplyMutation, useCloseSessionMutation } from '@/api/hooks/chat.hooks';
import { formatDistanceToNow } from 'date-fns';

const quickReplies = [
  'Thank you for your order!',
  'Your order has been shipped.',
  'Please provide more details.',
  'I\'ll check and get back to you.',
];

export default function Messages() {
  const { data: dbSessions = [], isLoading } = useAllSessionsQuery();
  const sendReplyMutation = useSendAgentReplyMutation();
  const closeSessionMutation = useCloseSessionMutation();

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Map backend sessions to UI
  const conversations = dbSessions.map(session => {
    const user = session.user;
    const isGuest = !user;
    
    // Fallback initials and names for guests
    const initials = isGuest ? 'G' : `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U';
    const name = isGuest ? 'Guest User' : `${user?.firstName} ${user?.lastName}`.trim();
    
    // Sort messages to find the latest
    const sortedMessages = [...(session.messages || [])].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const latestMessage = sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1] : null;
    
    // Unread count: for now assume 0 as we don't have read receipts
    const unread = 0; 
    
    return {
      id: session.id,
      customer: { name, avatar: '', initials },
      lastMessage: latestMessage ? latestMessage.text : 'No messages yet',
      time: latestMessage ? formatDistanceToNow(new Date(latestMessage.createdAt), { addSuffix: true }) : '',
      unread,
      orderId: isGuest ? 'GUEST' : `ID: ${user?.id.substring(0, 8)}`,
      rawMessages: sortedMessages,
      status: session.status
    };
  });

  const currentConvo = conversations.find(c => c.id === selectedConversation);

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConvo?.rawMessages, selectedConversation]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    setShowMobileChat(true);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;
    try {
      await sendReplyMutation.mutateAsync({
        sessionId: selectedConversation,
        text: messageText.trim()
      });
      setMessageText('');
    } catch (err) {
      console.error("Failed to send reply", err);
    }
  };

  const handleCloseSession = async () => {
    if (!selectedConversation) return;
    try {
      await closeSessionMutation.mutateAsync(selectedConversation);
    } catch (err) {
      console.error("Failed to close session", err);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h1 className="text-2xl lg:text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Customer inquiries and support</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl shadow-soft h-[calc(100%-5rem)] overflow-hidden flex"
      >
        {/* Conversations List */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 border-r border-border flex flex-col",
          showMobileChat && "hidden md:flex"
        )}>
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                onClick={() => handleSelectConversation(convo.id)}
                className={cn(
                  "p-4 border-b border-border cursor-pointer transition-colors",
                  selectedConversation === convo.id ? "bg-primary/5" : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={convo.customer.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {convo.customer.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium truncate">{convo.customer.name}</p>
                      <span className="text-xs text-muted-foreground">{convo.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                    <p className="text-xs text-primary mt-1">{convo.orderId}</p>
                  </div>
                  {convo.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {convo.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col",
          !showMobileChat && "hidden md:flex"
        )}>
          {currentConvo ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden"
                    onClick={() => setShowMobileChat(false)}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {currentConvo.customer.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{currentConvo.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{currentConvo.orderId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Close Session" onClick={handleCloseSession} disabled={currentConvo.status === 'CLOSED'}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentConvo.rawMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.sender === 'AGENT' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2",
                        msg.sender === 'AGENT' 
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      )}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={cn(
                          "text-[10px] mt-1",
                          msg.sender === 'AGENT' ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Quick Replies */}
              <div className="px-4 py-2 border-t border-border">
                <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2">
                  {quickReplies.map((reply, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      size="sm"
                      className="whitespace-nowrap text-xs"
                      onClick={() => setMessageText(reply)}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                {currentConvo.status === 'CLOSED' ? (
                  <div className="text-center text-sm text-muted-foreground py-2">
                    This session has been closed.
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Input 
                      placeholder="Type a message..." 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button size="icon" onClick={handleSendMessage} disabled={!messageText.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
