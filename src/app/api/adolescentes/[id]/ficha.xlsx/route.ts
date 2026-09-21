import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

const empty = (value: string | number | null | undefined) => value ?? "No registrado";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user.role !== "admin") return new NextResponse("No autorizado", { status: 403 });

  const { id } = await params;
  const supabase = await createClient();
  const [{ data: adolescent }, { data: profile }, { data: events }] = await Promise.all([
    supabase.from("v_adolescents").select("full_name, age, birth_date, agape_name, clan_name, guardian_name, guardian_phone, school_name").eq("id", id).single(),
    supabase.from("adolescent_life_profiles").select("*").eq("adolescent_id", id).maybeSingle(),
    supabase.from("adolescent_life_events").select("occurred_on, body").eq("adolescent_id", id).order("occurred_on", { ascending: false }),
  ]);
  if (!adolescent) return new NextResponse("No encontrado", { status: 404 });

  const rows = [
    ["HOJA DE VIDA DEL ADOLESCENTE"], [],
    ["DATOS GENERALES"],
    ["Nombres y apellidos", empty(adolescent.full_name)], ["Edad", empty(adolescent.age)], ["Fecha de nacimiento", empty(adolescent.birth_date)],
    ["Ágape", empty(adolescent.agape_name)], ["Clan", empty(adolescent.clan_name)], ["Apoderado", empty(adolescent.guardian_name)], ["Teléfono apoderado", empty(adolescent.guardian_phone)],
    ["Lugar de nacimiento", empty(profile?.birth_place)], ["Iglesia", empty(profile?.church_name)], ["Distrito de residencia", empty(profile?.district)],
    [], ["FAMILIARES"], ["Nombre del padre", empty(profile?.father_name)], ["Ocupación del padre", empty(profile?.father_occupation)], ["Nombre de la madre", empty(profile?.mother_name)], ["Ocupación de la madre", empty(profile?.mother_occupation)], ["Número de hermanos", empty(profile?.sibling_count)], ["Contexto familiar", empty(profile?.family_context)],
    [], ["SALUD"], ["Condiciones o alergias", empty(profile?.health_conditions)], ["Medicamentos", empty(profile?.medications)],
    [], ["EDUCACIÓN"], ["Centro de estudios", empty(adolescent.school_name)], ["Situación educativa", empty(profile?.education_situation)], ["Dificultades académicas", empty(profile?.academic_difficulties)], ["Actividades e intereses", empty(profile?.hobbies)],
    [], ["Autorización del apoderado", profile?.guardian_consent ? "Sí" : "No"],
  ];
  const book = XLSX.utils.book_new();
  const ficha = XLSX.utils.aoa_to_sheet(rows);
  ficha["!cols"] = [{ wch: 30 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(book, ficha, "Ficha");
  const hechos = XLSX.utils.json_to_sheet((events ?? []).map((event) => ({ Fecha: event.occurred_on, Acontecimiento: event.body })));
  hechos["!cols"] = [{ wch: 15 }, { wch: 90 }];
  XLSX.utils.book_append_sheet(book, hechos, "Hechos relevantes");
  const filename = `ficha-${(adolescent.full_name ?? "adolescente").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.xlsx`;
  return new NextResponse(XLSX.write(book, { type: "buffer", bookType: "xlsx" }), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="${filename}"` } });
}
