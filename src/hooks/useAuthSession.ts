import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAuthSession = (setErrorMessage: (message: string) => void) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("Current session:", session);
        
        if (error) {
          console.error("Session check error:", error);
          if (mounted) setErrorMessage("Une erreur est survenue lors de la vérification de la session");
          return;
        }

        if (session && mounted) {
          console.log("User already logged in, redirecting to home");
          navigate("/");
        }
      } catch (error) {
        console.error("Unexpected error during session check:", error);
        if (mounted) setErrorMessage("Une erreur inattendue est survenue");
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (!mounted) return;

      if (event === "SIGNED_IN" && session) {
        console.log("User signed in successfully, redirecting to home");
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté",
        });
        navigate("/");
      }
    });

    return () => {
      console.log("Cleaning up auth subscriptions");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast, setErrorMessage]);
};