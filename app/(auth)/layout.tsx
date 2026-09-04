export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 h-2.5 w-16 rounded-sm bg-brand-600" aria-hidden />
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest text-white">DELARIVA</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">Sistema Acadêmico · SAJ</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-ink-900 p-6 shadow-2xl">{children}</div>
      </div>
    </div>
  );
}
