
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      return data?.value as { url: string };
    },
    initialData: { url: '/placeholder.svg' },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
      <img 
        src={logoSettings?.url || '/placeholder.svg'}
        alt="Logo TRADECOINER" 
        className="h-8 w-auto dark:invert"
        onError={(e) => {
          console.error('Logo loading error, falling back to placeholder');
          e.currentTarget.src = '/placeholder.svg';
        }}
      />
      <span className="text-xl font-bold tracking-tight text-black">TRADECOINER</span>
    </Link>
  );
};
