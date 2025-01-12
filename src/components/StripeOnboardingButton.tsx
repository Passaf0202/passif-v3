import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle>Configuration des paiements</CardTitle>
        <CardDescription>
          Pour recevoir vos paiements, vous devez configurer votre compte Stripe. 
          C'est rapide, sécurisé et gratuit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-2 text-sm text-muted-foreground">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p>
            Vous serez redirigé vers Stripe pour renseigner vos informations bancaires 
            et vérifier votre identité. C'est une étape obligatoire pour garantir 
            la sécurité des transactions.
          </p>
        </div>
        <Button 
          onClick={handleOnboarding} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Chargement..." : "Configurer mes paiements"}
        </Button>
      </CardContent>
    </Card>
  );
}