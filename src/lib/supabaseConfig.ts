export function getSupabaseConfig(
  supabaseUrl: string | undefined,
  supabaseAnonKey: string | undefined
) {
  const missingFields = [
    !supabaseUrl ? "VITE_SUPABASE_URL" : null,
    !supabaseAnonKey ? "VITE_SUPABASE_ANON_KEY" : null,
  ].filter((field): field is string => Boolean(field));

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${missingFields.join(", ")}. ` +
        "Copia .env.example a .env y rellena los valores de Supabase."
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}
