
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LogoSettings = {
  url: string;
};

const FALLBACK_LOGO = '/placeholder.svg';

export const NavbarLogo = () => {
  const { data: logoSettings, error: logoError } = useQuery({
    queryKey: ['site-settings', 'logo'],
    queryFn: async () => {
      console.log('Fetching logo settings...');
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'logo')
        .single();

      if (error) {
        console.error('Error fetching logo from Supabase:', error);
        return { url: FALLBACK_LOGO };
      }

      if (!data?.value) {
        console.warn('No logo data found in site_settings');
        return { url: FALLBACK_LOGO };
      }

      console.log('Logo data retrieved successfully:', data.value);
      const logoValue = data.value as LogoSettings;
      
      // Validate URL format
      try {
        new URL(logoValue.url);
        return logoValue;
      } catch (e) {
        console.error('Invalid logo URL format:', logoValue.url);
        return { url: FALLBACK_LOGO };
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2
  });

  if (logoError) {
    console.error('React Query error fetching logo:', logoError);
  }

  const logoUrl = logoSettings?.url || FALLBACK_LOGO;
  console.log('Rendering logo with URL:', logoUrl);

  return (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
      <img
        src={logoUrl}
        alt="TRADECOINER"
        onError={(e) => {
          console.error('Logo loading error, falling back to placeholder');
          e.currentTarget.src = FALLBACK_LOGO;
        }}
        className="h-10 w-auto max-w-[220px] object-contain rounded-none"
      />
    </Link>
  );
};
