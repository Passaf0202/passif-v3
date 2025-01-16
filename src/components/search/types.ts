export interface Suggestion {
  id: string;
  title: string;
  category?: string;
  isRecent?: boolean;
}

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  category?: string;
  condition?: string;
  shipping_method?: string;
}