
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ArrowLeft, PlusCircle, Search } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";
import { Button } from "./ui/button";
import { useOptimizedImage } from "@/hooks/useOptimizedImage";

interface ConversationsListProps {
  conversations: any[];
  selectedThread: string | null;
  currentUserId: string;
  onThreadSelect: (threadId: string) => void;
  isMobile: boolean;
  onBackClick?: () => void;
}

export function ConversationsList({
  conversations,
  selectedThread,
  currentUserId,
  onThreadSelect,
  isMobile,
  onBackClick,
}: ConversationsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredConversations = conversations.filter(thread => {
    const lastMessage = thread.messages[thread.messages.length - 1];
    const otherUser = lastMessage.sender_id === currentUserId
      ? lastMessage.receiver
      : lastMessage.sender;
    
    return otherUser.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (otherUser.username && otherUser.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
           lastMessage.listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (lastMessage.content && lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col border border-gray-100">
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        {isMobile && onBackClick ? (
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="icon" onClick={onBackClick} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">Messages</h2>
          </div>
        ) : (
          <h2 className="text-lg font-semibold mb-4">Messages</h2>
        )}
        
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-gray-50"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {filteredConversations.length > 0 ? (
          <div className="divide-y">
            {filteredConversations.map((thread) => {
              const lastMessage = thread.messages[thread.messages.length - 1];
              const hasUnread = thread.messages.some(
                (m: any) => m.receiver_id === currentUserId && !m.read
              );
              const otherUser =
                lastMessage.sender_id === currentUserId
                  ? lastMessage.receiver
                  : lastMessage.sender;
              
              // Utiliser le nom d'utilisateur s'il existe, sinon utiliser le nom complet
              const displayName = otherUser.username || otherUser.full_name;

              // Fonction pour tronquer le texte avec des points de suspension
              const truncateWithEllipsis = (text: string, maxLength: number) => {
                if (text.length <= maxLength) return text;
                return text.substring(0, maxLength) + "...";
              };

              return (
                <div
                  key={thread.listingId}
                  onClick={() => onThreadSelect(thread.listingId)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedThread === thread.listingId
                      ? "bg-gray-50 border-l-4 border-primary"
                      : "hover:bg-gray-50"
                  } ${hasUnread ? "border-l-4 border-primary" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={otherUser.avatar_url || undefined} alt={displayName} />
                      <AvatarFallback className="bg-gray-100 text-gray-700">
                        {displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-semibold truncate">
                          {truncateWithEllipsis(displayName, 15)}
                        </div>
                        <div className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDistanceToNow(new Date(lastMessage.created_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground mb-1 truncate">
                        {truncateWithEllipsis(lastMessage.content || "Fichier partagé", 30)}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-primary truncate max-w-[180px]">
                          {truncateWithEllipsis(lastMessage.listing.title, 25)}
                        </div>
                        {hasUnread && (
                          <div className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                            Nouveau
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 p-4 text-center">
            <p className="text-gray-500 mb-2">Aucune conversation trouvée</p>
            {searchTerm && (
              <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                Effacer la recherche
              </Button>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
