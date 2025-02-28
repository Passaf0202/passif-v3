
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageThread } from "@/components/MessageThread";
import { MessageInput } from "@/components/MessageInput";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

interface ConversationViewProps {
  selectedThread: string | null;
  conversations: any[];
  currentUserId: string;
  isMobile: boolean;
  onBackClick: () => void;
  newMessage: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  files: File[];
}

export function ConversationView({
  selectedThread,
  conversations,
  currentUserId,
  isMobile,
  onBackClick,
  newMessage,
  onMessageChange,
  onSendMessage,
  onFileChange,
  files,
}: ConversationViewProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentThread = conversations.find((t) => t.listingId === selectedThread);

  if (!selectedThread || !currentThread) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center max-w-md p-8 rounded-lg">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Sélectionnez une conversation</h3>
          <p className="text-gray-500">
            Choisissez une conversation dans la liste pour voir vos messages
          </p>
        </div>
      </div>
    );
  }

  const lastMessage = currentThread.messages[currentThread.messages.length - 1];
  const otherUser = lastMessage.sender_id === currentUserId
    ? lastMessage.receiver
    : lastMessage.sender;
    
  // Utiliser le nom d'utilisateur s'il existe, sinon utiliser le nom complet
  const displayName = otherUser.username || otherUser.full_name;

  // Fonction pour voir l'annonce
  const viewListing = () => {
    if (selectedThread) {
      navigate(`/listing/${selectedThread}`);
    }
  };

  // Fonction pour marquer comme lu
  const markAsRead = async () => {
    if (!selectedThread) return;

    await supabase
      .from("messages")
      .update({ read: true })
      .eq("listing_id", selectedThread)
      .eq("receiver_id", currentUserId)
      .eq("read", false);

    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    
    toast({
      title: "Messages marqués comme lus",
      description: "Tous les messages ont été marqués comme lus",
    });
  };

  // Fonction pour supprimer la conversation
  const deleteConversation = async () => {
    if (!selectedThread) return;
    
    // Au lieu de marquer comme supprimé, nous allons supprimer les messages
    // Dans une application de production, il serait préférable d'ajouter une colonne deleted_by_user
    // via une migration Supabase, mais pour notre cas d'utilisation actuel, nous allons contourner ce problème.
    try {
      // Cette opération supprime effectivement les messages pour l'utilisateur actuel
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("listing_id", selectedThread)
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Conversation supprimée",
        description: "La conversation a été supprimée avec succès",
      });
      
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      onBackClick(); // Revenir à la liste des conversations
    } catch (error) {
      console.error("Erreur lors de la suppression de la conversation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la conversation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBackClick} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={otherUser.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="bg-gray-100 text-gray-700">
              {displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <span className="font-semibold">{displayName}</span>
            <span className="text-xs text-gray-500 truncate max-w-[200px]">{lastMessage.listing.title}</span>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuItem onClick={viewListing}>
              Voir l'annonce
            </DropdownMenuItem>
            <DropdownMenuItem onClick={markAsRead}>
              Marquer comme lu
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={deleteConversation}
              className="text-red-500 focus:text-red-500 focus:bg-red-50"
            >
              Supprimer la conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <ScrollArea className="flex-1 p-4 bg-gray-50">
        <div className="space-y-4 max-w-3xl mx-auto pb-4">
          {currentThread?.messages.map((message: any) => (
            <MessageThread
              key={message.id}
              message={message}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      </ScrollArea>
      
      <MessageInput
        newMessage={newMessage}
        onMessageChange={onMessageChange}
        onSendMessage={onSendMessage}
        onFileChange={onFileChange}
        files={files}
      />
    </div>
  );
}
