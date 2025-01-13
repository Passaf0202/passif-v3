export interface Category {
  id: string;
  name: string;
  subcategories?: Category[];
  parent_id?: string | null;
  level?: number;
  icon?: string | null;
}