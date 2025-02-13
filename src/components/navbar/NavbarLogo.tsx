
import { Link } from "react-router-dom";

export const NavbarLogo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
      <img 
        src="/placeholder.svg"
        alt="TRADECOINER" 
        className="h-8 w-8 object-contain"
      />
      <span className="text-xl font-bold tracking-tight text-black">TRADECOINER</span>
    </Link>
  );
};
