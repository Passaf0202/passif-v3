import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

type RegisterStepProps = {
  email: string;
};

export function RegisterStep({ email }: RegisterStepProps) {
  return (
    <Auth 
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
      defaultEmail={email}
    />
  );
}