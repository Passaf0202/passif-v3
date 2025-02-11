
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://khqmoyqakgwdqixnsxzl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocW1veXFha2d3ZHFpeG5zeHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1MTk2MTgsImV4cCI6MjA1MjA5NTYxOH0.I8eL_ijIYerl_b06eaMSNoFXW2xSdsb3i7v_3IetZvE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});
