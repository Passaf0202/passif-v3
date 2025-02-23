
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingForm } from "./ListingForm";
import DiamondViewer from "@/components/home/DiamondViewer";

interface MobileCreateListingProps {
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  isSubmitting: boolean;
}

export function MobileCreateListing({ onClose, onSubmit, isSubmitting }: MobileCreateListingProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b flex items-center px-4">
        <div className="absolute left-0 right-0 flex justify-center">
          <img 
            src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//tradecoiner-logo.svg.png"
            alt="Tradecoiner" 
            className="h-8 w-auto"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </header>

      <main className="pt-14">
        <div className="relative bg-background">
          <div className="absolute inset-0">
            <DiamondViewer state="processing" />
          </div>
          <div className="relative px-4 py-6">
            <h1 className="text-2xl font-bold text-center highlight-stabilo inline-block">
              Créer une annonce
            </h1>
          </div>
        </div>

        <div className="px-4 pb-16">
          <ListingForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
        </div>
      </main>
    </div>
  );
}
