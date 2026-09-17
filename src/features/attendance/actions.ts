"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "@/lib/supabase-errors";
import { ROSTER_COLUMNS, toRosterItem } from "./queries";
import { expressRegisterSchema, saveAttendanceSchema, type ExpressRegisterInput, type SaveAttendanceInput } from "./schemas";
import type { ActionResult, RosterItem } from "./types";

type MeetingKey = Pick<SaveAttendanceInput, "agapeId" | "meetingTypeId" | "date" | "topic">;

/** Busca la reunión (ágape + tipo + fecha) y la crea si no existe. El trigger asigna período y valida la ventana. */
async function ensureMeeting(supabase: SupabaseClient, key: MeetingKey): Promise<ActionResult<string>> {
  const find = () =>
    supabase
      .from("meetings")
      .select("id, topic")
      .eq("agape_id", key.agapeId)
      .eq("meeting_type_id", key.meetingTypeId)
      .eq("meeting_date", key.date)
      .maybeSingle();

  const existing = await find();
  if (existing.data) {
    if (existing.data.topic !== key.topic) {
      await supabase.from("meetings").update({ topic: key.topic }).eq("id", existing.data.id);
    }
    return { ok: true, message: "", data: existing.data.id };
  }

  const created = await supabase
    .from("meetings")
    .insert({ agape_id: key.agapeId, meeting_type_id: key.meetingTypeId, meeting_date: key.date, topic: key.topic })
    .select("id")
    .single();

  if (created.error?.code === "23505") {
    // Otro co-líder la creó al mismo tiempo
    const again = await find();
    if (again.data) return { ok: true, message: "", data: again.data.id };
  }
  if (created.error || !created.data) return { ok: false, message: friendlyError(created.error, "No se pudo crear la reunión.") };

  return { ok: true, message: "", data: created.data.id };
}

async function requireSession(supabase: SupabaseClient) {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function saveAttendance(input: SaveAttendanceInput): Promise<ActionResult<{ meetingId: string; saved: number }>> {
  const parsed = saveAttendanceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: z.prettifyError(parsed.error) };

  const supabase = await createClient();
  if (!(await requireSession(supabase))) return { ok: false, message: "Tu sesión expiró. Vuelve a ingresar." };

  const meeting = await ensureMeeting(supabase, parsed.data);
  if (!meeting.ok) return meeting;

  const rows = parsed.data.records.map((r) => ({
    meeting_id: meeting.data,
    adolescent_id: r.adolescentId,
    status: r.status,
  }));

  const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "meeting_id,adolescent_id" });
  if (error) return { ok: false, message: friendlyError(error, "No se pudo guardar la asistencia.") };

  revalidatePath("/asistencia");
  revalidatePath("/inicio");
  return {
    ok: true,
    message: `Asistencia guardada (${rows.length}).`,
    data: { meetingId: meeting.data, saved: rows.length },
  };
}

/** Registro express: crea el adolescente (PENDING si es líder) y lo marca presente en la reunión. */
export async function registerVisitor(input: ExpressRegisterInput): Promise<ActionResult<RosterItem>> {
  const parsed = expressRegisterSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: z.prettifyError(parsed.error) };

  const d = parsed.data;
  const supabase = await createClient();
  if (!(await requireSession(supabase))) return { ok: false, message: "Tu sesión expiró. Vuelve a ingresar." };

  const { data: newId, error: regError } = await supabase.rpc("register_adolescent", {
    p_agape_id: d.agapeId,
    p_clan_id: d.clanId,
    p_first_name: d.firstName,
    p_last_name: d.lastName,
    p_sex: d.sex,
    p_phone: d.phone || null,
    p_guardian: d.guardianPhone ? { phone: d.guardianPhone } : null,
  });
  if (regError || !newId) return { ok: false, message: friendlyError(regError, "No se pudo registrar.") };

  const meeting = await ensureMeeting(supabase, d);
  if (!meeting.ok) return meeting;

  const { error: attError } = await supabase
    .from("attendance")
    .upsert({ meeting_id: meeting.data, adolescent_id: newId as string, status: "present" }, { onConflict: "meeting_id,adolescent_id" });
  if (attError) return { ok: false, message: `Se registró, pero no se marcó la asistencia: ${friendlyError(attError)}` };

  const { data: row } = await supabase.from("v_adolescents").select(ROSTER_COLUMNS).eq("id", newId as string).single();

  revalidatePath("/asistencia");
  revalidatePath("/adolescentes");

  const item = row
    ? toRosterItem(row as Parameters<typeof toRosterItem>[0], { status: "present", is_provisional: row.status === "pending" })
    : null;
  if (!item) return { ok: false, message: "Se registró, recarga la página para verlo." };

  return {
    ok: true,
    message: item.status === "pending" ? `${item.fullName} quedó registrado y pendiente de aprobación.` : `${item.fullName} registrado.`,
    data: item,
  };
}
