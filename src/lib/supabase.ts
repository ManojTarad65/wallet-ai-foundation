import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "https://dnzqkfzdszruibyuswco.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuenFrZnpkc3pydWlieXVzd2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNjQ1OTYsImV4cCI6MjA5MTg0MDU5Nn0.pz9x-b6Ei4trKaIC2MWxT64UUAw9EyIlmmw5djpaq8M";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
