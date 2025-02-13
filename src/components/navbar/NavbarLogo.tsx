
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
      
      if (error) throw error;
      return data?.value as { url: string };
    },
    initialData: { url: '/placeholder.svg' }
  });

  return (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
      <img 
        src={logoSettings?.url || '/placeholder.svg'}
        alt="TRADECOINER" 
        className="h-8 w-8 object-contain"
        onError={(e) => {
          e.currentTarget.src = '/placeholder.svg';
        }}
      />
      <span className="text-xl font-bold tracking-tight text-black">TRADECOINER</span>
    </Link>
  );
};
