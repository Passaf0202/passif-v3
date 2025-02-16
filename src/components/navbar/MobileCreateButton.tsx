
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const MobileCreateButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateListing = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour déposer une annonce",
      });
      navigate("/auth");
      return;
    }
    navigate("/create");
  };

  return (
    <Button 
      onClick={handleCreateListing}
      className="bg-black hover:bg-black/90 fixed bottom-4 right-4 md:hidden shadow-lg rounded-full z-50 px-4 py-2 text-sm font-medium flex items-center gap-2"
    >
      <Plus className="h-4 w-4 stroke-[2.5]" />
      <span>Déposer une annonce</span>
    </Button>
  );
};
