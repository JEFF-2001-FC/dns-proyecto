// Cliente con service role: IGNORA RLS. Solo en código de servidor y
// siempre después de verificar que quien llama es ADMIN (requireAdmin).
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno del servidor.");
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
