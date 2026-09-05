"use client";

import { useActionState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmarCheckin, type CheckinState } from "./actions";

const initialState: CheckinState = { status: "idle" };

export function CheckinForm({ turmaId }: { turmaId: string }) {
  const [state, formAction, pending] = useActionState(confirmarCheckin.bind(null, turmaId), initialState);

  if (state.status === "ok" || state.status === "ja_estava") {
    return (
      <div className="flex flex-col items-center gap-2 text-emerald-700">
        <CheckCircle2 className="h-10 w-10" />
        <p className="font-semibold">
          {state.status === "ja_estava" ? "Sua presença já estava registrada hoje." : "Presença registrada!"}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-center gap-3">
      {state.status === "erro" && (
        <div className="flex items-center gap-2 text-brand-700">
          <XCircle className="h-5 w-5" />
          <p className="text-sm">{state.message}</p>
        </div>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Confirmando..." : "Confirmar presença"}
      </Button>
    </form>
  );
}
