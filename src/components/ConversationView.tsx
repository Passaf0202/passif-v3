import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageThread } from "@/components/MessageThread";
import { MessageInput } from "@/components/MessageInput";
import { ArrowLeft } from "lucide-react";

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

  if (!selectedThread) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center text-gray-500">
          Sélectionnez une conversation pour voir les messages
        </p>
      </div>
    );
  }

  return (
    <>
      {isMobile && (
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <Button variant="ghost" onClick={onBackClick} className="mb-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      )}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
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
    </>
  );
}