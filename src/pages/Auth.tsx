import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/");
      }
      
      // Handle auth errors
      if (event === "USER_UPDATED") {
        supabase.auth.getSession().then(({ error }) => {
          if (error) {
            handleAuthError(error);
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuthError = (error: AuthError) => {
    console.error("Auth error:", error);
    
    switch (error.message) {
      case "User already registered":
        setError("Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.");
        break;
      case "Invalid login credentials":
        setError("Email ou mot de passe incorrect.");
        break;
      case "Email not confirmed":
        setError("Veuillez confirmer votre email avant de vous connecter.");
        break;
      default:
        setError(error.message);
    }
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
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <SupabaseAuth 
            supabaseClient={supabase} 
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#000000',
                    brandAccent: '#666666',
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
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;