export function AuthHeader({ step }: { step: "email" | "password" | "register" }) {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        {step === "register" 
          ? "Créez votre compte"
          : "Connectez-vous ou créez votre compte"}
      </h2>
    </div>
  );
}