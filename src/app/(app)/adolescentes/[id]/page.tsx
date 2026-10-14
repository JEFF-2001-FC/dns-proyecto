import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Field, Input as UiInput } from "@/components/ui/input";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { addLifeEvent, saveLifeProfile } from "@/features/adolescents/life-actions";

export const metadata = { title: "Ficha del adolescente · DNS" };

export default async function Ficha({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: adolescent }, { data: profile }, { data: events }, { data: followups }] = await Promise.all([
    supabase.from("v_adolescents").select("full_name, age, agape_name, clan_name").eq("id", id).single(),
    supabase.from("adolescent_life_profiles").select("*").eq("adolescent_id", id).maybeSingle(),
    supabase.from("adolescent_life_events").select("id, occurred_on, body").eq("adolescent_id", id).order("occurred_on", { ascending: false }),
    supabase.from("follow_up_notes").select("id, occurred_at, body, type").eq("adolescent_id", id).order("occurred_at", { ascending: false }),
  ]);
  const { data: audit } = user.role === "admin"
    ? await supabase.from("audit_log").select("id, action, table_name, created_at").eq("record_id", id).order("created_at", { ascending: false }).limit(30)
    : { data: [] as { id: number; action: string; table_name: string; created_at: string }[] };

  if (!adolescent) return <p>No se encontró el adolescente.</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ficha de acompañamiento"
        title={adolescent.full_name ?? "Adolescente"}
        description={`${adolescent.agape_name ?? "Sin ágape"} · ${adolescent.clan_name ?? "Sin clan"}${adolescent.age ? ` · ${adolescent.age} años` : ""}`}
        action={
          <div className="flex gap-2">
            {user.role === "admin" && (
              <a href={`/api/adolescentes/${id}/ficha.xlsx`} className="rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white">
                Descargar Excel
              </a>
            )}
            <Link href="/adolescentes" className="rounded-xl border border-line px-3 py-2 text-sm">
              Volver
            </Link>
          </div>
        }
      />

      <form action={saveLifeProfile.bind(null, id)} className="space-y-5">
        <section className="rounded-3xl border border-line bg-[#FFFDF8] p-5">
          <h2 className="font-display text-2xl font-bold text-ink">Datos para completar la ficha</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Completa solo lo que conozcas. Los campos largos sirven para escribir contexto útil para acompañamiento.
          </p>
        </section>

        <Section title="Datos generales" description="Información básica para ubicar mejor al adolescente.">
          <TextField label="Lugar de nacimiento" name="birth_place" value={profile?.birth_place} placeholder="Ej. Lima, Perú" />
          <TextField label="Iglesia o congregación" name="church_name" value={profile?.church_name} placeholder="Ej. DNS, iglesia local, visitante" />
          <TextField label="Distrito o zona donde vive" name="district" value={profile?.district} placeholder="Ej. San Juan de Lurigancho" />
        </Section>

        <Section title="Familia" description="Datos de referencia familiar y convivencia. Si algo no aplica, puedes dejarlo vacío.">
          <TextField label="Nombre del papá" name="father_name" value={profile?.father_name} placeholder="Nombres y apellidos" />
          <TextField label="Ocupación del papá" name="father_occupation" value={profile?.father_occupation} placeholder="Ej. Chofer, comerciante, no registra" />
          <TextField label="Nombre de la mamá" name="mother_name" value={profile?.mother_name} placeholder="Nombres y apellidos" />
          <TextField label="Ocupación de la mamá" name="mother_occupation" value={profile?.mother_occupation} placeholder="Ej. Ama de casa, docente, no registra" />
          <TextField label="Cantidad de hermanos" name="sibling_count" value={profile?.sibling_count?.toString()} type="number" placeholder="Ej. 2" />
          <TextArea
            label="Convivencia y contexto familiar"
            name="family_context"
            value={profile?.family_context}
            placeholder="Ej. Vive con ambos padres, con mamá, con abuelos, situación familiar importante..."
          />
        </Section>

        <Section title="Salud" description="Registra alertas que el equipo debe conocer para cuidar bien al adolescente.">
          <TextArea
            label="Condiciones, alergias o cuidados especiales"
            name="health_conditions"
            value={profile?.health_conditions}
            placeholder="Ej. Asma, alergia a medicamentos, ansiedad, ninguna conocida..."
          />
          <TextArea
            label="Medicamentos"
            name="medications"
            value={profile?.medications}
            placeholder="Ej. Usa inhalador, tratamiento actual, ninguno conocido..."
          />
        </Section>

        <Section title="Educación e intereses" description="Ayuda a entender cómo le va en estudios y qué cosas le motivan.">
          <TextArea
            label="Situación educativa"
            name="education_situation"
            value={profile?.education_situation}
            placeholder="Ej. Secundaria completa, 3ro de secundaria, estudia por las tardes..."
          />
          <TextArea
            label="Dificultades académicas"
            name="academic_difficulties"
            value={profile?.academic_difficulties}
            placeholder="Ej. Le cuesta matemática, inasistencias, problemas de concentración..."
          />
          <TextField label="Actividades e intereses" name="hobbies" value={profile?.hobbies} placeholder="Ej. Fútbol, música, dibujo, danza, videojuegos..." className="sm:col-span-2" />
        </Section>

        <label className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 text-sm">
          <input name="guardian_consent" type="checkbox" defaultChecked={profile?.guardian_consent ?? false} className="mt-1 h-4 w-4 accent-[#E8491D]" />
          <span>
            <span className="block font-semibold text-ink">Confirmo autorización del apoderado</span>
            <span className="text-muted">Marca esto cuando el apoderado autorizó registrar y acompañar esta ficha.</span>
          </span>
        </label>

        <button className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-ink-soft">
          Guardar ficha
        </button>
      </form>

      <section className="rounded-3xl border border-line bg-white p-5">
        <h2 className="font-display text-xl font-bold">Línea de tiempo</h2>
        <p className="mt-1 text-sm text-muted">Agrega acontecimientos importantes o seguimientos puntuales.</p>
        <form action={addLifeEvent.bind(null, id)} className="mt-3 grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)_auto]">
          <Field label="Fecha" htmlFor="occurred_on" hint="Opcional">
            <UiInput id="occurred_on" name="occurred_on" type="date" />
          </Field>
          <Field label="Acontecimiento o seguimiento" htmlFor="body">
            <UiInput id="body" name="body" required placeholder="Ej. Conversación con apoderado, asistencia a evento, situación relevante..." />
          </Field>
          <button className="h-[52px] self-end rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft">
            Agregar
          </button>
        </form>
        <ul className="mt-4 divide-y divide-line">
          {(events ?? []).map((event) => (
            <li key={`life-${event.id}`} className="py-3 text-sm">
              <b>{event.occurred_on}</b> · {event.body}
            </li>
          ))}
          {(followups ?? []).map((event) => (
            <li key={`follow-${event.id}`} className="py-3 text-sm">
              <b>{new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(event.occurred_at))}</b> · Seguimiento ({event.type}): {event.body}
            </li>
          ))}
        </ul>
      </section>

      {user.role === "admin" && (
        <section className="rounded-3xl border border-line bg-white p-5">
          <h2 className="font-display text-xl font-bold">Cambios registrados</h2>
          {(audit ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-muted">Aún no hay cambios automáticos registrados.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {(audit ?? []).map((item) => (
                <li key={item.id} className="py-2 text-sm">
                  <b>{item.action === "insert" ? "Registro creado" : item.action === "update" ? "Registro actualizado" : "Registro eliminado"}</b> · {item.table_name} · {new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at))}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-white p-5">
      <div className="mb-4">
        <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function TextField({
  label,
  name,
  value,
  placeholder,
  type = "text",
  className,
}: {
  label: string;
  name: string;
  value?: string | null;
  placeholder?: string;
  type?: React.ComponentProps<"input">["type"];
  className?: string;
}) {
  return (
    <Field label={label} htmlFor={name} className={className}>
      <UiInput id={name} name={name} type={type} defaultValue={value ?? ""} placeholder={placeholder} />
    </Field>
  );
}

function TextArea({ label, name, value, placeholder }: { label: string; name: string; value?: string | null; placeholder?: string }) {
  return (
    <Field label={label} htmlFor={name}>
      <textarea
        id={name}
        name={name}
        defaultValue={value ?? ""}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-y rounded-2xl border-[1.5px] border-line-strong bg-white px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-subtle focus:border-ink"
      />
    </Field>
  );
}
