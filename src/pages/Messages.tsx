
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConversationsList } from "@/components/ConversationsList";
import { ConversationView } from "@/components/ConversationView";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [showConversation, setShowConversation] = useState(false);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      console.log("Fetching conversations for user:", user?.id);
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          listing:listings(title),
          sender:profiles!messages_sender_id_fkey(id, full_name, username, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(id, full_name, username, avatar_url)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .is('deleted_by_user', null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        throw error;
      }

      const groupedMessages = data.reduce((acc: any, message: any) => {
        const key = message.listing_id;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(message);
        return acc;
      }, {});

      return Object.entries(groupedMessages).map(([listingId, messages]: [string, any[]]) => ({
        listingId,
        messages: messages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      }));
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      setFiles(Array.from(selectedFiles));
    }
  };

  const uploadFiles = async () => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('messages-files')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('messages-files')
        .getPublicUrl(filePath);
        
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSendMessage = async () => {
    if ((!selectedThread || !newMessage.trim()) && files.length === 0 || !user) return;

    const thread = conversations?.find(c => c.listingId === selectedThread);
    if (!thread) return;

    const lastMessage = thread.messages[thread.messages.length - 1];
    const receiverId = lastMessage.sender_id === user.id 
      ? lastMessage.receiver_id 
      : lastMessage.sender_id;

    let uploadedUrls: string[] = [];
    if (files.length > 0) {
      uploadedUrls = await uploadFiles();
    }

    const { error } = await supabase.from("messages").insert({
      content: newMessage.trim() || "Fichier partagé",
      listing_id: selectedThread,
      sender_id: user.id,
      receiver_id: receiverId,
      files: uploadedUrls,
      delivered: true,
      delivered_at: new Date().toISOString(),
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
      return;
    }

    setNewMessage("");
    setFiles([]);
    if (document.getElementById('file-input')) {
      (document.getElementById('file-input') as HTMLInputElement).value = '';
    }
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  const markThreadAsRead = async (threadId: string) => {
    if (!user) return;

    await supabase
      .from("messages")
      .update({ read: true })
      .eq("listing_id", threadId)
      .eq("receiver_id", user.id)
      .eq("read", false);

    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  const handleThreadSelect = (threadId: string) => {
    setSelectedThread(threadId);
    if (isMobile) {
      setShowConversation(true);
    }
    markThreadAsRead(threadId);
  };

  const handleBackToList = () => {
    setShowConversation(false);
    setSelectedThread(null);
  };

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">
            Veuillez vous connecter pour accéder à vos messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Mes messages</h1>
        {isLoading ? (
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
            {(!isMobile || !showConversation) && (
              <div className="h-full">
                <ConversationsList
                  conversations={conversations}
                  selectedThread={selectedThread}
                  currentUserId={user.id}
                  onThreadSelect={handleThreadSelect}
                  isMobile={isMobile}
                  onBackClick={handleBackToList}
                />
              </div>
            )}
            {(!isMobile || showConversation) && (
              <div className="md:col-span-2 h-full bg-white border border-gray-100 rounded-lg shadow-sm">
                <ConversationView
                  selectedThread={selectedThread}
                  conversations={conversations}
                  currentUserId={user.id}
                  isMobile={isMobile}
                  onBackClick={handleBackToList}
                  newMessage={newMessage}
                  onMessageChange={setNewMessage}
                  onSendMessage={handleSendMessage}
                  onFileChange={handleFileChange}
                  files={files}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Aucun message</h2>
            <p className="text-gray-500 mb-6">Vous n'avez pas encore de conversations</p>
            <p className="text-sm text-gray-500">Lorsque vous discuterez avec des vendeurs, vos messages apparaîtront ici.</p>
          </div>
        )}
      </div>
    </div>
  );
}
