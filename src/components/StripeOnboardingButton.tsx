import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
          Pour recevoir vos paiements en tant que particulier, vous devez configurer 
          votre compte Stripe. C'est rapide, sécurisé et gratuit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-2 text-sm text-muted-foreground">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p>
            Pour des raisons légales, Stripe a besoin de vérifier votre identité. 
            Vous devrez fournir :
            <ul className="list-disc pl-4 mt-2 space-y-1">
              <li>Une pièce d'identité</li>
              <li>Un RIB pour recevoir vos paiements</li>
              <li>Vos informations personnelles de base</li>
            </ul>
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="website">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Pourquoi Stripe demande un site web ?
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Pour les particuliers, vous pouvez simplement indiquer l'URL de votre profil 
              sur notre plateforme ou votre page de vente. Ce n'est qu'une formalité 
              administrative pour Stripe, qui permet de vérifier où vous vendez vos produits.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

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