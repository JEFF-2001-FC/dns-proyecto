"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const announcementSchema = z.object({
  title: z.string().trim().min(3).max(140),
  body: z.string().trim().min(5).max(3000),
});

export async function createAnnouncement(input: unknown): Promise<{ ok: boolean; message: string }> {
  await requireRole("admin");
  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Completa el título y el anuncio." };
  const { error } = await (await createClient()).from("announcements").insert(parsed.data);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/inicio");
  return { ok: true, message: "Anuncio publicado." };
}
