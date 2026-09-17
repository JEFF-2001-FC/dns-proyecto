import type { PostgrestError } from "@supabase/supabase-js";

const BY_CODE: Record<string, string> = {
  "23505": "Ese registro ya existe.",
  "42501": "No tienes permiso para esta acción.",
  "23503": "Falta un dato relacionado (ágape, clan o reunión).",
  "22023": "Hay un dato no válido.",
};

/** Mensaje entendible para el usuario. Las funciones SQL ya devuelven mensajes en español. */
export function friendlyError(error: PostgrestError | null | undefined, fallback = "No se pudo guardar."): string {
  if (!error) return fallback;
  // Los RAISE EXCEPTION de nuestras funciones vienen con texto propio en español.
  if (error.message && !error.message.startsWith("new row violates") && !/duplicate key/i.test(error.message)) {
    return error.message;
  }
  return BY_CODE[error.code] ?? fallback;
}
