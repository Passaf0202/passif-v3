
import { Link } from "react-router-dom";

export const NavbarLogo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
      <img 
        src="/lovable-uploads/bfc65798-fd71-47eb-af23-855859554d4a.png"
        alt="TRADECOINER" 
        className="h-8 w-8 object-contain"
      />
      <span className="text-xl font-bold tracking-tight text-black">TRADECOINER</span>
    </Link>
  );
};
