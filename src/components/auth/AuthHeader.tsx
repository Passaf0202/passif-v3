
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { NavbarLogo } from "@/components/navbar/NavbarLogo";
import { useIsMobile } from "@/hooks/use-mobile";

export function AuthHeader() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="w-full px-4 py-3 flex items-center">
      <Button 
        variant="ghost" 
        className="-ml-3" 
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <div className={`flex-1 flex ${isMobile ? 'justify-center' : 'justify-start ml-4'}`}>
        <NavbarLogo />
      </div>
    </div>
  );
}
