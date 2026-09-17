"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Search, UserPlus } from "lucide-react";
import { saveAttendance } from "../actions";
import {
  ATTENDANCE_OPTIONS,
  type AttendanceStatus,
  type ClanOption,
  type RosterItem,
} from "../types";
import { ExpressRegisterDialog } from "./express-register-dialog";

type Props = {
  agapeId: string;
  meetingTypeId: string;
  date: string;
  initialTopic: string;
  roster: RosterItem[];
  clans: ClanOption[];
  editable: boolean;
  readOnlyReason?: string;
};

const TONE: Record<AttendanceStatus, string> = {
  present: "bg-emerald-600 text-white border-emerald-600",
  late: "bg-amber-500 text-white border-amber-500",
  absent: "bg-red-600 text-white border-red-600",
  justified: "bg-sky-600 text-white border-sky-600",
};

export function AttendanceSheet({
  agapeId,
  meetingTypeId,
  date,
  initialTopic,
  roster,
  clans,
  editable,
  readOnlyReason,
}: Props) {
  const [people, setPeople] = useState<RosterItem[]>(roster);
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>(() =>
    Object.fromEntries(roster.map((r) => [r.id, r.attendance ?? "present"])),
  );
  const [topic, setTopic] = useState(initialTopic);
  const [clanFilter, setClanFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [dirty, setDirty] = useState(roster.some((r) => r.attendance === null));
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [saving, startSaving] = useTransition();
  const [expressOpen, setExpressOpen] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people.filter(
      (p) =>
        (clanFilter === "all" || p.clanId === clanFilter) &&
        (!q || p.fullName.toLowerCase().includes(q)),
    );
  }, [people, clanFilter, query]);

  const totals = useMemo(() => {
    const t = { present: 0, late: 0, absent: 0, justified: 0 } as Record<
      AttendanceStatus,
      number
    >;
    for (const p of people) t[marks[p.id] ?? "present"] += 1;
    return t;
  }, [people, marks]);

  const setMark = (id: string, status: AttendanceStatus) => {
    setMarks((m) => ({ ...m, [id]: status }));
    setDirty(true);
    setFeedback(null);
  };

  const markVisible = (status: AttendanceStatus) => {
    setMarks((m) => ({
      ...m,
      ...Object.fromEntries(visible.map((p) => [p.id, status])),
    }));
    setDirty(true);
  };

  const save = () =>
    startSaving(async () => {
      const res = await saveAttendance({
        agapeId,
        meetingTypeId,
        date,
        topic,
        records: people.map((p) => ({
          adolescentId: p.id,
          status: marks[p.id] ?? "present",
        })),
      });
      setFeedback({ ok: res.ok, text: res.message });
      if (res.ok) setDirty(false);
    });

  const onVisitorAdded = (item: RosterItem) => {
    setPeople((list) =>
      [...list, item].sort((a, b) =>
        a.lastName.localeCompare(b.lastName, "es"),
      ),
    );
    setMarks((m) => ({ ...m, [item.id]: "present" }));
    setFeedback({
      ok: true,
      text: `${item.fullName} agregado y marcado presente.`,
    });
  };

  return (
    <div className="pb-24 lg:pb-28">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-zinc-700">
          Tema de la reunión
        </span>
        <input
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setDirty(true);
          }}
          disabled={!editable}
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:border-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/15 disabled:bg-zinc-100"
        />
      </label>

      {!editable && readOnlyReason && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {readOnlyReason}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre"
            aria-label="Buscar adolescente"
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none focus-visible:border-zinc-900"
          />
        </div>
        {editable && (
          <button
            type="button"
            onClick={() => setExpressOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <UserPlus className="h-4 w-4" aria-hidden /> Nuevo
          </button>
        )}
      </div>

      <div
        className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1"
        role="group"
        aria-label="Filtrar por clan"
      >
        {[{ id: "all", name: "Todos", color: "#18181b" }, ...clans].map((c) => {
          const active = clanFilter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={active}
              onClick={() => setClanFilter(c.id)}
              className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-sm ${
                active
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-700"
              }`}
            >
              {c.id !== "all" && (
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
              )}
              {c.name}
            </button>
          );
        })}
      </div>

      {editable && visible.length > 1 && (
        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
          <span>Marcar {visible.length} visibles:</span>
          <button
            type="button"
            onClick={() => markVisible("present")}
            className="font-medium text-emerald-700 underline-offset-2 hover:underline"
          >
            presentes
          </button>
          <button
            type="button"
            onClick={() => markVisible("absent")}
            className="font-medium text-red-700 underline-offset-2 hover:underline"
          >
            faltas
          </button>
        </div>
      )}

      {people.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="font-medium">Este ágape aún no tiene adolescentes</p>
          <p className="mt-1 text-sm text-zinc-500">
            Usa “Nuevo” para registrar a los asistentes de hoy.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {visible.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className="h-8 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: p.clanColor ?? "#d4d4d8" }}
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900">
                    {p.fullName}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {p.clanName ?? "Sin clan"}
                    {p.status === "pending" && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                        Provisional
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div
                role="radiogroup"
                aria-label={`Asistencia de ${p.fullName}`}
                className="grid grid-cols-4 gap-1.5 sm:w-80"
              >
                {ATTENDANCE_OPTIONS.map((o) => {
                  const selected = (marks[p.id] ?? "present") === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={!editable}
                      onClick={() => setMark(p.id, o.value)}
                      className={`h-11 rounded-xl border text-xs font-semibold transition-colors disabled:opacity-60 ${
                        selected
                          ? TONE[o.value]
                          : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      <span className="sm:hidden">{o.short}</span>
                      <span className="hidden sm:inline">{o.label}</span>
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="p-6 text-center text-sm text-zinc-500">
              Nadie coincide con el filtro.
            </li>
          )}
        </ul>
      )}

      {/* Barra fija inferior: resumen + guardar */}
      <div className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur lg:bottom-0 lg:left-64">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="min-w-0 flex-1 text-xs text-zinc-600">
            <p className="font-medium text-zinc-900">
              {totals.present + totals.late} de {people.length} asistieron
            </p>
            <p className="truncate" role="status">
              {feedback ? (
                <span
                  className={feedback.ok ? "text-emerald-700" : "text-red-700"}
                >
                  {feedback.text}
                </span>
              ) : (
                `Tarde ${totals.late}, falta ${totals.absent}, justificado ${totals.justified}${dirty ? ". Sin guardar" : ""}`
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={
              !editable ||
              saving ||
              people.length === 0 ||
              topic.trim().length < 2
            }
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            <Check className="h-4 w-4" aria-hidden />
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>

      {editable && (
        <ExpressRegisterDialog
          open={expressOpen}
          onClose={() => setExpressOpen(false)}
          onAdded={onVisitorAdded}
          clans={clans}
          meeting={{
            agapeId,
            meetingTypeId,
            date,
            topic: topic.trim() || initialTopic,
          }}
          defaultClanId={clanFilter !== "all" ? clanFilter : undefined}
        />
      )}
    </div>
  );
}
