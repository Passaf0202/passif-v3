import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AISearchAssistantProps {
  category?: string | null;
  query?: string;
}

export const AISearchAssistant = ({ category, query }: AISearchAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: getInitialMessage(category, query),
    timestamp: new Date(),
  }]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (content: string = newMessage) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          message: content,
          context: {
            category,
            query
          }
        }
      });

      if (error) throw error;
      
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
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg max-w-[80%] ${
                message.role === 'user'
                  ? 'ml-auto bg-primary text-white'
                  : 'bg-gray-100'
              }`}
            >
              {message.content}
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="bg-gray-100 p-4 rounded-lg max-w-[80%] animate-pulse">
              L'assistant écrit...
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t mt-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <Input
              placeholder="Écrivez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={() => handleSendMessage()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

function getInitialMessage(category?: string | null, query?: string): string {
  if (category === "Voitures") {
    return `Bonjour ! Je peux vous aider à trouver la voiture idéale. Quels sont vos critères principaux (budget, type de véhicule, kilométrage, etc.) ?`;
  } else if (category === "Immobilier") {
    return `Bonjour ! Je peux vous aider dans votre recherche immobilière. Quel type de bien recherchez-vous et dans quelle zone ?`;
  } else if (query) {
    return `Bonjour ! Je peux vous aider à trouver "${query}". Avez-vous des critères spécifiques ?`;
  } else {
    return `Bonjour ! Je suis l'Assistant virtuel intelligent. Dites-moi simplement ce que vous cherchez & je vous aiderai à le trouver !`;
  }
}