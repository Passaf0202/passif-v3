
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const NavbarLogo = () => {
  const [imageError, setImageError] = useState(false);
  const fallbackLogo = "/placeholder.svg";

  const uploadLogo = async (file: File) => {
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(`logos/${crypto.randomUUID()}`, file);

    if (error) {
      console.error('Error uploading logo:', error);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path);

    // Here you would typically save this URL to your database
    console.log('Logo uploaded successfully:', publicUrl);
  };

  return (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
      <img 
        src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/uploads/logo.png"
        onError={(e) => {
          setImageError(true);
          e.currentTarget.src = fallbackLogo;
        }}
        alt="TRADECOINER" 
        className="h-8 w-8 object-contain"
      />
      <span className="text-xl font-bold tracking-tight text-black">TRADECOINER</span>
    </Link>
  );
};
