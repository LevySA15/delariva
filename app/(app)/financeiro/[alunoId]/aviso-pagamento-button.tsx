"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { avisarPagamento, type AvisoState } from "../actions";
import { Button } from "@/components/ui/button";

const initialState: AvisoState = { error: null, sent: false };

export function AvisoPagamentoButton({ mensalidadeId }: { mensalidadeId: string }) {
  const [state, formAction, pending] = useActionState(avisarPagamento.bind(null, mensalidadeId), initialState);

  if (state.sent) {
    return (
      <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
        <Check className="h-3.5 w-3.5" />
        Aviso enviado ao dono
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-3">
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Enviando..." : "Já paguei"}
      </Button>
      {state.error && <p className="mt-1 text-xs text-brand-700">{state.error}</p>}
    </form>
  );
}
