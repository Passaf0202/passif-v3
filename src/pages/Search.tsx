import { Navbar } from "@/components/Navbar";
import { SearchResults } from "@/components/search/SearchResults";
import { Footer } from "@/components/Footer";

const Search = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <SearchResults />
      </main>
      <Footer />
    </div>
  );
};

export default Search;