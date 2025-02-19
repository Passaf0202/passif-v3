
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthSession } from "@/hooks/useAuthSession";
import { getErrorMessage } from "@/utils/authUtils";
import { AuthHeader } from "./AuthHeader";
import { AuthFormContainer } from "./AuthFormContainer";
import { DiamondViewer } from "../home/DiamondViewer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function AuthContainer() {
  const {
    errorMessage,
    setErrorMessage,
    step,
    setStep,
    userEmail,
    setUserEmail
  } = useAuthState();

  const [hoverGoogle, setHoverGoogle] = useState(false);
  const [hoverApple, setHoverApple] = useState(false);
  const isMobile = useIsMobile();

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

  const handleSocialInteraction = (provider: 'google' | 'apple', isActive: boolean) => {
    if (provider === 'google') {
      setHoverGoogle(isActive);
    } else {
      setHoverApple(isActive);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      <AuthHeader />
      <div className="mx-auto px-4 md:max-w-xl pt-2 md:pt-4">
        <div className="text-center">
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight mb-2 md:mb-4 ${!isMobile ? 'whitespace-nowrap' : ''}`}>
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
        </div>

        <div className="h-32 md:h-40 mb-2">
          <DiamondViewer state="initial" />
        </div>

        <div className="space-y-4">
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

          <div className="flex flex-col space-y-3">
            <Button 
              className="w-full bg-black hover:bg-white text-white hover:text-black rounded-full border border-black transition-all duration-200 h-10"
              onMouseEnter={() => handleSocialInteraction('google', true)}
              onMouseLeave={() => handleSocialInteraction('google', false)}
              onTouchStart={() => handleSocialInteraction('google', true)}
              onTouchEnd={() => handleSocialInteraction('google', false)}
              onClick={() => handleSocialLogin('google')}
            >
              <img 
                src={hoverGoogle 
                  ? "https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//google.png"
                  : "https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//google%20(1).png"
                } 
                alt="Google" 
                className="w-4 h-4 mr-2 invert-0 hover:invert" 
                style={{
                  filter: hoverGoogle ? 'invert(1)' : 'none'
                }}
              />
              Google
            </Button>
            <Button 
              className="w-full bg-black hover:bg-white text-white hover:text-black rounded-full border border-black transition-all duration-200 h-10"
              onMouseEnter={() => handleSocialInteraction('apple', true)}
              onMouseLeave={() => handleSocialInteraction('apple', false)}
              onTouchStart={() => handleSocialInteraction('apple', true)}
              onTouchEnd={() => handleSocialInteraction('apple', false)}
              onClick={() => handleSocialLogin('apple')}
            >
              <img 
                src={hoverApple 
                  ? "https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//apple-logo.png"
                  : "https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//apple-logo%20(1).png"
                } 
                alt="Apple" 
                className="w-4 h-4 mr-2" 
                style={{
                  filter: hoverApple ? 'invert(1)' : 'none'
                }}
              />
              Apple
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
