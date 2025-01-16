import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SuggestionButton {
  icon: string;
  text: string;
}

const suggestionButtons: SuggestionButton[] = [
  { icon: "👨‍👩‍👧‍👦", text: "Je veux une voiture familiale" },
  { icon: "🏔️", text: "Aide-moi à trouver une voiture 4x4" },
  { icon: "⚡", text: "Cite-moi les 5 choses les plus importantes à savoir lors de la recherche d'une voiture hybride ou électrique" },
  { icon: "🚗🚙", text: "Aide-moi à comparer différents modèles de véhicules" },
];

export const AISearchAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Bonjour, je suis l'Assistant virtuel intelligent. Dites-moi simplement ce que vous cherchez & je vous aiderai à le trouver !",
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
        body: { message: content }
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

        {messages.length === 1 && (
          <div className="mt-8 max-w-3xl mx-auto">
            <h3 className="text-lg font-medium mb-4">Voici comment je pourrais vous aider :</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestionButtons.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="p-4 h-auto text-left flex items-center gap-2 hover:bg-gray-50"
                  onClick={() => handleSendMessage(suggestion.text)}
                >
                  <span>{suggestion.icon}</span>
                  <span className="flex-1">{suggestion.text}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
        )}
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