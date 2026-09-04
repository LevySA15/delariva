export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">DELARIVA</h1>
          <p className="text-sm text-neutral-400">Sistema Acadêmico Jiu-Jitsu · SAJ</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
