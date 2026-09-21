"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";

export async function uploadMaterial(formData: FormData): Promise<void> {
  const user = await requireRole("admin");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const kind = String(formData.get("kind") ?? "file");
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const file = formData.get("file");
  if (!title || !["file", "link", "note"].includes(kind)) throw new Error("Completa el título y el tipo de recurso.");
  if (kind === "link" && !/^https?:\/\//i.test(externalUrl)) throw new Error("Escribe un enlace válido que empiece con https://.");
  if (kind === "note" && !body) throw new Error("Escribe el contenido de la nota.");
  if (kind === "file" && (!(file instanceof File) || file.size === 0)) throw new Error("Selecciona un archivo PDF.");
  if (kind === "file" && file instanceof File && file.type !== "application/pdf") throw new Error("Por ahora solo se aceptan archivos PDF.");
  if (kind === "file" && file instanceof File && file.size > 10 * 1024 * 1024) throw new Error("El PDF supera el límite de 10 MB.");
  const admin = createAdminClient();
  let path: string | null = null;
  if (kind === "file" && file instanceof File) { const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_"); path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`; const { error } = await admin.storage.from("dns-materials").upload(path, file, { contentType: file.type, upsert: false }); if (error) throw new Error(error.message); }
  const { error: rowError } = await admin.from("materials").insert({ title, description: description || null, kind, external_url: kind === "link" ? externalUrl : null, body: kind === "note" ? body : null, storage_path: path, file_name: kind === "file" && file instanceof File ? file.name : null, mime_type: kind === "file" && file instanceof File ? file.type : null, size_bytes: kind === "file" && file instanceof File ? file.size : null, uploaded_by: user.user.id });
  if (rowError) { if (path) await admin.storage.from("dns-materials").remove([path]); throw new Error(rowError.message); }
  revalidatePath("/materiales");
}
