import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const NavbarCategories = () => {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("Fetching categories...");
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("level", 1)
        .order("name")
        .limit(10); // Limit to prevent overflow
      
      if (error) throw error;
      console.log("Fetched categories:", data);
      return data;
    }
  });

  return (
    <div className="bg-white border-t">
      <div className="max-w-7xl mx-auto">
        <div className="flex overflow-x-auto no-scrollbar">
          <div className="flex px-4 sm:px-6 lg:px-8 py-2 gap-8 w-full justify-between">
            {categories?.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.name.toLowerCase()}`}
                className="text-sm text-gray-600 whitespace-nowrap hover:text-primary transition-colors capitalize"
              >
                {category.name.toLowerCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};