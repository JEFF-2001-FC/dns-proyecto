import { DnsLogo } from "@/components/shared/dns-logo";
import { LoginForm } from "@/features/auth/components/login-form";

const LOGIN_MESSAGES: Record<string, string> = {
  "sin-perfil":
    "Tu cuenta no tiene un perfil asignado. Pide a un administrador que lo active.",
  inactivo: "Tu cuenta está desactivada. Comunícate con un administrador.",
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const notice = error ? LOGIN_MESSAGES[error] : undefined;

  return (
    <main className="grid min-h-screen place-items-center bg-black p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <DnsLogo className="mx-auto mb-4 h-32 w-32 text-white sm:h-36 sm:w-36" />
          <h1 className="text-2xl font-semibold">Ministerio de Adolescentes</h1>
          <p className="mt-2 text-sm text-zinc-400">Ingresa a tu cuenta</p>
        </div>

        {notice && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
          >
            {notice}
          </p>
        )}

        <LoginForm />
      </div>
    </main>
  );
}
