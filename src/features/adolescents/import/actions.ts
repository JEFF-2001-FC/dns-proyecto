"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "@/lib/supabase-errors";
import { todayLima } from "@/lib/dates";
import { IMPORT_COLUMNS, MAX_IMPORT_ROWS, type ImportRecord } from "./columns";

const recordSchema = z.object(
  Object.fromEntries(IMPORT_COLUMNS.map((c) => [c.key, z.string().trim().max(200)])) as Record<keyof ImportRecord, z.ZodString>,
);

const payloadSchema = z.array(recordSchema).min(1, { error: "No hay filas válidas" }).max(MAX_IMPORT_ROWS);

export type ImportResult =
  | { ok: true; batch: string; imported: number; failed: number; errors: { name: string; error: string }[] }
  | { ok: false; message: string };

const CHUNK = 500;

/**
 * 1) Inserta las filas en staging_adolescents con un lote único.
 * 2) Ejecuta process_staging_adolescents(lote): valida, crea adolescente + ágape + clan + apoderado + curso.
 * 3) Devuelve el resumen y las filas con error.
 */
export async function importAdolescents(records: ImportRecord[]): Promise<ImportResult> {
  const parsed = payloadSchema.safeParse(records);
  if (!parsed.success) return { ok: false, message: z.prettifyError(parsed.error) };

  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) return { ok: false, message: "Solo un administrador puede importar." };

  const batch = `web-${todayLima()}-${Date.now().toString(36)}`;
  const rows = parsed.data.map((r) => ({ ...r, batch }));

  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from("staging_adolescents").insert(rows.slice(i, i + CHUNK));
    if (error) return { ok: false, message: friendlyError(error, "No se pudo subir el archivo.") };
  }

  const { data: summary, error: processError } = await supabase.rpc("process_staging_adolescents", { p_batch: batch });
  if (processError) return { ok: false, message: friendlyError(processError, "No se pudo procesar la importación.") };

  const { imported = 0, failed = 0 } = ((summary ?? []) as { imported: number; failed: number }[])[0] ?? {};

  const { data: failedRows } = await supabase
    .from("staging_adolescents")
    .select("first_name, last_name, import_error")
    .eq("batch", batch)
    .eq("import_status", "error")
    .order("id");

  revalidatePath("/adolescentes");

  return {
    ok: true,
    batch,
    imported,
    failed,
    errors: (failedRows ?? []).map((r) => ({
      name: `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || "(sin nombre)",
      error: r.import_error ?? "Error desconocido",
    })),
  };
}
