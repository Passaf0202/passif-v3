
import { useParams, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { EscrowDetails } from "@/components/escrow/EscrowDetails";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();

  // Si l'authentification est en cours, afficher rien
  if (loading) {
    return null;
  }

  // Redirection vers la page d'authentification si non connecté
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!id) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Transaction non trouvée
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Format d'ID de transaction invalide
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <EscrowDetails transactionId={id} />
      </div>
    </div>
  );
}
