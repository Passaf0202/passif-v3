
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DiamondViewer } from "@/components/home/DiamondViewer";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  diamondScale?: number;
  showLogo?: boolean;
  titleClassName?: string;
}

export function PageHeader({ 
  title, 
  showBackButton = true, 
  diamondScale = 3.5,
  showLogo = true,
  titleClassName = "px-4"
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <div className="absolute inset-0">
        <DiamondViewer state="initial" scale={diamondScale} />
      </div>
      
      {showBackButton && (
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-black hover:bg-black/90 text-white border-none rounded-md"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      <div className="relative pt-16 pb-8 text-center flex flex-col items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-4">
          {showLogo && (
            <img 
              src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Logo%20Tradecoiner%20(1).svg" 
              alt="Tradecoiner"
              className="h-10 w-10"
            />
          )}
          <h1 className={`text-3xl font-bold highlight-stabilo inline-block py-1 ${titleClassName}`}>
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
}
