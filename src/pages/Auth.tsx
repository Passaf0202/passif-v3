import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Check current session on mount
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("Current session:", session);
      if (session) {
        console.log("User already logged in, redirecting to home");
        navigate("/");
      }
      if (error) {
        console.error("Session check error:", error);
        setErrorMessage(getErrorMessage(error));
      }
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === "SIGNED_IN" && session) {
        console.log("User signed in successfully, redirecting to home");
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté",
        });
        navigate("/");
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
        setErrorMessage("");
      } else if (event === "USER_UPDATED") {
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session refresh error:", error);
          setErrorMessage(getErrorMessage(error));
        }
      }
    });

    return () => {
      console.log("Cleaning up auth subscriptions");
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const getErrorMessage = (error: AuthError) => {
    console.error("Auth error:", error);
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          return "Les informations fournies sont invalides. Veuillez vérifier vos données.";
        case 401:
          return "Email ou mot de passe incorrect.";
        case 403:
          return "Accès non autorisé. Veuillez vous reconnecter.";
        case 422:
          return "Cet email est déjà utilisé.";
        default:
          return error.message;
      }
    }
    return "Une erreur est survenue. Veuillez réessayer.";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Connectez-vous à votre compte
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <SupabaseAuth 
            supabaseClient={supabase} 
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#FF6E14',
                    brandAccent: '#FF8F4C',
                  },
                },
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Adresse email',
                  password_label: 'Mot de passe',
                  button_label: 'Se connecter',
                },
                sign_up: {
                  email_label: 'Adresse email',
                  password_label: 'Mot de passe',
                  button_label: "S'inscrire",
                  confirmation_text: 'En créant un compte, vous acceptez nos conditions générales et notre politique de confidentialité',
                },
              },
            }}
            providers={[]}
            view="sign_up"
            additionalData={{
              first_name: {
                label: 'Prénom',
                required: true,
              },
              last_name: {
                label: 'Nom',
                required: true,
              },
              phone_number: {
                label: 'Téléphone',
                required: true,
              },
              city: {
                label: 'Ville',
                required: true,
              },
              country: {
                label: 'Pays',
                required: true,
              },
              username: {
                label: "Nom d'utilisateur",
                required: true,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;