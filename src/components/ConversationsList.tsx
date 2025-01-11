import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="md:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden h-full">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
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
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedThread === thread.listingId
                    ? "bg-primary/10"
                    : "hover:bg-gray-50"
                } ${hasUnread ? "border-l-4 border-primary" : ""}`}
                onClick={() => onThreadSelect(thread.listingId)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="font-semibold">{otherUser.full_name}</div>
                  {hasUnread && (
                    <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Nouveau
                    </div>
                  )}
                </div>
                <h3 className="text-sm text-muted-foreground">
                  {lastMessage.listing.title}
                </h3>
                <p className="text-sm text-gray-500 truncate mt-1">
                  {lastMessage.content}
                </p>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}