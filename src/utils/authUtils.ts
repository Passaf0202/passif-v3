import { AuthError } from "@supabase/supabase-js";

export const getErrorMessage = (error: AuthError) => {
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
  if (error.message.includes("User already registered")) {
    return "Un compte existe déjà avec cet email";
  }
  return "Une erreur est survenue. Veuillez réessayer.";
};