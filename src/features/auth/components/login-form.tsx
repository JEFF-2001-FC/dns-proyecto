"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { TopProgress } from "@/components/ui/top-progress";
import { login, type LoginState } from "../actions";

export function LoginForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {
      error: null,
      email: defaultEmail,
    },
  );

  return (
    <>
      <TopProgress active={pending} />

      <form
        action={formAction}
        aria-busy={pending}
        className="rounded-[22px] bg-white p-5 sm:p-6"
      >
        {/* fieldset deshabilita todos los campos mientras se verifica */}
        <fieldset disabled={pending} className="flex flex-col gap-4">
          <Field label="Correo" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus={!state.email}
              required
              defaultValue={state.email}
              placeholder="lider@dns.org"
            />
          </Field>

          <Field
            label="Contraseña"
            htmlFor="password"
            aside={
              <a
                href="/forgot-password"
                className="text-sm text-muted underline underline-offset-4 hover:text-ink"
              >
                ¿La olvidaste?
              </a>
            }
          >
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              autoFocus={Boolean(state.email)}
              required
              placeholder="••••••••"
            />
          </Field>

          {state.error && !pending && (
            <p
              role="alert"
              className="rounded-2xl bg-[#FDE8E4] px-4 py-3 text-sm font-medium text-[#9A2A10]"
            >
              {state.error}
            </p>
          )}

          {/* type="submit": Enter en cualquier campo envía el formulario */}
          <Button
            type="submit"
            size="lg"
            block
            loading={pending}
            loadingText="Ingresando…"
            className="mt-1"
          >
            Ingresar
          </Button>
        </fieldset>
      </form>

      <p aria-live="polite" className="mt-4 text-center text-sm text-subtle">
        {pending ? "Verificando tu cuenta…" : "Pulsa Enter para ingresar"}
      </p>
    </>
  );
}
