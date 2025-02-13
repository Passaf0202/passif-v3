
import { Plus, Coins, Diamond, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-black/10 backdrop-blur-[1px]" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full shadow-sm">
            <Diamond className="h-5 w-5 text-black" />
            <span className="text-sm font-medium">La marketplace crypto #1 en France</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 max-w-3xl mx-auto leading-tight">
            Achetez et vendez avec
            <span className="text-black"> crypto</span>
            <br /> en toute confiance
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            TRADECOINER révolutionne les transactions en ligne en combinant la sécurité de la blockchain avec la simplicité d'une marketplace moderne.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create">
              <Button size="lg" className="group text-lg h-14 px-8 bg-black hover:bg-black/90">
                <Plus className="h-5 w-5 mr-2" />
                Déposer une annonce
                <ArrowRight className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
              </Button>
            </Link>
            <Link to="/search">
              <Button 
                variant="outline" 
                size="lg" 
                className="group text-lg h-14 px-8 border-2 border-black text-black hover:bg-black/5"
              >
                <Coins className="h-5 w-5 mr-2" />
                Explorer les annonces
              </Button>
            </Link>
          </div>
          
          <div className="pt-8 flex justify-center gap-8 text-gray-600">
            <div>
              <div className="font-bold text-2xl text-black">100K+</div>
              <div className="text-sm">Utilisateurs actifs</div>
            </div>
            <div className="border-l border-gray-300" />
            <div>
              <div className="font-bold text-2xl text-black">50K+</div>
              <div className="text-sm">Annonces publiées</div>
            </div>
            <div className="border-l border-gray-300" />
            <div>
              <div className="font-bold text-2xl text-black">24/7</div>
              <div className="text-sm">Support client</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 w-48 h-48 bg-black/10 rounded-full transform translate-x-20 -translate-y-20 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-200/50 rounded-full transform -translate-x-32 translate-y-32 blur-3xl" />
    </div>
  );
}
