import { useState } from 'react';
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

const conversations = [
  {
    id: 1,
    customer: { name: 'John Smith', avatar: '', initials: 'JS' },
    lastMessage: 'Is the product still available?',
    time: '2 min ago',
    unread: 2,
    orderId: 'ORD-7842',
  },
  {
    id: 2,
    customer: { name: 'Sarah Johnson', avatar: '', initials: 'SJ' },
    lastMessage: 'Thank you for the quick response!',
    time: '15 min ago',
    unread: 0,
    orderId: 'ORD-7841',
  },
  {
    id: 3,
    customer: { name: 'Mike Brown', avatar: '', initials: 'MB' },
    lastMessage: 'When will my order be shipped?',
    time: '1 hour ago',
    unread: 1,
    orderId: 'ORD-7840',
  },
  {
    id: 4,
    customer: { name: 'Emily Davis', avatar: '', initials: 'ED' },
    lastMessage: 'Can I change the delivery address?',
    time: '3 hours ago',
    unread: 0,
    orderId: 'ORD-7839',
  },
  {
    id: 5,
    customer: { name: 'Alex Wilson', avatar: '', initials: 'AW' },
    lastMessage: 'I would like to return this item',
    time: 'Yesterday',
    unread: 0,
    orderId: 'ORD-7838',
  },
];

const messages = [
  { id: 1, sender: 'customer', text: 'Hi, I have a question about my order', time: '10:30 AM' },
  { id: 2, sender: 'vendor', text: 'Hello! Of course, how can I help you?', time: '10:32 AM' },
  { id: 3, sender: 'customer', text: 'Is the product still available? I want to order 2 more', time: '10:33 AM' },
  { id: 4, sender: 'vendor', text: 'Yes, we have plenty in stock! Would you like me to create an order for you?', time: '10:35 AM' },
  { id: 5, sender: 'customer', text: 'That would be great, thank you!', time: '10:36 AM' },
];

const quickReplies = [
  'Thank you for your order!',
  'Your order has been shipped.',
  'Please provide more details.',
  'I\'ll check and get back to you.',
];

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [messageText, setMessageText] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  const currentConvo = conversations.find(c => c.id === selectedConversation);

  const handleSelectConversation = (id: number) => {
    setSelectedConversation(id);
    setShowMobileChat(true);
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
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.sender === 'vendor' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2",
                        msg.sender === 'vendor' 
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      )}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={cn(
                          "text-[10px] mt-1",
                          msg.sender === 'vendor' ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
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
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Input 
                    placeholder="Type a message..." 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
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
