import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { CryptoPaymentForm } from "@/components/payment/CryptoPaymentForm";

export default function Payment() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const listing = location.state?.listing;
  const returnUrl = location.state?.returnUrl;

  if (!listing) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Annonce non trouvée</p>
        </div>
      </div>
    );
  }

  const handlePaymentComplete = () => {
    navigate(returnUrl || `/listings/${listing.id}`);
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <CryptoPaymentForm
          listingId={listing.id}
          title={listing.title}
          price={listing.price}
          cryptoAmount={listing.crypto_amount}
          cryptoCurrency={listing.crypto_currency}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </div>
  );
}