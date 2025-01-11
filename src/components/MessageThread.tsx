import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, CheckCheck } from "lucide-react";

interface MessageThreadProps {
  message: {
    content: string;
    created_at: string;
    read: boolean;
    delivered: boolean;
    delivered_at: string | null;
    files: string[] | null;
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
          {message.files && message.files.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.files.map((file, index) => {
                const isImage = file.match(/\.(jpg|jpeg|png|gif)$/i);
                return isImage ? (
                  <img
                    key={index}
                    src={file}
                    alt="Message attachment"
                    className="max-w-full rounded-lg"
                  />
                ) : (
                  <a
                    key={index}
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Télécharger le fichier
                  </a>
                );
              })}
            </div>
          )}
        </div>
        <div
          className={`text-xs mt-1 ${
            isUserSender ? "text-right" : "text-left"
          } text-muted-foreground flex items-center gap-1`}
        >
          {formatDistanceToNow(new Date(message.created_at), {
            addSuffix: true,
            locale: fr,
          })}
          {isUserSender && (
            <span className="ml-1">
              {message.read ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : message.delivered ? (
                <Check className="h-3 w-3" />
              ) : null}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}