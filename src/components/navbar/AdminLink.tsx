
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const AdminLink = () => {
  const { user } = useAuth();

  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc('has_role', {
        _role: 'admin'
      });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  if (!isAdmin) return null;

  return (
    <Link 
      to="/admin" 
      className="text-gray-600 hover:text-gray-900 transition-colors"
      title="Administration"
    >
      <Settings className="h-6 w-6" />
    </Link>
  );
};
