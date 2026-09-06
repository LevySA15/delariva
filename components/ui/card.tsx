import Link from "next/link";

export function Card({
  className = "",
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border border-ink-900/10 bg-white shadow-sm ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardLink({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-lg border border-ink-900/10 bg-white shadow-sm transition hover:border-brand-600/40 hover:shadow-md ${className}`}
    >
      {children}
    </Link>
  );
}
