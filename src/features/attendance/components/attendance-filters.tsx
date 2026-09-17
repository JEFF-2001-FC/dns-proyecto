"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { addDays, todayLima } from "@/lib/dates";
import type { Option } from "../types";

type Props = {
  agapes: Option[];
  meetingTypes: Option[];
  agapeId: string;
  meetingTypeId: string;
  date: string;
  minDate?: string;
};

const select =
  "h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:border-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/15";

export function AttendanceFilters({ agapes, meetingTypes, agapeId, meetingTypeId, date, minDate }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const today = todayLima();

  const go = (next: Partial<{ agape: string; tipo: string; fecha: string }>) => {
    const params = new URLSearchParams({ agape: agapeId, tipo: meetingTypeId, fecha: date, ...next });
    startTransition(() => router.replace(`/asistencia?${params.toString()}`, { scroll: false }));
  };

  return (
    <div className="grid gap-3 sm:grid-cols-3" aria-busy={pending}>
      <label className="text-sm">
        <span className="mb-1 block font-medium text-zinc-700">Ágape</span>
        <select className={select} value={agapeId} onChange={(e) => go({ agape: e.target.value })}>
          {agapes.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium text-zinc-700">Tipo de reunión</span>
        <select className={select} value={meetingTypeId} onChange={(e) => go({ tipo: e.target.value })}>
          {meetingTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </label>

      <div className="text-sm">
        <label htmlFor="fecha" className="mb-1 block font-medium text-zinc-700">Fecha</label>
        <div className="flex gap-2">
          <input
            id="fecha"
            type="date"
            className={select}
            value={date}
            min={minDate}
            max={today}
            onChange={(e) => e.target.value && go({ fecha: e.target.value })}
          />
          <button
            type="button"
            onClick={() => go({ fecha: date === today ? addDays(today, -7) : today })}
            className="h-11 shrink-0 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50"
          >
            {date === today ? "−7 días" : "Hoy"}
          </button>
        </div>
      </div>
    </div>
  );
}
