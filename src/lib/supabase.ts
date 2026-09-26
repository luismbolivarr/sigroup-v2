import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./supabaseConfig";

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
