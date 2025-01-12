import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { AuthError } from "@supabase/supabase-js";
import { EmailStep } from "./EmailStep";
import { LoginStep } from "./LoginStep";
import { RegisterStep } from "./RegisterStep";

type AuthStep = "email" | "password" | "register";

export function AuthContainer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [step, setStep] = useState<AuthStep>("email");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("Current session:", session);
        
        if (error) {
          console.error("Session check error:", error);
          if (mounted) setErrorMessage(getErrorMessage(error));
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
  }, [navigate, toast]);

  const getErrorMessage = (error: AuthError) => {
    console.error("Auth error:", error);
    
    if (error.message.includes("session_not_found")) {
      return "Session expirée. Veuillez vous reconnecter.";
    }
    if (error.message.includes("Email not found")) {
      return "Cet email n'est pas associé à un compte";
    }
    if (error.message.includes("Invalid login credentials")) {
      return "Email ou mot de passe incorrect";
    }
    return "Une erreur est survenue. Veuillez réessayer.";
  };

  const handleEmailSubmit = async (values: { email: string }) => {
    try {
      setErrorMessage(""); // Clear any previous errors
      console.log("Checking email:", values.email);
      
      // First, check if the email exists
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: "dummy-password" // We use a dummy password just to check if the email exists
      });

      if (signInError) {
        console.log("Email check result:", signInError);
        // If email doesn't exist, move to register step
        if (signInError.message.includes("Invalid login credentials")) {
          setUserEmail(values.email);
          setStep("register");
        } else {
          // For other errors, proceed to password step as the email might exist
          setUserEmail(values.email);
          setStep("password");
        }
      } else if (user) {
        // If email exists, move to password step
        setUserEmail(values.email);
        setStep("password");
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setErrorMessage("Une erreur est survenue lors de la vérification de l'email");
    }
  };

  const handleLoginSubmit = async (values: { email: string; password: string }) => {
    try {
      setErrorMessage(""); // Clear any previous errors
      console.log("Attempting login for email:", values.email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error("Login error:", error);
        setErrorMessage(getErrorMessage(error));
      }
    } catch (error) {
      console.error("Error signing in:", error);
      setErrorMessage("Une erreur est survenue lors de la connexion");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {step === "register" 
            ? "Créez votre compte"
            : "Connectez-vous ou créez votre compte"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          {step === "email" && (
            <EmailStep onSubmit={handleEmailSubmit} />
          )}

          {step === "password" && (
            <LoginStep 
              email={userEmail}
              onSubmit={handleLoginSubmit}
            />
          )}

          {step === "register" && (
            <RegisterStep email={userEmail} />
          )}
        </div>
      </div>
    </div>
  );
}