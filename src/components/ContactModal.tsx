
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from "lucide-react";

interface ContactModalProps {
  listingId: string;
  sellerId: string;
  listingTitle: string;
}

export function ContactModal({ listingId, sellerId, listingTitle }: ContactModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour envoyer un message",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez écrire un message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    console.log("Sending message:", {
      sender_id: user.id,
      receiver_id: sellerId,
      listing_id: listingId,
      content: message,
    });

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: sellerId,
      listing_id: listingId,
      content: message.trim(),
    });

    setIsSending(false);

    if (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Message envoyé avec succès",
    });
    setMessage("");
    setIsOpen(false);
  };

  if (!user) {
    return (
      <Button variant="outline" className="w-full py-7 text-base font-medium" asChild>
        <a href="/auth">
          <MessageCircle className="mr-2 h-4 w-4" />
          Se connecter pour contacter
        </a>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full py-7 text-base font-medium">
          <MessageCircle className="mr-2 h-4 w-4" />
          Contacter le vendeur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envoyer un message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            À propos de l'annonce : {listingTitle}
          </p>
          <Textarea
            placeholder="Écrivez votre message ici..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <Button
            className="w-full"
            onClick={handleSendMessage}
            disabled={isSending}
          >
            {isSending ? "Envoi en cours..." : "Envoyer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
