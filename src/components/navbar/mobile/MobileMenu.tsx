
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Search, Plus, Heart, MessageCircle, Save, ChevronRight, ArrowLeft, Wallet, User, List, LogOut, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@/types/category";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { useState, useRef, useEffect } from "react";
import { CategoryContent } from "../components/CategoryContent";
import { NavbarLogo } from "../NavbarLogo";
import { SearchInput } from "@/components/search/SearchInput";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function MobileMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("level", 1)
        .order("name");
      
      if (error) throw error;
      return data;
    }
  });

  // Nettoyer la capture vidéo lorsque le scanner est fermé
  useEffect(() => {
    if (!showQRScanner && videoRef.current?.srcObject) {
      // Arrêter tous les flux médias
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [showQRScanner]);

  const handleCreateListing = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour déposer une annonce",
      });
      // Sauvegarder l'URL de retour avant la redirection
      localStorage.setItem('redirectAfterAuth', '/create');
      navigate("/auth");
      return;
    }
    // Si l'utilisateur est connecté, naviguer directement vers la page de création
    navigate("/create");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      // Sauvegarder la recherche
      const searches = JSON.parse(localStorage.getItem("savedSearches") || "[]");
      const newSearch = {
        query: searchInput,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(
        "savedSearches",
        JSON.stringify([...searches, newSearch].slice(-10))
      );

      navigate(`/search?q=${encodeURIComponent(searchInput)}`);
      setShowSearch(false);
    }
  };

  const handleSavedSearches = () => {
    const searches = JSON.parse(localStorage.getItem("savedSearches") || "[]");
    if (searches.length === 0) {
      toast({
        title: "Aucune recherche sauvegardée",
        description: "Vos recherches seront automatiquement sauvegardées quand vous en effectuerez.",
      });
      return;
    }
    navigate("/saved-searches");
  };

  const handleWalletConnection = () => {
    const walletButton = document.querySelector('[data-testid="web3modal-connect-button"]');
    if (walletButton instanceof HTMLElement) {
      walletButton.click();
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès",
      });
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  // Démarrer la capture vidéo
  const startVideoCapture = async () => {
    try {
      setIsScanning(true);
      setScanError(null);
      
      // Vérifier si l'API BarcodeDetector est disponible
      const isBarcodeDetectorAvailable = 'BarcodeDetector' in window;
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'accès à la caméra n'est pas pris en charge par ce navigateur");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        
        if (isBarcodeDetectorAvailable) {
          startQRCodeDetection(stream);
        } else {
          // Si BarcodeDetector n'est pas disponible, montrer l'interface
          // mais sans la détection automatique - l'utilisateur devra
          // prendre une photo ou télécharger manuellement
          console.log("BarcodeDetector API n'est pas disponible");
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'accès à la caméra:", error);
      setScanError("Impossible d'accéder à la caméra. Veuillez vérifier vos permissions.");
      setIsScanning(false);
    }
  };

  // Traiter un QR code détecté
  const processQRCode = (qrValue: string) => {
    try {
      console.log("QR Code détecté:", qrValue);
      
      // Essayer de traiter comme une URL complète
      try {
        const url = new URL(qrValue);
        const listingId = url.searchParams.get('listingId');
        
        if (listingId) {
          navigate(`/checkout?listingId=${listingId}`);
          toast({
            title: "QR Code détecté",
            description: "Redirection vers la page de paiement...",
          });
          return true;
        }
      } catch (e) {
        // Ce n'est pas une URL valide, on continue
      }
      
      // Essayer d'extraire un ID directement (au cas où c'est juste un ID)
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidPattern.test(qrValue)) {
        navigate(`/checkout?listingId=${qrValue}`);
        toast({
          title: "QR Code détecté",
          description: "Redirection vers la page de paiement...",
        });
        return true;
      }
      
      // Si ce n'est ni une URL ni un UUID
      toast({
        title: "QR Code invalide",
        description: "Ce QR code ne contient pas d'information de paiement reconnaissable",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      console.error("Erreur lors du traitement du QR code:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter ce QR code",
        variant: "destructive",
      });
      return false;
    }
  };

  // Détecter les QR codes dans le flux vidéo
  const startQRCodeDetection = (stream: MediaStream) => {
    if (!('BarcodeDetector' in window)) return;
    
    // @ts-ignore - BarcodeDetector n'est pas encore dans les types TypeScript standard
    const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
    
    let isProcessing = false;
    const detectInterval = setInterval(async () => {
      if (!videoRef.current || isProcessing) return;
      
      isProcessing = true;
      try {
        // Capturer une image du flux vidéo
        const barcodes = await barcodeDetector.detect(videoRef.current);
        
        if (barcodes.length > 0) {
          clearInterval(detectInterval);
          
          // Arrêter la caméra
          stream.getTracks().forEach(track => track.stop());
          
          // Fermer le scanner
          setShowQRScanner(false);
          
          // Traiter le QR code
          processQRCode(barcodes[0].rawValue);
        }
      } catch (err) {
        console.error("Erreur lors de la détection du QR code:", err);
      } finally {
        isProcessing = false;
      }
    }, 500);
    
    // Arrêter la détection après 60 secondes
    setTimeout(() => {
      clearInterval(detectInterval);
      if (videoRef.current?.srcObject) {
        const videoStream = videoRef.current.srcObject as MediaStream;
        if (videoStream) {
          videoStream.getTracks().forEach(track => track.stop());
        }
      }
    }, 60000);
  };

  // Prendre une photo manuellement
  const capturePhoto = async () => {
    if (!videoRef.current) return;
    
    try {
      // Créer un canvas temporaire
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      // Dessiner l'image vidéo sur le canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convertir le canvas en blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });
      
      if (!blob) {
        throw new Error("Impossible de capturer l'image");
      }
      
      // Analyser l'image pour les QR codes
      await analyzeImage(blob);
      
    } catch (error) {
      console.error("Erreur lors de la capture de la photo:", error);
      toast({
        title: "Erreur",
        description: "Impossible de capturer la photo",
        variant: "destructive",
      });
    }
  };

  // Sélectionner une image depuis la galerie
  const selectImageFromGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Gérer le changement de fichier
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      await analyzeImage(files[0]);
    } catch (error) {
      console.error("Erreur lors de l'analyse de l'image:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'analyser cette image",
        variant: "destructive",
      });
    } finally {
      // Réinitialiser l'input file pour permettre la sélection du même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Analyser une image pour détecter les QR codes
  const analyzeImage = async (imageBlob: Blob) => {
    try {
      // Vérifier si l'API BarcodeDetector est disponible
      if ('BarcodeDetector' in window) {
        // @ts-ignore - BarcodeDetector n'est pas encore dans les types TypeScript standard
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        
        // Créer une image à partir du blob
        const img = new Image();
        img.src = URL.createObjectURL(imageBlob);
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        // Détecter les QR codes
        const barcodes = await barcodeDetector.detect(img);
        
        if (barcodes.length > 0) {
          // Arrêter la caméra et fermer le scanner
          if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
          }
          
          setShowQRScanner(false);
          
          // Traiter le QR code
          processQRCode(barcodes[0].rawValue);
        } else {
          toast({
            title: "Aucun QR code détecté",
            description: "Veuillez réessayer avec une autre image ou un meilleur angle",
          });
        }
      } else {
        // Si BarcodeDetector n'est pas disponible, utiliser une alternative
        // Ici, on pourrait intégrer une bibliothèque JS comme jsQR ou autre
        // Pour l'instant, on informe simplement l'utilisateur
        toast({
          title: "Non disponible",
          description: "La détection de QR code n'est pas disponible sur votre appareil",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse de l'image:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'analyser l'image pour des QR codes",
        variant: "destructive",
      });
    }
  };

  // Ouvrir le scanner QR
  const handleScanQRCode = () => {
    setShowQRScanner(true);
    // Le démarrage de la caméra se fait dans l'effet useEffect quand showQRScanner devient true
    setTimeout(() => {
      startVideoCapture();
    }, 500);
  };

  const renderMainContent = () => (
    <>
      {showSearch ? (
        <div className="p-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              titleOnly={false}
              onTitleOnlyChange={() => {}}
              showCheckbox={false}
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Rechercher
              </Button>
              <Button variant="outline" onClick={() => setShowSearch(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Top Block */}
          <div className="space-y-4 p-4 border-b border-gray-200">
            <Button 
              onClick={handleCreateListing}
              className="w-full bg-black hover:bg-black/90 text-white rounded-full h-12 flex items-center gap-3 text-base font-normal"
            >
              <Plus className="h-5 w-5" />
              Déposer une annonce
            </Button>

            {user ? (
              <div className="flex flex-col gap-3">
                <div className="w-full">
                  <WalletConnectButton className="w-full h-12 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 flex items-center justify-center gap-2 rounded-full" />
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/profile")}
                  className="w-full h-12 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 flex items-center justify-center gap-2 rounded-full"
                >
                  <User className="h-5 w-5" />
                  Mon Profil
                </Button>
                <Button
                  variant="outline"
                  onClick={handleScanQRCode}
                  className="w-full h-12 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 flex items-center justify-center gap-2 rounded-full"
                >
                  <ScanLine className="h-5 w-5" />
                  Scanner un QR code
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate("/auth")}
                className="w-full h-12 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 flex items-center justify-center gap-2 rounded-full"
              >
                <User className="h-5 w-5" />
                Se connecter
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => setShowSearch(true)}
              className="w-full justify-start h-12 px-0 hover:bg-transparent hover:text-primary text-base font-normal"
            >
              <Search className="h-5 w-5 mr-3" />
              Rechercher
            </Button>
          </div>

          {/* Actions Block */}
          <div className="py-4 border-b border-gray-200 bg-gray-50/50">
            <div className="space-y-1">
              <Button
                variant="ghost"
                onClick={() => navigate("/messages")}
                className="w-full justify-start h-12 px-4 hover:bg-white text-base font-normal"
              >
                <MessageCircle className="h-5 w-5 mr-3" />
                Messages
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate("/favorites")}
                className="w-full justify-start h-12 px-4 hover:bg-white text-base font-normal"
              >
                <Heart className="h-5 w-5 mr-3" />
                Favoris
              </Button>

              <Button
                variant="ghost"
                onClick={handleSavedSearches}
                className="w-full justify-start h-12 px-4 hover:bg-white text-base font-normal"
              >
                <Save className="h-5 w-5 mr-3" />
                Recherches sauvegardées
              </Button>

              {user && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/my-listings")}
                    className="w-full justify-start h-12 px-4 hover:bg-white text-base font-normal"
                  >
                    <List className="h-5 w-5 mr-3" />
                    Mes annonces
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start h-12 px-4 hover:bg-white text-base font-normal"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Déconnexion
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Categories Block */}
          <div className="py-4">
            <h3 className="px-4 text-sm font-semibold text-gray-500 mb-2">Catégories</h3>
            {categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left"
              >
                <span className="text-base">{capitalizeFirstLetter(category.name)}</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            ))}
          </div>

          {/* Bottom Block */}
          <div className="py-4 border-t border-gray-200">
            {!user && (
              <Link
                to="/auth"
                className="flex items-center justify-between px-4 py-3 font-medium text-primary hover:bg-gray-50"
              >
                Se connecter
                <ChevronRight className="h-5 w-5" />
              </Link>
            )}

            <div className="mt-4">
              <h3 className="px-4 text-sm font-semibold text-gray-500 mb-2">Informations pratiques</h3>
              <Link
                to="/help"
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <span className="text-base">Centre d'aide</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
              <Link
                to="/about"
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <span className="text-base">À propos</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderCategoryContent = () => (
    <div className="h-full flex flex-col">
      <SheetHeader className="h-14 px-4 flex flex-row items-center justify-between border-b">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setSelectedCategory(null)}
          className="absolute left-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex justify-center">
          <span className="text-lg font-medium">
            {capitalizeFirstLetter(selectedCategory?.name || "")}
          </span>
        </div>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto">
        {selectedCategory && (
          <CategoryContent category={selectedCategory} />
        )}
      </div>
    </div>
  );

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full p-0 border-0">
          <div className="h-full flex flex-col">
            {selectedCategory ? (
              renderCategoryContent()
            ) : (
              <>
                <SheetHeader className="h-14 px-4 flex flex-row items-center justify-between border-b">
                  <div className="flex-1 flex justify-center">
                    <NavbarLogo />
                  </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  {renderMainContent()}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal du scanner QR code */}
      <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
        <DialogContent className="sm:max-w-md p-0 gap-0">
          <DialogHeader className="p-4 text-center">
            <DialogTitle>Scanner un QR Code</DialogTitle>
            <DialogDescription>
              Positionnez le QR code dans le cadre ci-dessous
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative">
            {/* Scanner vidéo */}
            <div className="aspect-video bg-black overflow-hidden relative">
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover"
                autoPlay 
                playsInline
              />
              
              {/* Overlay avec viseur */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white w-2/3 h-2/3 rounded-lg opacity-70" />
              </div>
              
              {/* Indicateur de chargement */}
              {isScanning && !scanError && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/70 px-4 py-2 rounded-full">
                  Recherche de QR code...
                </div>
              )}
              
              {/* Message d'erreur */}
              {scanError && (
                <div className="absolute inset-0 bg-red-500/90 flex flex-col items-center justify-center p-4 text-white">
                  <h3 className="text-xl font-bold mb-2">Non disponible</h3>
                  <p className="text-center mb-4">
                    La fonctionnalité de scan de QR code n'est pas disponible sur votre appareil
                  </p>
                  <img
                    src="/lovable-uploads/4cf5131d-ddd0-4cad-a759-3e3ee9e7f024.png"
                    alt="Fonctionnalité non disponible"
                    className="w-full max-w-[240px] rounded-lg mb-4"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => setShowQRScanner(false)} 
                    className="bg-white text-red-500 hover:bg-white/90"
                  >
                    Fermer
                  </Button>
                </div>
              )}
            </div>
            
            {/* Actions en bas du scanner */}
            <div className="p-4 flex flex-col space-y-4">
              <div className="flex justify-center gap-4">
                <Button onClick={capturePhoto} disabled={!videoRef.current || !!scanError}>
                  Prendre une photo
                </Button>
                <Button variant="outline" onClick={selectImageFromGallery}>
                  Importer une image
                </Button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <p className="text-xs text-center text-muted-foreground">
                Ou importez directement une image contenant un QR code
              </p>
            </div>
          </div>
          
          <DialogFooter className="p-4 border-t">
            <Button variant="ghost" onClick={() => setShowQRScanner(false)} className="w-full">
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
