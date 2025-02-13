
import { Link } from "react-router-dom";
import { Diamond } from "lucide-react";

export const NavbarLogo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
      <Diamond className="h-6 w-6 text-black" />
      <span className="text-xl font-bold tracking-tight text-black">TRADECOINER</span>
    </Link>
  );
};
