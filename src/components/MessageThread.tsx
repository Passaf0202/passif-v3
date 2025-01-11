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
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0">
          {otherUser.avatar_url && (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.full_name}
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{otherUser.full_name}</h3>
          <p className="text-sm text-gray-500">
            À propos de : {message.listing.title}
          </p>
          <p className="mt-2">{message.content}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
              locale: fr,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}