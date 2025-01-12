import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function StripeOnboardingButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOnboarding = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('create-account-link');
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erreur lors de la création du lien d\'onboarding:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le lien d'onboarding Stripe",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleOnboarding} 
      disabled={isLoading}
      variant="outline"
    >
      {isLoading ? "Chargement..." : "Configurer mes paiements Stripe"}
    </Button>
  );
}