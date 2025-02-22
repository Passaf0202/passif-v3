
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ConversationsListProps {
  conversations: any[];
  selectedThread: string | null;
  currentUserId: string;
  onThreadSelect: (threadId: string) => void;
}

export function ConversationsList({
  conversations,
  selectedThread,
  currentUserId,
  onThreadSelect,
}: ConversationsListProps) {
  return (
    <div className="md:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {conversations.map((thread) => {
            const lastMessage = thread.messages[thread.messages.length - 1];
            const hasUnread = thread.messages.some(
              (m: any) => m.receiver_id === currentUserId && !m.read
            );
            const otherUser =
              lastMessage.sender_id === currentUserId
                ? lastMessage.receiver
                : lastMessage.sender;

            return (
              <div
                key={thread.listingId}
                onClick={() => onThreadSelect(thread.listingId)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedThread === thread.listingId
                    ? "bg-primary/5"
                    : "hover:bg-gray-50"
                } ${hasUnread ? "border-l-4 border-primary" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={otherUser.avatar_url || undefined} alt={otherUser.full_name} />
                    <AvatarFallback>
                      {otherUser.full_name.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold truncate">
                        {otherUser.full_name}
                      </div>
                      <div className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(lastMessage.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground mb-1 truncate">
                      {lastMessage.content || "Fichier partagé"}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-primary truncate max-w-[180px]">
                        {lastMessage.listing.title}
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
      </ScrollArea>
    </div>
  );
}
