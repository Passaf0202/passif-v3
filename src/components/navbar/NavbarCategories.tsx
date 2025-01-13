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

  return (
    <div className="border-t bg-white overflow-x-auto no-scrollbar">
      <NavigationMenu>
        <NavigationMenuList className="flex px-4 py-1 gap-6 h-12 items-center">
          {categories?.map((category) => (
            <NavigationMenuItem key={category.id} className="flex-shrink-0">
              {isMobile ? (
                <Link
                  to={`/category/${category.name.toLowerCase()}`}
                  className="text-sm text-gray-600 hover:text-primary transition-colors capitalize whitespace-nowrap"
                >
                  {category.name.toLowerCase()}
                </Link>
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