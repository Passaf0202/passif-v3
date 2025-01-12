import { useState } from "react";

export type AuthStep = "email" | "password" | "register";

export const useAuthState = () => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [step, setStep] = useState<AuthStep>("email");
  const [userEmail, setUserEmail] = useState("");

  return {
    errorMessage,
    setErrorMessage,
    step,
    setStep,
    userEmail,
    setUserEmail
  };
};