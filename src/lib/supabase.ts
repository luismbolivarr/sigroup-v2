import { createClient } from "@supabase/supabase-js";

// Hardcoded temporalmente para descartar problemas de caché de Vite
const supabaseUrl = "https://fssbwisqfvkriyixqzec.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzc2J3aXNxZnZrcml5aXhxemVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNzA2MjUsImV4cCI6MjEwNTc0NjYyNX0.LmQBMfhBuRE8IVUSpFlzEmjKe_KopGkmFRdASooiBhQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
