import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useIsMobile } from "@/hooks/use-mobile";

export const NavbarCategories = () => {
  const isMobile = useIsMobile();
  
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
      
      // Fetch subcategories for each main category
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
      
      console.log("Fetched categories with subs:", categoriesWithSubs);
      return categoriesWithSubs;
    }
  });

  return (
    <div className="bg-white border-t">
      <div className="max-w-7xl mx-auto">
        <NavigationMenu>
          <NavigationMenuList className="flex overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 py-2 gap-8">
            {categories?.map((category) => (
              <NavigationMenuItem key={category.id}>
                {isMobile ? (
                  <Link
                    to={`/category/${category.name.toLowerCase()}`}
                    className="text-sm text-gray-600 whitespace-nowrap hover:text-primary transition-colors capitalize"
                  >
                    {category.name.toLowerCase()}
                  </Link>
                ) : (
                  <>
                    <NavigationMenuTrigger className="text-sm text-gray-600 hover:text-primary transition-colors capitalize bg-transparent">
                      {category.name.toLowerCase()}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
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
    </div>
  );
};