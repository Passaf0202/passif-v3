import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const emailSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide"),
});

const loginSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [step, setStep] = useState<"email" | "password" | "register">("email");
  const [userEmail, setUserEmail] = useState("");

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
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

  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        if (error.message.includes("Email not found")) {
          setUserEmail(values.email);
          setStep("register");
        } else {
          setErrorMessage(getErrorMessage(error));
        }
      } else {
        setUserEmail(values.email);
        setStep("password");
        loginForm.setValue("email", values.email);
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setErrorMessage("Une erreur est survenue lors de la vérification de l'email");
    }
  };

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
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
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="votre@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                  Continuer
                </Button>
              </form>
            </Form>
          )}

          {step === "password" && (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                  Se connecter
                </Button>
              </form>
            </Form>
          )}

          {step === "register" && (
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
              defaultValues={{
                email: userEmail,
              }}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;