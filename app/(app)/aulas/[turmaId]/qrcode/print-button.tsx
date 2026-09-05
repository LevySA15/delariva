"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="fixed right-6 top-6 flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-700 print:hidden"
    >
      <Printer className="h-4 w-4" />
      Imprimir
    </button>
  );
}
