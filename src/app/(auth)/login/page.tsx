import { cookies } from "next/headers";
import { DnsLogo } from "@/components/shared/dns-logo";
import { ToastOnMount } from "@/components/ui/toast";
import { BYE_COOKIE } from "@/features/auth/constants";
import { LoginForm } from "@/features/auth/components/login-form";

const LOGIN_MESSAGES: Record<string, string> = {
  "sin-perfil":
    "Tu cuenta no tiene un perfil asignado. Pide a un administrador que lo active.",
  inactivo: "Tu cuenta está desactivada. Comunícate con un administrador.",
};

type Props = { searchParams: Promise<{ error?: string }> };

function readBye(
  raw: string | undefined,
): { name: string; email: string } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { name?: string; email?: string };
    return { name: parsed.name ?? "", email: parsed.email ?? "" };
  } catch {
    return null;
  }
}

export default async function LoginPage({ searchParams }: Props) {
  const [{ error }, cookieStore] = await Promise.all([searchParams, cookies()]);
  const notice = error ? LOGIN_MESSAGES[error] : undefined;
  const bye = readBye(cookieStore.get(BYE_COOKIE)?.value);

  return (
    <main className="grid min-h-dvh place-items-center bg-black px-5 py-10">
      {bye && (
        <ToastOnMount
          title="Sesión cerrada"
          description={
            bye.name
              ? `¡Hasta pronto, ${bye.name}! Nos vemos pronto.`
              : "¡Hasta pronto! Nos vemos pronto."
          }
        />
      )}

      <div className="w-full max-w-[400px]">
        <div className="mb-7 flex flex-col items-center text-center text-white">
          <DnsLogo className="h-28 w-28 text-white sm:h-32 sm:w-32" />
          <h1 className="mt-4 font-display text-[34px] font-extrabold leading-none">
            Ministerio de Adolescentes
          </h1>
          <p className="mt-2 text-[15px] text-[#A8A49C]">
            Ingresa para continuar
          </p>
        </div>

        {notice && (
          <p
            role="alert"
            className="mb-4 rounded-2xl border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
          >
            {notice}
          </p>
        )}

        <LoginForm defaultEmail={bye?.email ?? ""} />
      </div>
    </main>
  );
}
