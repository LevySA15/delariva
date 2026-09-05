function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

const SIZE_CLASSES = {
  sm: "h-9 w-9 text-xs",
  md: "h-14 w-14 text-lg",
  lg: "h-24 w-24 text-3xl",
} as const;

export function Avatar({
  fullName,
  avatarUrl,
  size = "md",
  className = "",
}: {
  fullName: string;
  avatarUrl?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL externa do Storage, sem domínio fixo pra configurar no next/image
      <img
        src={avatarUrl}
        alt={fullName}
        className={`${SIZE_CLASSES[size]} shrink-0 rounded-full object-cover ring-2 ring-white/10 ${className}`}
      />
    );
  }

  return (
    <span
      className={`flex ${SIZE_CLASSES[size]} shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white ${className}`}
    >
      {initials(fullName)}
    </span>
  );
}
