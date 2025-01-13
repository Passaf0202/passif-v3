import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

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
      <NavigationMenu>
        <NavigationMenuList className="flex px-4 py-1 gap-4 h-12 items-center overflow-x-auto no-scrollbar">
          {categories?.map((category) => (
            <NavigationMenuItem key={category.id} className="flex-shrink-0">
              {isMobile ? (
                <div className="relative">
                  <button
                    onClick={() => handleCategoryClick(category.name)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition-colors capitalize whitespace-nowrap"
                  >
                    {category.name.toLowerCase()}
                    <ChevronDown className={`h-4 w-4 transition-transform ${
                      openCategory === category.name ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {openCategory === category.name && (
                    <div className="absolute left-0 top-full mt-1 w-screen max-w-[280px] bg-white border rounded-md shadow-lg z-50 py-2">
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
                          className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 capitalize"
                        >
                          {subcategory.name.toLowerCase()}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <NavigationMenuTrigger className="text-sm text-gray-600 hover:text-primary transition-colors capitalize bg-transparent h-9 px-2">
                    {category.name.toLowerCase()}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <div className="row-span-3">
                        <Link
                          to={`/category/${category.name.toLowerCase()}`}
                          className="flex h-full w-full select-none 
                          flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Tout {category.name.toLowerCase()}
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Voir toutes les annonces
                          </p>
                        </Link>
                      </div>
                      <div className="grid gap-2">
                        {category.subcategories?.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            to={`/category/${category.name.toLowerCase()}/${subcategory.name.toLowerCase()}`}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none capitalize">
                              {subcategory.name.toLowerCase()}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};