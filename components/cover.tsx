export function Cover({ coverUrl, className = "" }: { coverUrl?: string | null; className?: string }) {
  if (coverUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL externa do Storage, sem domínio fixo pra configurar no next/image
      <img src={coverUrl} alt="" className={`h-full w-full object-cover ${className}`} />
    );
  }

  return <div className={`h-full w-full bg-gradient-to-br from-ink-950 to-brand-700 ${className}`} />;
}
