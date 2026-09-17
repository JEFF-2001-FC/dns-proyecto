"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, LogOut, UserRound } from "lucide-react";
import {
  LogoutConfirm,
  type LogoutUser,
} from "@/components/shared/logout-button";
import type { NavItem } from "./nav-config";

/** Menú "Mi cuenta" del celular: accesos extra, perfil y cierre de sesión con confirmación. */
export function AccountSheet({
  user,
  extraItems,
}: {
  user: LogoutUser;
  extraItems: NavItem[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<"menu" | "confirm">("menu");

  const open = () => {
    setStep("menu");
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const rowClass =
    "flex h-14 items-center gap-3 rounded-2xl px-3 text-[15px] font-semibold hover:bg-paper";

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={`Mi cuenta: ${user.name}`}
        className="grid h-10 w-10 place-items-center rounded-full bg-ink-soft text-[13px] font-bold text-white"
      >
        {user.initials}
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Mi cuenta"
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-0 mt-auto w-full max-w-none rounded-t-[28px] bg-white p-0 text-ink open:animate-sheet-up"
      >
        <div className="px-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] pt-3">
          <div
            aria-hidden
            className="mx-auto mb-5 h-[5px] w-11 rounded-full bg-line-strong"
          />

          {step === "confirm" ? (
            <LogoutConfirm user={user} onCancel={() => setStep("menu")} />
          ) : (
            <div className="flex flex-col">
              <div className="mb-3 flex items-center gap-3 px-1">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">
                  {user.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-lg font-bold">
                    {user.name}
                  </span>
                  <span className="block text-sm text-muted">
                    {user.subtitle}
                  </span>
                </span>
              </div>

              {extraItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className={rowClass}
                >
                  <Icon className="h-5 w-5 text-muted" aria-hidden />
                  <span className="flex-1">{label}</span>
                  <ChevronRight className="h-5 w-5 text-subtle" aria-hidden />
                </Link>
              ))}

              <Link href="/perfil" onClick={close} className={rowClass}>
                <UserRound className="h-5 w-5 text-muted" aria-hidden />
                <span className="flex-1">Mi perfil</span>
                <ChevronRight className="h-5 w-5 text-subtle" aria-hidden />
              </Link>

              <button
                type="button"
                onClick={() => setStep("confirm")}
                className={`${rowClass} text-danger`}
              >
                <LogOut className="h-5 w-5" aria-hidden />
                <span className="flex-1 text-left">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
