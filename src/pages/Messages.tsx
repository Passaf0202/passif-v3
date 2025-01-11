import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { MessageThread } from "@/components/MessageThread";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Send, ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [showConversation, setShowConversation] = useState(!isMobile);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      console.log("Fetching conversations for user:", user?.id);
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          listing:listings(title),
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
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
    queryClient.invalidateQueries({ queryKey: ["unreadMessages"] });
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

  useEffect(() => {
    if (selectedThread) {
      markThreadAsRead(selectedThread);
    }
  }, [selectedThread]);

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
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Mes messages</h1>
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(!isMobile || !showConversation) && (
              <div className="space-y-4">
                <ScrollArea className="h-[600px]">
                  {conversations.map((thread) => {
                    const lastMessage = thread.messages[thread.messages.length - 1];
                    const hasUnread = thread.messages.some(
                      (m: any) => m.receiver_id === user.id && !m.read
                    );
                    const otherUser = lastMessage.sender_id === user.id
                      ? lastMessage.receiver
                      : lastMessage.sender;
                    return (
                      <div
                        key={thread.listingId}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedThread === thread.listingId
                            ? "bg-primary/10"
                            : "bg-white hover:bg-gray-50"
                        } ${hasUnread ? "border-l-4 border-primary" : ""}`}
                        onClick={() => handleThreadSelect(thread.listingId)}
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
                </ScrollArea>
              </div>
            )}
            {(!isMobile || showConversation) && (
              <div className="md:col-span-2">
                {selectedThread ? (
                  <div className="bg-white rounded-lg shadow p-4">
                    {isMobile && (
                      <Button
                        variant="ghost"
                        onClick={handleBackToList}
                        className="mb-4"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                      </Button>
                    )}
                    <ScrollArea className="h-[500px] mb-4">
                      <div className="space-y-4">
                        {conversations
                          .find((t) => t.listingId === selectedThread)
                          ?.messages.map((message: any) => (
                            <MessageThread
                              key={message.id}
                              message={message}
                              currentUserId={user.id}
                            />
                          ))}
                      </div>
                    </ScrollArea>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          id="file-input"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx"
                        />
                        <label htmlFor="file-input">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="cursor-pointer"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </label>
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Écrivez votre message..."
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={(!newMessage.trim() && files.length === 0)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      {files.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          {files.length} fichier(s) sélectionné(s)
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-center text-gray-500">
                      Sélectionnez une conversation pour voir les messages
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">Aucun message</p>
        )}
      </div>
    </div>
  );
}