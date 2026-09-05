"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, User, Swords } from "lucide-react";
import { buscarGlobal } from "@/app/(app)/search-actions";
import type { SearchResult } from "@/lib/queries/search";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ alunos: SearchResult[]; turmas: SearchResult[] }>({
    alunos: [],
    turmas: [],
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function close() {
    setOpen(false);
    setQuery("");
    setResults({ alunos: [], turmas: [] });
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const termo = query.trim();
    if (termo.length < 2) return;

    const timeout = setTimeout(async () => {
      setLoading(true);
      const r = await buscarGlobal(termo);
      setResults(r);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  function irPara(href: string) {
    close();
    router.push(href);
  }

  const termo = query.trim();
  const alunos = termo.length >= 2 ? results.alunos : [];
  const turmas = termo.length >= 2 ? results.turmas : [];
  const semResultados = !loading && termo.length >= 2 && alunos.length === 0 && turmas.length === 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-white/40 transition hover:border-white/20 hover:text-white/70"
      >
        <Search className="h-4 w-4" />
        Buscar...
        <span className="ml-auto rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white/30">Ctrl K</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-24" onClick={close}>
          <div
            className="w-full max-w-lg rounded-lg border border-ink-900/10 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-ink-900/10 px-4 py-3">
              <Search className="h-4 w-4 text-ink-900/40" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar aluno ou turma..."
                className="flex-1 text-sm text-ink-950 outline-none placeholder:text-ink-900/40"
              />
              <button onClick={close} className="text-ink-900/40 hover:text-ink-900">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {semResultados && <p className="px-3 py-4 text-center text-sm text-ink-900/40">Nada encontrado.</p>}

              {alunos.length > 0 && <ResultGroup label="Alunos" icon={User} items={alunos} onSelect={irPara} />}
              {turmas.length > 0 && <ResultGroup label="Turmas" icon={Swords} items={turmas} onSelect={irPara} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ResultGroup({
  label,
  icon: Icon,
  items,
  onSelect,
}: {
  label: string;
  icon: typeof User;
  items: SearchResult[];
  onSelect: (href: string) => void;
}) {
  return (
    <div className="mb-2">
      <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-900/40">{label}</p>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.href)}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-ink-950/[0.04]"
        >
          <Icon className="h-4 w-4 shrink-0 text-brand-600" />
          <span className="text-ink-950">{item.label}</span>
          {item.sublabel && <span className="ml-auto text-xs text-ink-900/40">{item.sublabel}</span>}
        </button>
      ))}
    </div>
  );
}
