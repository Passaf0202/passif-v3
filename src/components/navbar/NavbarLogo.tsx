
import { Link } from "react-router-dom";

export const NavbarLogo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
      <img 
        src="/lovable-uploads/b180dfb2-7810-4b3e-8315-2704d3e69c1e.png" 
        alt="TRADECOINER" 
        className="h-6 w-6" 
      />
      <span className="text-xl font-bold tracking-tight text-black">TRADECOINER</span>
    </Link>
  );
};
