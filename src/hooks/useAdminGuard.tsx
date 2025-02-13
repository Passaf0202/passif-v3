
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useAdminGuard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsLoading(false);
        navigate("/auth");
        return;
      }

      try {
        const { data: isUserAdmin, error } = await supabase.rpc('has_role', {
          _role: 'admin'
        });

        if (error) throw error;

        setIsAdmin(isUserAdmin);
        
        if (!isUserAdmin) {
          toast({
            title: "Accès refusé",
            description: "Vous n'avez pas les droits d'administration nécessaires.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast({
          title: "Erreur",
          description: "Impossible de vérifier vos droits d'accès.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, navigate, toast]);

  return { isAdmin, isLoading };
};
