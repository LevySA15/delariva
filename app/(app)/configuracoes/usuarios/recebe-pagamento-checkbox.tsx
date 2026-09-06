"use client";

import { useRef } from "react";
import { atualizarRecebePagamento } from "../actions";

export function RecebePagamentoCheckbox({ userId, checked }: { userId: string; checked: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={atualizarRecebePagamento.bind(null, userId)}>
      <input
        type="checkbox"
        name="recebe_pagamento"
        defaultChecked={checked}
        onChange={() => formRef.current?.requestSubmit()}
        className="h-4 w-4 accent-brand-600"
      />
    </form>
  );
}
