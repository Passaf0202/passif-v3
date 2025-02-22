
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthSession } from "@/hooks/useAuthSession";
import { getErrorMessage } from "@/utils/authUtils";
import { AuthHeader } from "./AuthHeader";
import { AuthFormContainer } from "./AuthFormContainer";
import { DiamondWall } from "./DiamondWall";
import { Button } from "@/components/ui/button";

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
      setErrorMessage("");
      console.log("Checking email:", values.email);
      
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          shouldCreateUser: false
        }
      });

      console.log("Email check response:", error);

      if (error?.message.includes("Email not found")) {
        console.log("Email not found, directing to register");
        setUserEmail(values.email);
        setStep("register");
      } else {
        console.log("Email exists, directing to login");
        setUserEmail(values.email);
        setStep("password");
      }
      
    } catch (error) {
      console.error("Error checking email:", error);
      setUserEmail(values.email);
      setStep("register");
    }
  };

  const handleLoginSubmit = async (values: { email: string; password: string }) => {
    try {
      setErrorMessage("");
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setErrorMessage(getErrorMessage(error));
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Une erreur est survenue lors de la connexion");
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });

      if (error) {
        console.error(`${provider} login error:`, error);
        setErrorMessage(getErrorMessage(error));
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      setErrorMessage(`Une erreur est survenue lors de la connexion avec ${provider}`);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      <AuthHeader />
      <div className="md:hidden">
        <DiamondWall />
      </div>
      <div className="px-4 md:mt-8">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-center mb-8">
          Connectez-vous ou créez votre compte{" "}
          <span className="relative inline-block px-1 bg-[#CDCDCD] text-black" style={{
            transform: "skew(-12deg)",
            display: "inline-block",
          }}>
            <span style={{ display: "inline-block", transform: "skew(12deg)" }}>
              Tradecoiner
            </span>
          </span>
        </h2>

        <div className="space-y-6 max-w-sm mx-auto">
          <AuthFormContainer
            step={step}
            errorMessage={errorMessage}
            userEmail={userEmail}
            onEmailSubmit={handleEmailSubmit}
            onLoginSubmit={handleLoginSubmit}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Ou continuez avec
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleSocialLogin('google')}
            >
              <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
              Google
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleSocialLogin('apple')}
            >
              <img src="/apple.svg" alt="Apple" className="w-5 h-5 mr-2" />
              Apple
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
