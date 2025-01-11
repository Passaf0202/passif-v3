import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface MessageThreadProps {
  message: {
    content: string;
    created_at: string;
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
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0">
        {otherUser.avatar_url && (
          <img
            src={otherUser.avatar_url}
            alt={otherUser.full_name}
            className="w-full h-full rounded-full object-cover"
          />
        )}
      </div>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isUserSender
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <p>{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isUserSender ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {formatDistanceToNow(new Date(message.created_at), {
            addSuffix: true,
            locale: fr,
          })}
        </p>
      </div>
    </div>
  );
}