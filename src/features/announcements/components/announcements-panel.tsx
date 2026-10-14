"use client";

import { FormEvent, useState, useTransition } from "react";
import { Megaphone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAnnouncement } from "../actions";

type Announcement = {
  id: string;
  title: string;
  body: string;
  created_at: string;
};

export function AnnouncementsPanel({
  announcements,
  isAdmin,
}: {
  announcements: Announcement[];
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState<Announcement | null>(null);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = Object.fromEntries(new FormData(form));
    start(async () => {
      const result = await createAnnouncement(raw);
      setMessage(result.message);
      if (result.ok) form.reset();
    });
  }

  return (
    <section className="rounded-[22px] border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <Megaphone className="h-5 w-5" aria-hidden />
          Anuncios
        </h2>
        {isAdmin && (
          <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-bold text-muted">
            Admin
          </span>
        )}
      </div>

      {isAdmin && (
        <form onSubmit={submit} className="mt-4 space-y-2 rounded-2xl bg-paper p-3">
          <input
            name="title"
            required
            maxLength={140}
            placeholder="Título"
            className="h-10 w-full rounded-xl border border-line px-3 text-sm"
          />
          <textarea
            name="body"
            required
            rows={3}
            maxLength={3000}
            placeholder="Anuncio completo"
            className="w-full rounded-xl border border-line px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" loading={pending} loadingText="Publicando...">
              <Plus className="h-4 w-4" aria-hidden />
              Publicar
            </Button>
            {message && <p className="text-xs text-muted">{message}</p>}
          </div>
        </form>
      )}

      {announcements.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Aún no hay anuncios.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {announcements.map((announcement) => (
            <li key={announcement.id}>
              <button
                type="button"
                onClick={() => setOpen(announcement)}
                className="w-full rounded-2xl border border-line bg-paper p-3 text-left hover:bg-white"
              >
                <p className="font-bold">{announcement.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">
                  {announcement.body}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="font-display text-2xl font-bold">{open.title}</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{open.body}</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
