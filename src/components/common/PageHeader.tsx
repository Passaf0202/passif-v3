
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
}

export function PageHeader({ title, showBackButton = true }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <div className="absolute inset-0">
        <DiamondViewer state="initial" />
      </div>
      
      {showBackButton && (
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10"
        >
          <X className="h-6 w-6" />
        </Button>
      )}

      <div className="relative pt-16 pb-8 text-center flex flex-col items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-4">
          <img 
            src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Logo%20Tradecoiner%20(1).svg" 
            alt="Tradecoiner"
            className="h-10 w-10"
          />
          <h1 className="text-3xl font-bold highlight-stabilo inline-block px-4 py-1">
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
}
