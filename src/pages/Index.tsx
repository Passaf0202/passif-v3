
import { HeroSection } from "@/components/home/HeroSection";
import { RecentSearchesSection } from "@/components/home/RecentSearchesSection";
import { FavoritesSection } from "@/components/home/FavoritesSection";
import { TopCategoriesSection } from "@/components/home/TopCategoriesSection";
import { RecommendedListingsSection } from "@/components/home/RecommendedListingsSection";

const Index = () => {
  return (
    <>
      <HeroSection />
      <RecentSearchesSection />
      <FavoritesSection />
      <TopCategoriesSection />
      <RecommendedListingsSection />
    </>
  );
}

export default Index;
