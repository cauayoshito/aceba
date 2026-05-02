import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const SUPABASE_URL = "https://cgvdzxklsjxudhpmripa.supabase.co";
export const SUPABASE_ANON_KEY =
  "sb_publishable_NL6uC5IbumZ1BsuHrxHKyw_lCTbacZK";

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_ANON_KEY.length > 30 &&
  !SUPABASE_URL.includes("COLE_AQUI") &&
  !SUPABASE_ANON_KEY.includes("COLE_AQUI");

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
