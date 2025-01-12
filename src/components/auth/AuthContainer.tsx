import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthSession } from "@/hooks/useAuthSession";
import { getErrorMessage } from "@/utils/authUtils";
import { AuthHeader } from "./AuthHeader";
import { AuthFormContainer } from "./AuthFormContainer";

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
      
      // Use signInWithOtp with shouldCreateUser: false to check if email exists
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          shouldCreateUser: false
        }
      });

      console.log("Email check response:", error);

      // If we get "Email not found", the user doesn't exist
      if (error?.message.includes("Email not found")) {
        console.log("Email not found, directing to register");
        setUserEmail(values.email);
        setStep("register");
      } else {
        // If no error or different error, assume user exists
        console.log("Email exists, directing to login");
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
      <AuthHeader step={step} />
      <AuthFormContainer
        step={step}
        errorMessage={errorMessage}
        userEmail={userEmail}
        onEmailSubmit={handleEmailSubmit}
        onLoginSubmit={handleLoginSubmit}
      />
    </div>
  );
}