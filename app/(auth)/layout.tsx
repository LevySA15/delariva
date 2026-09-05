import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/logo/badge.png" alt="DELARIVA" width={96} height={96} className="mb-3 h-24 w-24" priority />
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Sistema Acadêmico · SAJ</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-ink-900 p-6 shadow-2xl">{children}</div>
      </div>
    </div>
  );
}
