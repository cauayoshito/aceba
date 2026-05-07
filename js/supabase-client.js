/* ================================================================
   ACEBA: Supabase client
   - Apenas anon key (NUNCA service_role_key)
   - Expõe window.acebaSupabaseClient + window.isSupabaseConfigured
   ================================================================ */

const ACEBA_SUPABASE_URL = "https://cgvdzxklsjxudhpmripa.supabase.co";
const ACEBA_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndmR6eGtsc2p4dWRocG1yaXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NDM4MTUsImV4cCI6MjA5MzMxOTgxNX0.vepS6cCFpVKo0dWAnmY68Y5hPHtzB5k5ldzP0hp1x1s";

window.acebaSupabaseClient =
  window.supabase &&
  ACEBA_SUPABASE_URL.startsWith("https://") &&
  ACEBA_SUPABASE_ANON_KEY.length > 30 &&
  !ACEBA_SUPABASE_URL.includes("COLE_A_URL_AQUI") &&
  !ACEBA_SUPABASE_ANON_KEY.includes("COLE_A_ANON_KEY_AQUI")
    ? window.supabase.createClient(ACEBA_SUPABASE_URL, ACEBA_SUPABASE_ANON_KEY)
    : null;

window.isSupabaseConfigured = Boolean(window.acebaSupabaseClient);
