
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

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <EscrowDetails transactionId={id} />
      </div>
    </div>
  );
}
