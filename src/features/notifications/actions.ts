"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
export async function markNotificationsRead() { const user = await requireUser(); const supabase = await createClient(); await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null); revalidatePath("/notificaciones"); }
