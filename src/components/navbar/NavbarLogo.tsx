
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LogoSettings = {
  url: string;
};

export const NavbarLogo = () => {
  const { data: logoSettings } = useQuery({
    queryKey: ['site-settings', 'logo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'logo')
        .single();
      
      if (error) {
        console.error('Error fetching logo:', error);
        return { url: '/placeholder.svg' };
      }
      
      // Log pour vérifier la structure des données
      console.log('Raw logo data:', data);
      
      // S'assurer que value est bien un objet avec une propriété url
      const logoValue = data?.value as LogoSettings;
      console.log('Logo value:', logoValue);
      
      return logoValue || { url: '/placeholder.svg' };
    },
    initialData: { url: '/placeholder.svg' },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Log pour vérifier les données dans le rendu
  console.log('Logo settings in render:', logoSettings);

  return (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
      <img 
        src={logoSettings?.url || '/placeholder.svg'}
        alt="TRADECOINER" 
        className="h-8 w-auto max-w-[120px] object-contain"
        onError={(e) => {
          console.error('Logo loading error, falling back to placeholder');
          e.currentTarget.src = '/placeholder.svg';
        }}
      />
      <span className="text-xl font-bold tracking-tight text-black">TRADECOINER</span>
    </Link>
  );
};
