import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center p-6 bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-zinc-950 font-black text-xl">DNS</div>
          <h1 className="text-2xl font-semibold">Ministerio de Adolescentes</h1>
          <p className="mt-2 text-sm text-zinc-400">Ingresa a tu cuenta</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
