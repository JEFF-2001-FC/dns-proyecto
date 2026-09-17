"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopProgress } from "@/components/ui/top-progress";
import { cn } from "@/lib/cn";
import { signOut } from "@/features/auth/actions";

export type LogoutUser = {
  name: string;
  email: string | null;
  subtitle: string;
  initials: string;
};

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <>
      <TopProgress active={pending} />
      <Button
        type="submit"
        variant="danger"
        size="lg"
        block
        loading={pending}
        loadingText="Cerrando sesión…"
      >
        Sí, cerrar sesión
      </Button>
    </>
  );
}

/** Contenido de la confirmación: se usa en el diálogo de escritorio y en el menú del celular. */
export function LogoutConfirm({
  user,
  onCancel,
}: {
  user: LogoutUser;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-[#FDE8E4]">
        <LogOut className="h-7 w-7 text-danger" aria-hidden />
      </span>
      <h2 className="mt-4 font-display text-[30px] font-extrabold leading-none">
        ¿Cerrar sesión?
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        Lo que registraste ya está guardado.
        {user.email && (
          <>
            <br />
            Para volver, ingresa con{" "}
            <strong className="text-ink">{user.email}</strong>
          </>
        )}
      </p>

      <div className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-line p-3 text-left">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-bold text-white">
          {user.initials}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-bold">{user.name}</span>
          <span className="block text-sm text-muted">{user.subtitle}</span>
        </span>
      </div>

      <form action={signOut} className="mt-5 w-full">
        <ConfirmButton />
      </form>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        block
        onClick={onCancel}
        className="mt-2.5"
      >
        Seguir en DNS
      </Button>
    </div>
  );
}

/** Botón "Cerrar sesión" que abre una confirmación (modal en escritorio, hoja inferior en celular). */
export function LogoutButton({
  user,
  className,
}: {
  user: LogoutUser;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={cn(
          "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#D6D3CC] transition-colors hover:bg-white/10 hover:text-white",
          className,
        )}
      >
        <LogOut className="h-[18px] w-[18px]" aria-hidden />
        Cerrar sesión
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Cerrar sesión"
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-0 mt-auto w-full max-w-none rounded-t-[28px] bg-white p-0 text-ink open:animate-sheet-up sm:m-auto sm:max-w-md sm:rounded-[28px]"
      >
        <div className="px-5 pb-7 pt-3 sm:p-7">
          <div
            aria-hidden
            className="mx-auto mb-5 h-[5px] w-11 rounded-full bg-line-strong sm:hidden"
          />
          <LogoutConfirm user={user} onCancel={close} />
        </div>
      </dialog>
    </>
  );
}
