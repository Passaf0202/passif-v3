import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Grid, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function TopCategoriesSection() {
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("level", 1)
        .limit(10);
      
      if (data) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <Grid className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold text-gray-900">Top catégories</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => navigate(`/search?category=${encodeURIComponent(category.name)}`)}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                {category.icon ? (
                  <img 
                    src={category.icon} 
                    alt={category.name}
                    className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <List className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                )}
                <h3 className="font-medium text-gray-900">{category.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}