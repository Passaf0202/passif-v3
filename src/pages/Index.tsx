import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { ListingCard } from "@/components/ListingCard";

// Données de test
const mockListings = [
  {
    id: 1,
    title: "iPhone 13 Pro Max",
    price: 899,
    location: "Paris",
    image: "https://picsum.photos/400/300",
  },
  {
    id: 2,
    title: "Vélo électrique",
    price: 1200,
    location: "Lyon",
    image: "https://picsum.photos/400/301",
  },
  {
    id: 3,
    title: "Canapé cuir",
    price: 450,
    location: "Marseille",
    image: "https://picsum.photos/400/302",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchBar />
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Annonces récentes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockListings.map((listing) => (
              <ListingCard
                key={listing.id}
                title={listing.title}
                price={listing.price}
                location={listing.location}
                image={listing.image}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;