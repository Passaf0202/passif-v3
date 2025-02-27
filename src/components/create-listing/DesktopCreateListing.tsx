
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingForm } from "./ListingForm";
import DiamondViewer from "@/components/home/DiamondViewer";
import { Progress } from "@/components/ui/progress";

interface DesktopCreateListingProps {
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  isSubmitting: boolean;
  uploadProgress?: number;
}

export function DesktopCreateListing({ 
  onClose, 
  onSubmit, 
  isSubmitting,
  uploadProgress = 0
}: DesktopCreateListingProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
        <div className="absolute inset-0">
          <DiamondViewer state="processing" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold highlight-stabilo inline-block">
              Créer une annonce
            </h1>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 -mt-12 pb-16">
        <div className="text-center mb-8">
          <p className="text-xl text-gray-600">
            Décrivez votre article pour le mettre en vente
          </p>
        </div>
        
        {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Upload des images</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </div>
        )}
        
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <ListingForm 
              onSubmit={onSubmit} 
              isSubmitting={isSubmitting} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
