
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { SearchResults } from "@/components/search/SearchResults";
import { Footer } from "@/components/Footer";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const { data: listings = [] } = useQuery({
    queryKey: ["listings", query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .ilike("title", `%${query || ""}%`);

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <SearchResults listings={listings} />
      </main>
      <Footer />
    </div>
  );
};

export default Search;
