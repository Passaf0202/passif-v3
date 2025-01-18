import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { listing } = location.state || {};

  useEffect(() => {
    // Rediriger vers la page du listing car nous n'utilisons plus Stripe
    if (listing) {
      navigate(`/listings/${listing.id}`);
    } else {
      navigate("/");
    }
  }, [listing, navigate]);

  return null;
}