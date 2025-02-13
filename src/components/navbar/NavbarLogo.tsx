
import { Link } from "react-router-dom";

export const NavbarLogo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
      <img 
        src="/lovable-uploads/405871c2-f24f-4762-8812-0c16310c4b08.png" 
        alt="TRADECOINER" 
        className="h-8 w-8" 
      />
      <span className="text-xl font-bold tracking-tight text-black">TRADECOINER</span>
    </Link>
  );
};
