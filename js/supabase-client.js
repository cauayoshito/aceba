/* ================================================================
   ACEBA: Supabase client
   - Apenas anon key (NUNCA service_role_key)
   - Expõe window.acebaSupabaseClient + window.isSupabaseConfigured
   ================================================================ */

const SUPABASE_URL      = "https://cgvdzxklsjxudhpmripa.supabase.co";
// Cole aqui a "anon public" key do Supabase (Project Settings → API).
// Deve ser um JWT longo começando com "eyJ..." OU o novo formato "sb_publishable_..."
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndmR6eGtsc2p4dWRocG1yaXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NDM4MTUsImV4cCI6MjA5MzMxOTgxNX0.vepS6cCFpVKo0dWAnmY68Y5hPHtzB5k5ldzP0hp1x1s";

const URL_LOOKS_VALID =
  typeof SUPABASE_URL === "string" &&
  /^https:\/\/[a-z0-9-]+\.supabase\.co/i.test(SUPABASE_URL) &&
  !/COLE_A|YOUR_SUPABASE|EXEMPLO/i.test(SUPABASE_URL);

const KEY_LOOKS_VALID =
  typeof SUPABASE_ANON_KEY === "string" &&
  SUPABASE_ANON_KEY.length > 20 &&
  !/COLE_A|YOUR_SUPABASE|EXEMPLO/i.test(SUPABASE_ANON_KEY);

let supabase = null;

if (URL_LOOKS_VALID && KEY_LOOKS_VALID) {
  // Suporta tanto window.supabase (CDN v2 UMD) quanto supabaseJs (algumas builds)
  const factory = window.supabase || window.supabaseJs;
  if (factory && typeof factory.createClient === "function") {
    try {
      supabase = factory.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
      console.error("[ACEBA] Falha ao criar cliente Supabase:", e);
    }
  } else {
    console.warn("[ACEBA] @supabase/supabase-js não carregado ainda. Verifique a ordem dos <script>.");
  }
}

window.acebaSupabaseClient = supabase;
window.isSupabaseConfigured = Boolean(supabase);
