"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SaveLifeProfileButton() {
  const { pending } = useFormStatus();

  return (
    <div className="space-y-2">
      <Button type="submit" loading={pending} loadingText="Guardando ficha...">
        Guardar ficha
      </Button>
      <p role="status" aria-live="polite" className="text-sm text-muted">
        {pending ? "Estamos guardando los cambios." : "Al guardar, verás una confirmación y la ficha se actualizará."}
      </p>
    </div>
  );
}
