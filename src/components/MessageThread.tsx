
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, CheckCheck, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

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

  const isImage = (file: string) => {
    return file.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  };

  return (
    <div
      className={`flex gap-4 ${
        isUserSender ? "flex-row-reverse" : "flex-row"
      } mb-6`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0 border">
        <AvatarImage src={otherUser.avatar_url || undefined} alt={otherUser.full_name} />
        <AvatarFallback className="bg-gray-100 text-gray-700">
          {otherUser.full_name.split(" ").map(n => n[0]).join("")}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col max-w-[80%] md:max-w-[70%] gap-1 ${
        isUserSender ? "items-end" : "items-start"
      }`}>
        <div
          className={cn(
            "rounded-2xl p-4 shadow-sm",
            isUserSender 
              ? "bg-primary text-primary-foreground rounded-tr-none" 
              : "bg-gray-100 text-gray-800 rounded-tl-none"
          )}
        >
          <p className="text-sm md:text-base whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {message.files && message.files.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.files.map((file, index) => (
                isImage(file) ? (
                  <img
                    key={index}
                    src={file}
                    alt="Pièce jointe"
                    className="max-w-full rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                    onClick={() => window.open(file, '_blank')}
                  />
                ) : (
                  <Button
                    key={index}
                    variant="secondary"
                    size="sm"
                    className="w-full flex items-center gap-2"
                    onClick={() => window.open(file, '_blank')}
                  >
                    <FileText className="h-4 w-4" />
                    Voir le fichier
                  </Button>
                )
              ))}
            </div>
          )}
        </div>

        <div
          className={`text-xs text-muted-foreground flex items-center gap-1 ${
            isUserSender ? "flex-row" : "flex-row-reverse"
          }`}
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
