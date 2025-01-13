import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-[#FFE5D9] to-[#FFD6CC] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            C'est le moment de vendre
          </h1>
          <Link to="/create">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Plus className="h-5 w-5 mr-2" />
              Déposer une annonce
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full transform translate-x-20 -translate-y-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full transform -translate-x-32 translate-y-32" />
    </div>
  );
}