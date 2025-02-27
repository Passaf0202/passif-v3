
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingForm } from "./ListingForm";
import DiamondViewer from "@/components/home/DiamondViewer";
import { Progress } from "@/components/ui/progress";

interface MobileCreateListingProps {
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  isSubmitting: boolean;
  uploadProgress?: number;
}

export function MobileCreateListing({
  onClose,
  onSubmit,
  isSubmitting,
  uploadProgress = 0
}: MobileCreateListingProps) {
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
          <div className="relative flex justify-center items-center py-6">
            <h1 className="text-2xl font-bold highlight-stabilo">
              Créer une annonce
            </h1>
          </div>
        </div>

        {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="px-4 mb-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Upload des images</span>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </div>
          </div>
        )}

        <div className="px-4 pb-16">
          <ListingForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
        </div>
      </main>
    </div>
  );
}
