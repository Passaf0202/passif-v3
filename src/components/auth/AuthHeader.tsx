
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { NavbarLogo } from "@/components/navbar/NavbarLogo";

export function AuthHeader() {
  const navigate = useNavigate();

  return (
    <div className="w-full px-4 py-3 flex items-center">
      <Button 
        variant="ghost" 
        className="-ml-3" 
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <div className="flex-1 flex justify-center">
        <NavbarLogo />
      </div>
    </div>
  );
}
