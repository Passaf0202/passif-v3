
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { RecentSearchesSection } from "@/components/home/RecentSearchesSection";
import { FavoritesSection } from "@/components/home/FavoritesSection";
import { TopCategoriesSection } from "@/components/home/TopCategoriesSection";
import { RecommendedListingsSection } from "@/components/home/RecommendedListingsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { GlobalPresenceSection } from "@/components/home/GlobalPresenceSection";
import { Separator } from "@/components/ui/separator";
import { CryptoHelperButton } from "@/components/home/CryptoHelperButton";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        <RecentSearchesSection />
        <Separator className="max-w-7xl mx-auto opacity-30" />
        
        <FavoritesSection />
        <div className="bg-gray-100">
          <TopCategoriesSection />
        </div>
        
        <FeaturesSection />
        
        <TestimonialsSection />
        
        <GlobalPresenceSection />
        <div className="bg-gray-50">
          <RecommendedListingsSection />
        </div>
      </main>

      <CryptoHelperButton />
      <Footer />
    </div>
  );
}

export default Index;
