export function getSupabaseConfig(
  supabaseUrl: string | undefined,
  supabaseAnonKey: string | undefined
) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Falta una o ambas variables de entorno requeridas: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. " +
        "Copia .env.example a .env y rellena los valores de Supabase."
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}
