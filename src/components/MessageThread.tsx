import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageThreadProps {
  message: {
    content: string;
    created_at: string;
    read: boolean;
    listing: {
      title: string;
    };
    sender: {
      id: string;
      full_name: string;
      avatar_url: string | null;
    };
    receiver: {
      id: string;
      full_name: string;
      avatar_url: string | null;
    };
  };
  currentUserId: string;
}

export function MessageThread({ message, currentUserId }: MessageThreadProps) {
  const isUserSender = message.sender.id === currentUserId;
  const otherUser = isUserSender ? message.receiver : message.sender;

  return (
    <div
      className={`flex gap-4 ${
        isUserSender ? "flex-row-reverse" : "flex-row"
      } mb-4`}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={otherUser.avatar_url || undefined} alt={otherUser.full_name} />
        <AvatarFallback>
          {otherUser.full_name.split(" ").map(n => n[0]).join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col max-w-[70%]">
        <div
          className={`rounded-lg p-3 ${
            isUserSender
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <div
          className={`text-xs mt-1 ${
            isUserSender ? "text-right" : "text-left"
          } text-muted-foreground`}
        >
          {formatDistanceToNow(new Date(message.created_at), {
            addSuffix: true,
            locale: fr,
          })}
        </div>
      </div>
    </div>
  );
}