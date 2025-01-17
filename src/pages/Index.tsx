import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { RecentSearchesSection } from "@/components/home/RecentSearchesSection";
import { FavoritesSection } from "@/components/home/FavoritesSection";
import { TopCategoriesSection } from "@/components/home/TopCategoriesSection";
import { RecommendedListingsSection } from "@/components/home/RecommendedListingsSection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        <RecentSearchesSection />
        <FavoritesSection />
        <TopCategoriesSection />
        <RecommendedListingsSection />
      </main>

      <Footer />
    </div>
  );
}

export default Index;