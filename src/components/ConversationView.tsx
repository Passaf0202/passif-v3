
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

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onBackClick} className="h-8 w-8 md:hidden">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={otherUser.avatar_url || undefined} alt={otherUser.full_name} />
            <AvatarFallback className="bg-gray-100 text-gray-700">
              {otherUser.full_name.split(" ").map((n: string) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <span className="font-semibold">{otherUser.full_name}</span>
            <span className="text-xs text-gray-500">{lastMessage.listing.title}</span>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Voir l'annonce</DropdownMenuItem>
            <DropdownMenuItem>Marquer comme lu</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">Supprimer la conversation</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <ScrollArea className="flex-1 p-4 bg-gray-50">
        <div className="space-y-4 max-w-3xl mx-auto">
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
