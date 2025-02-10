
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { EscrowDetails } from "@/components/escrow/EscrowDetails";

export default function Payment() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Transaction non trouvée</p>
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
          <p className="text-center text-muted-foreground">Format d'ID de transaction invalide</p>
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
