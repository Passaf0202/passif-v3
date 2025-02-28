
import { useState, useEffect } from 'react';

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  placeholder?: string;
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  width: 300,
  height: 300,
  quality: 80,
  format: 'webp',
  placeholder: '/placeholder.svg'
};

/**
 * Hook pour optimiser les URLs d'images, réduire l'Egress et améliorer les performances
 */
export function useOptimizedImage(originalUrl: string | undefined, options: Partial<ImageOptimizationOptions> = {}) {
  const [optimizedUrl, setOptimizedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const opts = { ...DEFAULT_OPTIONS, ...options };

  useEffect(() => {
    if (!originalUrl) {
      setOptimizedUrl(opts.placeholder || DEFAULT_OPTIONS.placeholder!);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Vérifier si c'est une image de placeholder
      if (originalUrl.includes('placeholder') || originalUrl.includes('data:image')) {
        setOptimizedUrl(originalUrl);
        setIsLoading(false);
        return;
      }

      // Images Supabase Storage
      if (originalUrl.includes('supabase.co')) {
        const params = new URLSearchParams();
        if (opts.width) params.append('width', opts.width.toString());
        if (opts.height) params.append('height', opts.height.toString());
        params.append('resize', 'contain');
        if (opts.quality) params.append('quality', opts.quality.toString());
        if (opts.format) params.append('format', opts.format);
        
        const optimized = `${originalUrl}?${params.toString()}`;
        setOptimizedUrl(optimized);
      } 
      // Images externes (Fallback)
      else {
        setOptimizedUrl(originalUrl);
      }
    } catch (err) {
      console.error('Error optimizing image:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setOptimizedUrl(opts.placeholder || DEFAULT_OPTIONS.placeholder!);
    } finally {
      setIsLoading(false);
    }
  }, [originalUrl, opts.width, opts.height, opts.quality, opts.format, opts.placeholder]);

  return { optimizedUrl, isLoading, error };
}
