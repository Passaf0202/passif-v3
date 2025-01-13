import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const NavbarCategories = () => {
  const isMobile = useIsMobile();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("Fetching main categories...");
      const { data: mainCategories, error } = await supabase
        .from("categories")
        .select("*")
        .eq("level", 1)
        .order("name");
      
      if (error) throw error;
      
      const categoriesWithSubs = await Promise.all(
        mainCategories.map(async (category) => {
          const { data: subcategories } = await supabase
            .from("categories")
            .select("*")
            .eq("parent_id", category.id)
            .order("name");
          
          return {
            ...category,
            subcategories: subcategories || []
          };
        })
      );
      
      return categoriesWithSubs;
    }
  });

  const handleCategoryClick = (categoryName: string) => {
    if (isMobile) {
      setOpenCategory(openCategory === categoryName ? null : categoryName);
    }
  };

  return (
    <div className="border-t bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex px-4 py-2 gap-6 items-center min-w-max">
            {categories?.map((category) => (
              <div key={category.id} className="relative">
                {isMobile ? (
                  <>
                    <button
                      onClick={() => handleCategoryClick(category.name)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
                    >
                      {category.name}
                      <ChevronDown className={`h-4 w-4 transition-transform ${
                        openCategory === category.name ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {openCategory === category.name && (
                      <div className="fixed inset-x-0 top-[8.5rem] bg-white border-t border-b z-50">
                        <div className="py-2">
                          <Link
                            to={`/category/${category.name.toLowerCase()}`}
                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                          >
                            Tout {category.name.toLowerCase()}
                          </Link>
                          {category.subcategories?.map((subcategory) => (
                            <Link
                              key={subcategory.id}
                              to={`/category/${category.name.toLowerCase()}/${subcategory.name.toLowerCase()}`}
                              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                            >
                              {subcategory.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="group relative">
                    <button
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      {category.name}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    
                    <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-64 bg-white border rounded-md shadow-lg z-50">
                      <div className="py-2">
                        <Link
                          to={`/category/${category.name.toLowerCase()}`}
                          className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                        >
                          Tout {category.name.toLowerCase()}
                        </Link>
                        {category.subcategories?.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            to={`/category/${category.name.toLowerCase()}/${subcategory.name.toLowerCase()}`}
                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};