
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
      console.log('Logo data:', data?.value);
      return data?.value as { url: string };
    },
    initialData: { url: '/placeholder.svg' }
  });

  return (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
      <img 
        src={logoSettings?.url}
        alt="TRADECOINER" 
        className="h-10 w-auto object-contain"
        onError={(e) => {
          console.error('Logo loading error, falling back to placeholder');
          e.currentTarget.src = '/placeholder.svg';
        }}
      />
      <span className="text-xl font-bold tracking-tight text-black">TRADECOINER</span>
    </Link>
  );
};
