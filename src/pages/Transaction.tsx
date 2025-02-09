
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { EscrowDetails } from "@/components/escrow/EscrowDetails";

export default function Transaction() {
  const { id } = useParams();

  if (!id) return null;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <EscrowDetails transactionId={id} />
      </div>
    </div>
  );
}
