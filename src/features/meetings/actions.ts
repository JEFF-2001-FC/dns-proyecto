"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export async function deleteMeeting(meetingId: string): Promise<{ ok: boolean; message: string }> {
  await requireUser();
  if (!z.uuid().safeParse(meetingId).success) return { ok: false, message: "Reunión no válida." };
  const supabase = await createClient();
  const { error } = await supabase.from("meetings").delete().eq("id", meetingId);
  if (error) return { ok: false, message: error.code === "42501" ? "Ya pasó el plazo para eliminar esta reunión. Pide ayuda a administración." : error.message };
  revalidatePath("/reuniones");
  revalidatePath("/asistencia");
  revalidatePath("/inicio");
  return { ok: true, message: "Reunión eliminada junto con sus asistencias." };
}
