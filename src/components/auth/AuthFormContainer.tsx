import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmailStep } from "./EmailStep";
import { LoginStep } from "./LoginStep";
import { RegisterStep } from "./RegisterStep";
import { AuthStep } from "@/hooks/useAuthState";

type AuthFormContainerProps = {
  step: AuthStep;
  errorMessage: string;
  userEmail: string;
  onEmailSubmit: (values: { email: string }) => Promise<void>;
  onLoginSubmit: (values: { email: string; password: string }) => Promise<void>;
};

export function AuthFormContainer({
  step,
  errorMessage,
  userEmail,
  onEmailSubmit,
  onLoginSubmit,
}: AuthFormContainerProps) {
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {step === "email" && (
          <EmailStep onSubmit={onEmailSubmit} />
        )}

        {step === "password" && (
          <LoginStep 
            email={userEmail}
            onSubmit={onLoginSubmit}
          />
        )}

        {step === "register" && (
          <RegisterStep email={userEmail} />
        )}
      </div>
    </div>
  );
}