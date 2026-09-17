import { LogOut } from "lucide-react";
import { signOut } from "@/features/auth/actions";

/** Única forma de cerrar sesión: server action (limpia cookies en el servidor y redirige). */
export function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 ${className}`}
      >
        <LogOut className="h-4 w-4" aria-hidden />
        <span>Cerrar sesión</span>
      </button>
    </form>
  );
}
