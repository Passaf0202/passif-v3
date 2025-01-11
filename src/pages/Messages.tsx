import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { MessageThread } from "@/components/MessageThread";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      console.log("Fetching conversations for user:", user.id);
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          listing:listings(title),
          sender:profiles!messages_sender_id_fkey(full_name, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les conversations",
          variant: "destructive",
        });
        return;
      }

      console.log("Fetched conversations:", data);
      setConversations(data);
      setLoading(false);
    };

    fetchConversations();
  }, [user, toast]);

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Veuillez vous connecter pour accéder à vos messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Mes messages</h1>
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : conversations.length > 0 ? (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <MessageThread
                key={conversation.id}
                message={conversation}
                currentUserId={user.id}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Aucun message</p>
        )}
      </div>
    </div>
  );
}