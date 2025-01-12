import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { EmailStep } from "./EmailStep";
import { LoginStep } from "./LoginStep";
import { RegisterStep } from "./RegisterStep";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthSession } from "@/hooks/useAuthSession";
import { getErrorMessage } from "@/utils/authUtils";

export function AuthContainer() {
  const {
    errorMessage,
    setErrorMessage,
    step,
    setStep,
    userEmail,
    setUserEmail
  } = useAuthState();

  useAuthSession(setErrorMessage);

  const handleEmailSubmit = async (values: { email: string }) => {
    try {
      setErrorMessage(""); // Clear any previous errors
      console.log("Checking email:", values.email);
      
      // First, try to get user by email using signInWithPassword
      // We use a random password to trigger the "Invalid login credentials" error
      // which confirms the email exists
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: Math.random().toString(36),
      });

      console.log("Email check response:", error);

      // If we get "Invalid login credentials", it means the email exists
      if (error?.message === "Invalid login credentials") {
        console.log("Email exists, directing to login");
        setUserEmail(values.email);
        setStep("password");
      } else {
        // If we get any other error, assume the user doesn't exist
        console.log("Email not found, directing to register");
        setUserEmail(values.email);
        setStep("register");
      }
      
    } catch (error) {
      console.error("Error checking email:", error);
      setErrorMessage("Une erreur est survenue lors de la vérification de l'email");
    }
  };

  const handleLoginSubmit = async (values: { email: string; password: string }) => {
    try {
      setErrorMessage("");
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