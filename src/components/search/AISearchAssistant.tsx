import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AISearchAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex flex-col shadow-lg">
      <div className="p-4 border-b flex items-center gap-2 bg-primary/5">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Assistant de recherche IA</h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[80%] ${
                message.role === 'user'
                  ? 'ml-auto bg-primary text-white'
                  : 'bg-gray-100'
              }`}
            >
              {message.content}
            </div>
          ))}
          {isTyping && (
            <div className="bg-gray-100 p-3 rounded-lg max-w-[80%] animate-pulse">
              L'assistant écrit...
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Posez votre question..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button size="icon" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};