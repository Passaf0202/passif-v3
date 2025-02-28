
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { RecentSearchesSection } from "@/components/home/RecentSearchesSection";
import { FavoritesSection } from "@/components/home/FavoritesSection";
import { TopCategoriesSection } from "@/components/home/TopCategoriesSection";
import { RecommendedListingsSection } from "@/components/home/RecommendedListingsSection";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Composant de chargement
const SectionLoader = () => (
  <div className="py-12 flex justify-center items-center">
    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        <Suspense fallback={<SectionLoader />}>
          <RecentSearchesSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <FavoritesSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <TopCategoriesSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <RecommendedListingsSection />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default Index;
