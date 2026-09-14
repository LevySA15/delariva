"use client";

import { useEffect, useState } from "react";

type LoaderState<T> = { status: "loading" } | { status: "done"; data: T } | { status: "error" };

export function PopupLoader<T>({
  load,
  render,
}: {
  load: () => Promise<T>;
  render: (data: T) => React.ReactNode;
}) {
  const [state, setState] = useState<LoaderState<T>>({ status: "loading" });

  useEffect(() => {
    let cancelado = false;
    load()
      .then((data) => {
        if (!cancelado) setState({ status: "done", data });
      })
      .catch(() => {
        if (!cancelado) setState({ status: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [load]);

  if (state.status === "loading") {
    return <p className="py-8 text-center text-sm text-ink-900/40">Carregando...</p>;
  }
  if (state.status === "error") {
    return <p className="py-8 text-center text-sm text-brand-700">Não foi possível carregar.</p>;
  }
  return <>{render(state.data)}</>;
}
